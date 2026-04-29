<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { useDataPackStore } from '../../../stores/dataPackStore';
import { DEFAULT_DATA_PACK_ID } from '../../../utils/dataPackUtils';

const props = defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const store = useDataPackStore();
const showCreateForm = ref(false);
const createForm = reactive({
  id: '',
  name: '',
  version: '1.0.0',
  author: '',
  description: '',
  tags: '',
  password: '',
  passwordHint: '',
  localOnly: false,
});

onMounted(() => {
  store.init();
});

const packs = computed(() => store.orderedDataPacks);
const isDefaultPack = (packId: string) => packId === DEFAULT_DATA_PACK_ID;
const createPack = async () => {
  await store.createDraftPack({
    schemaVersion: 1,
    id: createForm.id.trim(),
    name: createForm.name.trim(),
    version: createForm.version.trim(),
    author: createForm.author.trim() || undefined,
    description: createForm.description.trim() || undefined,
    tags: createForm.tags.split(',').map(tag => tag.trim()).filter(Boolean),
  }, {
    password: createForm.password.trim() || undefined,
    passwordHint: createForm.passwordHint.trim() || undefined,
    localOnly: createForm.localOnly,
  });
  showCreateForm.value = false;
  emit('close');
};
</script>

<template>
  <Transition name="modal-fade">
    <div v-if="props.isOpen" class="data-pack-backdrop" @click.self="emit('close')">
      <section class="data-pack-modal" role="dialog" aria-modal="true" aria-label="数据包管理">
        <header class="modal-header">
          <div>
            <h2>数据包管理</h2>
            <p>管理默认数据包与第三方明文数据包。词条接口已预留，当前不参与规则计算。</p>
          </div>
          <button type="button" class="close-btn" @click="emit('close')">×</button>
        </header>

        <div class="toolbar">
          <button type="button" class="primary-btn" :disabled="store.isBusy" @click="showCreateForm = !showCreateForm">
            新建数据包
          </button>
          <button type="button" class="primary-btn" :disabled="store.isBusy" @click="store.importPack">
            导入数据包
          </button>
          <span class="hint">第三方包保存在本机 userData/data-packs/imported。</span>
        </div>

        <form v-if="showCreateForm" class="create-form" @submit.prevent="createPack">
          <h3>新建数据包元数据</h3>
          <label>ID（创建后不可修改）<input v-model="createForm.id" required placeholder="my-campaign-pack" /></label>
          <label>名称<input v-model="createForm.name" required placeholder="我的战役数据包" /></label>
          <label>版本<input v-model="createForm.version" required /></label>
          <label>作者<input v-model="createForm.author" /></label>
          <label>简介<textarea v-model="createForm.description"></textarea></label>
          <label>标签（逗号分隔）<input v-model="createForm.tags" /></label>
          <label>编辑密码<input v-model="createForm.password" type="password" placeholder="默认无需密码" /></label>
          <label>密码提示<input v-model="createForm.passwordHint" /></label>
          <label class="check"><input v-model="createForm.localOnly" type="checkbox" /> 仅本 PC 用户可编辑</label>
          <button type="submit" class="primary-btn">创建并进入制作器</button>
        </form>

        <div class="pack-list">
          <article v-for="(pack, index) in packs" :key="pack.id" class="pack-card" :class="{ builtin: pack.builtin }">
            <div class="pack-main">
              <div class="pack-title-row">
                <h3>{{ pack.name }}</h3>
                <span class="tag" :class="{ builtin: pack.builtin }">{{ pack.builtin ? '内置锁定' : '第三方' }}</span>
              </div>
              <p class="pack-meta">
                ID: {{ pack.id }} · 版本 {{ pack.version }}
                <template v-if="pack.manifest.author"> · 作者 {{ pack.manifest.author }}</template>
              </p>
              <p v-if="pack.manifest.description" class="description">{{ pack.manifest.description }}</p>
              <div class="counts">
                <span>物品 {{ pack.items.length }}</span>
                <span>法术 {{ pack.spells.length }}</span>
                <span>词条 {{ pack.traits.length }}</span>
              </div>
            </div>

            <div class="pack-actions">
              <label class="switch">
                <input
                  type="checkbox"
                  :checked="store.settings.enabledPackIds.includes(pack.id)"
                  @change="store.togglePackEnabled(pack.id)"
                />
                <span>{{ store.settings.enabledPackIds.includes(pack.id) ? '启用' : '禁用' }}</span>
              </label>
              <button type="button" @click="store.exportPack(pack.id)">导出</button>
              <button type="button" :disabled="pack.builtin || index === 0 || packs[index - 1]?.builtin" @click="store.movePack(pack.id, -1)">上移</button>
              <button type="button" :disabled="pack.builtin || index === packs.length - 1 || packs[index + 1]?.builtin" @click="store.movePack(pack.id, 1)">下移</button>
              <button type="button" :disabled="pack.builtin" @click="store.openReservedEditor(pack)">编辑</button>
              <button type="button" class="danger" :disabled="isDefaultPack(pack.id)" @click="store.deletePack(pack.id)">
                删除
              </button>
            </div>
          </article>

          <div v-if="packs.length === 0" class="empty">暂无数据包</div>
        </div>
      </section>
    </div>
  </Transition>
</template>

<style scoped lang="scss">
.data-pack-backdrop {
  position: fixed;
  inset: 0;
  z-index: 9000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.55);
  padding: 24px;
}

.data-pack-modal {
  width: min(880px, 96vw);
  max-height: 86vh;
  display: flex;
  flex-direction: column;
  background: #191d22;
  color: #e8edf2;
  border: 1px solid rgba(100, 124, 148, 0.45);
  border-radius: 16px;
  box-shadow: 0 24px 70px rgba(0, 0, 0, 0.45);
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 20px 22px;
  background: linear-gradient(135deg, #26313b, #16191f);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);

  h2 { margin: 0 0 6px; font-size: 1.2rem; }
  p { margin: 0; color: #aab5c0; font-size: 0.86rem; }
}

.close-btn {
  width: 34px;
  height: 34px;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
  font-size: 1.4rem;
  cursor: pointer;
}

.toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 20px;
  background: #15191e;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.primary-btn,
.pack-actions button {
  border: 1px solid rgba(98, 180, 135, 0.4);
  background: rgba(66, 185, 131, 0.14);
  color: #bdf0d5;
  border-radius: 8px;
  padding: 7px 10px;
  cursor: pointer;

  &:disabled {
    opacity: 0.38;
    cursor: not-allowed;
  }
}

.hint { color: #7f8b96; font-size: 0.78rem; }

.create-form {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  padding: 14px 20px;
  background: #11151a;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);

  h3 { grid-column: 1 / -1; margin: 0; }
  label { display: flex; flex-direction: column; gap: 4px; color: #b9c4ce; font-size: 0.82rem; }
  label.check { flex-direction: row; align-items: center; }
  input, textarea {
    border: 1px solid #39424c;
    border-radius: 7px;
    background: #1c2229;
    color: #fff;
    padding: 7px 9px;
  }
  textarea { min-height: 68px; resize: vertical; }
  button { width: max-content; }
}

.pack-list {
  padding: 16px 20px 20px;
  overflow-y: auto;
}

.pack-card {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 16px;
  padding: 16px;
  margin-bottom: 12px;
  background: #20262d;
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 12px;

  &.builtin { border-color: rgba(216, 195, 106, 0.34); }
}

.pack-title-row { display: flex; align-items: center; gap: 8px; }
.pack-title-row h3 { margin: 0; font-size: 1rem; }
.tag {
  font-size: 0.7rem;
  padding: 2px 7px;
  border-radius: 999px;
  color: #9ed0ff;
  background: rgba(85, 162, 232, 0.14);

  &.builtin {
    color: #f3db82;
    background: rgba(216, 195, 106, 0.13);
  }
}

.pack-meta,
.description {
  margin: 6px 0 0;
  color: #98a5b1;
  font-size: 0.8rem;
}

.counts {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;

  span {
    background: #15191e;
    color: #c6d0da;
    border-radius: 999px;
    padding: 3px 8px;
    font-size: 0.76rem;
  }
}

.pack-actions {
  display: flex;
  align-items: flex-end;
  flex-direction: column;
  gap: 7px;
}

.pack-actions .danger {
  border-color: rgba(236, 112, 99, 0.45);
  background: rgba(236, 112, 99, 0.13);
  color: #ffc3bc;
}

.switch {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #d7e1eb;
  font-size: 0.82rem;
}

.empty {
  padding: 32px;
  text-align: center;
  color: #75808b;
}

.modal-fade-enter-active,
.modal-fade-leave-active { transition: opacity 0.2s ease; }
.modal-fade-enter-from,
.modal-fade-leave-to { opacity: 0; }

@media (max-width: 720px) {
  .pack-card { grid-template-columns: 1fr; }
  .pack-actions { flex-direction: row; flex-wrap: wrap; align-items: center; }
}
</style>
