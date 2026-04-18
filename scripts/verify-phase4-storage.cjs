const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const getLegacySavesDir = cwd => path.join(cwd, 'saves');
const getLegacyWindowConfigPath = cwd => path.join(cwd, 'window-config.json');
const getSavesDir = userDataRoot => path.join(userDataRoot, 'saves');
const getWindowConfigPath = userDataRoot => path.join(userDataRoot, 'window-config.json');

const ensureDirectoryExists = dirPath => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

const directoryHasJsonFiles = dirPath => {
  if (!fs.existsSync(dirPath)) return false;
  return fs.readdirSync(dirPath).some(file => file.endsWith('.json'));
};

const copyDirectoryContents = (sourceDir, targetDir) => {
  if (!fs.existsSync(sourceDir)) return;

  ensureDirectoryExists(targetDir);
  const entries = fs.readdirSync(sourceDir, { withFileTypes: true });

  for (const entry of entries) {
    const sourcePath = path.join(sourceDir, entry.name);
    const targetPath = path.join(targetDir, entry.name);

    if (entry.isDirectory()) {
      copyDirectoryContents(sourcePath, targetPath);
      continue;
    }

    if (!fs.existsSync(targetPath)) {
      fs.copyFileSync(sourcePath, targetPath);
    }
  }
};

const migrateLegacyStorageIfNeeded = ({ cwd, userDataRoot }) => {
  const savesDir = getSavesDir(userDataRoot);
  const legacySavesDir = getLegacySavesDir(cwd);
  const windowConfigPath = getWindowConfigPath(userDataRoot);
  const legacyWindowConfigPath = getLegacyWindowConfigPath(cwd);

  ensureDirectoryExists(savesDir);

  if (!directoryHasJsonFiles(savesDir) && directoryHasJsonFiles(legacySavesDir)) {
    copyDirectoryContents(legacySavesDir, savesDir);
  }

  if (!fs.existsSync(windowConfigPath) && fs.existsSync(legacyWindowConfigPath)) {
    ensureDirectoryExists(path.dirname(windowConfigPath));
    fs.copyFileSync(legacyWindowConfigPath, windowConfigPath);
  }
};

const resolveActiveSavesDir = ({ cwd, userDataRoot }) => {
  const preferredSavesDir = getSavesDir(userDataRoot);
  const fallbackSavesDir = getLegacySavesDir(cwd);

  return directoryHasJsonFiles(preferredSavesDir) ? preferredSavesDir : fallbackSavesDir;
};

const withSandbox = run => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'dnd-phase4-storage-'));
  const cwd = path.join(root, 'workspace');
  const userDataRoot = path.join(root, 'userData');

  ensureDirectoryExists(cwd);
  ensureDirectoryExists(userDataRoot);

  try {
    run({ cwd, root, userDataRoot });
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
};

const writeJson = (filePath, value) => {
  ensureDirectoryExists(path.dirname(filePath));
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2), 'utf8');
};

const tests = [
  {
    name: 'migrates legacy saves and window config on first run',
    run: () => {
      withSandbox(({ cwd, userDataRoot }) => {
        const legacySavesDir = getLegacySavesDir(cwd);
        const userDataSavesDir = getSavesDir(userDataRoot);
        const legacyConfigPath = getLegacyWindowConfigPath(cwd);
        const userDataConfigPath = getWindowConfigPath(userDataRoot);

        writeJson(path.join(legacySavesDir, 'hero.json'), { id: 'hero', profile: { name: 'Hero' } });
        writeJson(path.join(legacySavesDir, 'nested', 'villain.json'), {
          id: 'villain',
          profile: { name: 'Villain' },
        });
        fs.writeFileSync(legacyConfigPath, JSON.stringify({ width: 1440, height: 900 }), 'utf8');

        migrateLegacyStorageIfNeeded({ cwd, userDataRoot });

        assert.equal(fs.existsSync(path.join(userDataSavesDir, 'hero.json')), true);
        assert.equal(fs.existsSync(path.join(userDataSavesDir, 'nested', 'villain.json')), true);
        assert.deepEqual(JSON.parse(fs.readFileSync(userDataConfigPath, 'utf8')), {
          width: 1440,
          height: 900,
        });
        assert.equal(resolveActiveSavesDir({ cwd, userDataRoot }), userDataSavesDir);
      });
    },
  },
  {
    name: 'falls back to legacy saves before migration data exists in userData',
    run: () => {
      withSandbox(({ cwd, userDataRoot }) => {
        const legacySavesDir = getLegacySavesDir(cwd);

        writeJson(path.join(legacySavesDir, 'legacy-only.json'), {
          id: 'legacy-only',
          profile: { name: 'Legacy Only' },
        });

        assert.equal(resolveActiveSavesDir({ cwd, userDataRoot }), legacySavesDir);
      });
    },
  },
  {
    name: 'does not overwrite existing userData files',
    run: () => {
      withSandbox(({ cwd, userDataRoot }) => {
        const legacySavesDir = getLegacySavesDir(cwd);
        const userDataSavesDir = getSavesDir(userDataRoot);
        const legacyConfigPath = getLegacyWindowConfigPath(cwd);
        const userDataConfigPath = getWindowConfigPath(userDataRoot);

        writeJson(path.join(legacySavesDir, 'hero.json'), { id: 'legacy-hero', profile: { name: 'Legacy Hero' } });
        writeJson(path.join(userDataSavesDir, 'hero.json'), {
          id: 'user-data-hero',
          profile: { name: 'UserData Hero' },
        });
        fs.writeFileSync(legacyConfigPath, JSON.stringify({ width: 900, height: 700 }), 'utf8');
        fs.writeFileSync(userDataConfigPath, JSON.stringify({ width: 1600, height: 1000 }), 'utf8');

        migrateLegacyStorageIfNeeded({ cwd, userDataRoot });

        assert.deepEqual(JSON.parse(fs.readFileSync(path.join(userDataSavesDir, 'hero.json'), 'utf8')), {
          id: 'user-data-hero',
          profile: { name: 'UserData Hero' },
        });
        assert.deepEqual(JSON.parse(fs.readFileSync(userDataConfigPath, 'utf8')), {
          width: 1600,
          height: 1000,
        });
      });
    },
  },
];

for (const test of tests) {
  test.run();
  console.log(`PASS ${test.name}`);
}

console.log(`Verified ${tests.length} Phase 4 storage migration checks.`);
