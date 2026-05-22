import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { APP_THEME_OPTIONS } from '../src/utils/appTheme';

const rootDir = process.cwd();
const themeColorPath = join(rootDir, 'src', 'styles', 'theme-colors.css');
const themeVariablePath = join(rootDir, 'src', 'styles', 'theme.css');
const stylePath = join(rootDir, 'src', 'style.css');
const componentDir = join(rootDir, 'src', 'components');

const readText = (path: string) => readFileSync(path, 'utf8');

const extractBlock = (css: string, selector: RegExp | string) => {
  const match = typeof selector === 'string'
    ? { index: css.indexOf(selector), label: selector }
    : selector.exec(css);
  const start = match?.index ?? -1;
  const label = typeof selector === 'string' ? selector : selector.source;

  expect(start, `${selector} block should exist`).toBeGreaterThanOrEqual(0);

  const open = css.indexOf('{', start);
  expect(open, `${label} block should open`).toBeGreaterThanOrEqual(0);

  let depth = 0;
  for (let index = open; index < css.length; index += 1) {
    const char = css[index];
    if (char === '{') depth += 1;
    if (char === '}') {
      depth -= 1;
      if (depth === 0) {
        return css.slice(open + 1, index);
      }
    }
  }

  throw new Error(`${label} block should close`);
};

const extractThemeDeclarations = (block: string) =>
  Array.from(block.matchAll(/--theme-[a-z0-9-]+:\s*(#[0-9a-fA-F]{3,8});/g)).map(match => ({
    name: match[0].split(':')[0].trim(),
    value: match[1].toLowerCase(),
  }));

const listFiles = (dir: string, extensions: string[]): string[] =>
  readdirSync(dir).flatMap(entry => {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      return listFiles(fullPath, extensions);
    }
    return extensions.some(extension => fullPath.endsWith(extension)) ? [fullPath] : [];
  });

describe('frontend theme color structure', () => {
  it('keeps all app themes as matching 40-color theme palettes', () => {
    const css = readText(themeColorPath);
    const classic = extractThemeDeclarations(extractBlock(css, /:root,\s*:root\[data-theme="classic"\]/));
    const themes = APP_THEME_OPTIONS.map(option => {
      const selector = option.id === 'classic'
        ? /:root,\s*:root\[data-theme="classic"\]/
        : `:root[data-theme="${option.id}"]`;
      return {
        id: option.id,
        declarations: extractThemeDeclarations(extractBlock(css, selector)),
      };
    });

    expect(classic).toHaveLength(40);
    expect(themes).toHaveLength(APP_THEME_OPTIONS.length);
    themes.forEach(theme => {
      expect(theme.declarations, `${theme.id} should contain 40 colors`).toHaveLength(40);
      expect(theme.declarations.map(entry => entry.name)).toEqual(classic.map(entry => entry.name));
      expect(new Set(theme.declarations.map(entry => entry.value)).size).toBe(40);
    });
  });

  it('keeps UI variable definitions free of direct color literals', () => {
    const css = readText(themeVariablePath);
    const [uiVariableLayer, contentFallbackLayer] = css.split('/* Content color fallbacks:');

    expect(uiVariableLayer).toBeTruthy();
    expect(contentFallbackLayer).toBeTruthy();
    expect(uiVariableLayer).not.toMatch(/#[0-9a-fA-F]{3,8}|rgba?\(|hsla?\(/);
    expect(contentFallbackLayer).toMatch(/--content-magic-/);
  });

  it('keeps frontend component styles behind color or content variables', () => {
    const files = [stylePath, ...listFiles(componentDir, ['.vue', '.css'])];
    const directLiteralPattern = /#[0-9a-fA-F]{3,8}|rgba?\(|hsla?\(/;
    const baseLayerReferencePattern = /var\(--(?:palette|theme)-/;
    const offenders = files.flatMap(file => {
      const text = readText(file);
      const issues: string[] = [];
      if (directLiteralPattern.test(text)) issues.push('direct literal');
      if (baseLayerReferencePattern.test(text)) issues.push('base layer reference');
      return issues.map(issue => `${file}: ${issue}`);
    });

    expect(offenders).toEqual([]);
  });
});
