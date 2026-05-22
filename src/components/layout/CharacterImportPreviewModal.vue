<script setup lang="ts">
import type { CharacterImportPreview } from '../../utils/characterPackagePreview';

defineProps<{
  preview: CharacterImportPreview | null;
}>();

const emit = defineEmits<{
  confirm: [];
  cancel: [];
}>();

const formatLabel: Record<CharacterImportPreview['format'], string> = {
  'backup-json': '角色备份 JSON',
  'legacy-json': '旧版角色 JSON',
  'legacy-dndchar': '旧版 dndchar',
};
</script>

<template>
  <Transition name="import-preview-fade">
    <div v-if="preview" class="import-preview-backdrop" @click.self="emit('cancel')">
      <section class="import-preview-modal" role="dialog" aria-modal="true" aria-label="导入角色预览">
        <header class="import-preview-header">
          <h3>导入角色</h3>
          <button type="button" class="icon-button" title="关闭" @click="emit('cancel')">×</button>
        </header>

        <div class="import-preview-body">
          <div class="import-preview-avatar">
            <img v-if="preview.avatarObjectUrl" :src="preview.avatarObjectUrl" alt="" />
            <span v-else>{{ preview.name.charAt(0) || '?' }}</span>
          </div>

          <div class="import-preview-info">
            <p class="preview-kicker">{{ formatLabel[preview.format] }}</p>
            <h4>{{ preview.name }}</h4>
            <div class="preview-meta">Lv.{{ preview.level }} {{ preview.race }}</div>
            <div class="preview-file">{{ preview.fileName }}</div>
          </div>
        </div>

        <footer class="import-preview-actions">
          <button type="button" class="secondary-button" @click="emit('cancel')">跳过</button>
          <button type="button" class="primary-button" @click="emit('confirm')">导入</button>
        </footer>
      </section>
    </div>
  </Transition>
</template>

<style scoped lang="scss">
.import-preview-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1350;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  background: var(--color-surface-overlay);
}

.import-preview-modal {
  width: min(520px, 94vw);
  background: var(--color-surface-dialog);
  color: var(--color-text-dialog);
  border: 1px solid var(--color-border-dialog);
  border-radius: 8px;
  box-shadow: 0 24px 60px var(--color-shadow-modal);
  overflow: hidden;
}

.import-preview-header,
.import-preview-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 1.25rem;
}

.import-preview-header {
  border-bottom: 1px solid var(--color-border-dialog);
}

.import-preview-header h3 {
  margin: 0;
  font-size: 1.1rem;
}

.import-preview-body {
  display: flex;
  gap: 1rem;
  padding: 1.25rem;
  align-items: center;
}

.import-preview-avatar {
  width: 80px;
  height: 107px;
  flex: 0 0 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 6px;
  background: var(--color-character-avatar-bg);
  color: var(--color-text-dialog-muted);
  box-shadow: inset 0 0 0 1px var(--color-border-dialog);
  font-size: 1.6rem;
  font-weight: 800;
}

.import-preview-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.import-preview-info {
  min-width: 0;
}

.preview-kicker {
  margin: 0 0 0.35rem;
  color: var(--color-text-dialog-muted);
  font-size: 0.78rem;
  font-weight: 800;
}

.import-preview-info h4 {
  margin: 0;
  font-size: 1.3rem;
  line-height: 1.2;
}

.preview-meta {
  margin-top: 0.35rem;
  color: var(--color-text-dialog-message);
  font-weight: 700;
}

.preview-file {
  margin-top: 0.7rem;
  color: var(--color-text-dialog-muted);
  font-size: 0.82rem;
  overflow-wrap: anywhere;
}

.import-preview-actions {
  justify-content: flex-end;
  border-top: 1px solid var(--color-border-dialog);
}

.icon-button,
.secondary-button,
.primary-button {
  border: 0;
  border-radius: 6px;
  cursor: pointer;
}

.icon-button {
  width: 2rem;
  height: 2rem;
  background: transparent;
  color: var(--color-text-dialog-muted);
}

.secondary-button,
.primary-button {
  padding: 0.55rem 0.9rem;
  font-weight: 800;
}

.secondary-button {
  background: var(--color-character-avatar-bg);
  color: var(--color-text-dialog);
}

.primary-button {
  background: var(--color-action-primary-bg);
  color: var(--color-action-primary-text);
}

.import-preview-fade-enter-active,
.import-preview-fade-leave-active {
  transition: opacity 0.2s ease;
}

.import-preview-fade-enter-from,
.import-preview-fade-leave-to {
  opacity: 0;
}
</style>
