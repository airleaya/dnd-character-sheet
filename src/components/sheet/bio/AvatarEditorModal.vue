<script setup lang="ts">
import { computed, nextTick, onUnmounted, ref, watch } from 'vue';
import type { CharacterAvatarSize } from '../../../types/Character';
import {
  AVATAR_EDITOR_VIEWPORT,
  AVATAR_OUTPUT_MIME,
  CHARACTER_AVATAR_SPECS,
  clampAvatarTransform,
  getAvatarImagePlacement,
  isSupportedAvatarMime,
  renderAvatarPreviewRenditionFromImage,
  renderAvatarRenditionFromImage,
  type AvatarRendition,
  type AvatarCropTransform,
} from '../../../utils/avatarUtils';

const props = defineProps<{
  file: File | null;
  isOpen: boolean;
}>();

const emit = defineEmits<{
  close: [];
  save: [rendition: AvatarRendition];
}>();

const imageUrl = ref<string | null>(null);
const imageElement = ref<HTMLImageElement | null>(null);
const transform = ref<AvatarCropTransform>({ zoom: 1, offsetX: 0, offsetY: 0 });
const isDragging = ref(false);
const dragStart = ref({ x: 0, y: 0, offsetX: 0, offsetY: 0 });
const previewUrls = ref<Partial<Record<CharacterAvatarSize, string>>>({});
const errorMessage = ref('');

const sizeEntries = computed(() =>
  (['large', 'medium', 'small'] as CharacterAvatarSize[]).map(size => ({
    size,
    ...CHARACTER_AVATAR_SPECS[size],
  }))
);

const placement = computed(() => {
  if (!imageElement.value) return null;
  return getAvatarImagePlacement(
    imageElement.value.naturalWidth,
    imageElement.value.naturalHeight,
    transform.value
  );
});

const editorImageStyle = computed(() => {
  if (!placement.value) return {};
  return {
    width: `${placement.value.displayWidth}px`,
    height: `${placement.value.displayHeight}px`,
    transform: `translate(${placement.value.left}px, ${placement.value.top}px)`,
  };
});

const revokePreviews = () => {
  Object.values(previewUrls.value).forEach(url => {
    if (url) URL.revokeObjectURL(url);
  });
  previewUrls.value = {};
};

const revokeImage = () => {
  if (imageUrl.value) {
    URL.revokeObjectURL(imageUrl.value);
    imageUrl.value = null;
  }
};

const toArrayBuffer = (bytes: Uint8Array): ArrayBuffer => {
  const copy = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(copy).set(bytes);
  return copy;
};

const resetTransform = () => {
  transform.value = { zoom: 1, offsetX: 0, offsetY: 0 };
};

const updatePreviews = async () => {
  if (!imageElement.value) return;
  const nextUrls: Partial<Record<CharacterAvatarSize, string>> = {};

  for (const { size } of sizeEntries.value) {
    const rendition = await renderAvatarPreviewRenditionFromImage(imageElement.value, transform.value, size);
    nextUrls[size] = URL.createObjectURL(new Blob([toArrayBuffer(rendition.bytes)], { type: AVATAR_OUTPUT_MIME }));
  }

  revokePreviews();
  previewUrls.value = nextUrls;
};

let previewTimer: number | null = null;
const schedulePreviewUpdate = () => {
  if (previewTimer !== null) {
    window.clearTimeout(previewTimer);
  }
  previewTimer = window.setTimeout(() => {
    void updatePreviews();
  }, 80);
};

watch(
  () => props.file,
  (file) => {
    revokeImage();
    revokePreviews();
    imageElement.value = null;
    errorMessage.value = '';
    resetTransform();

    if (!file) return;
    if (!isSupportedAvatarMime(file.type)) {
      errorMessage.value = '不支持的图片格式';
      return;
    }

    imageUrl.value = URL.createObjectURL(file);
  },
  { immediate: true }
);

watch(
  () => transform.value,
  () => schedulePreviewUpdate(),
  { deep: true }
);

onUnmounted(() => {
  revokeImage();
  revokePreviews();
  if (previewTimer !== null) {
    window.clearTimeout(previewTimer);
  }
});

const onImageLoad = async (event: Event) => {
  imageElement.value = event.target as HTMLImageElement;
  resetTransform();
  await nextTick();
  await updatePreviews();
};

const applyTransform = (next: AvatarCropTransform) => {
  if (!imageElement.value) {
    transform.value = next;
    return;
  }
  transform.value = clampAvatarTransform(
    imageElement.value.naturalWidth,
    imageElement.value.naturalHeight,
    next
  );
};

const onZoomInput = (event: Event) => {
  const value = Number((event.target as HTMLInputElement).value);
  applyTransform({ ...transform.value, zoom: value });
};

const startDrag = (event: PointerEvent) => {
  if (!imageElement.value) return;
  isDragging.value = true;
  dragStart.value = {
    x: event.clientX,
    y: event.clientY,
    offsetX: transform.value.offsetX,
    offsetY: transform.value.offsetY,
  };
  (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
};

const onDrag = (event: PointerEvent) => {
  if (!isDragging.value) return;
  applyTransform({
    ...transform.value,
    offsetX: dragStart.value.offsetX + event.clientX - dragStart.value.x,
    offsetY: dragStart.value.offsetY + event.clientY - dragStart.value.y,
  });
};

const stopDrag = (event: PointerEvent) => {
  if (!isDragging.value) return;
  isDragging.value = false;
  (event.currentTarget as HTMLElement).releasePointerCapture(event.pointerId);
};

const save = async () => {
  if (!imageElement.value) return;
  const rendition = await renderAvatarRenditionFromImage(imageElement.value, transform.value);
  emit('save', rendition);
};
</script>

<template>
  <Transition name="avatar-editor-fade">
    <div v-if="isOpen" class="avatar-editor-backdrop" @click.self="emit('close')">
      <section class="avatar-editor" role="dialog" aria-modal="true" aria-label="头像编辑器">
        <header class="editor-header">
          <h3>头像编辑</h3>
          <button type="button" class="icon-button" title="关闭" @click="emit('close')">x</button>
        </header>

        <div class="editor-body">
          <div class="crop-panel">
            <div
              class="crop-viewport"
              :class="{ dragging: isDragging }"
              @pointerdown="startDrag"
              @pointermove="onDrag"
              @pointerup="stopDrag"
              @pointercancel="stopDrag"
            >
              <img
                v-if="imageUrl"
                :src="imageUrl"
                class="crop-image"
                :style="editorImageStyle"
                alt=""
                draggable="false"
                @load="onImageLoad"
              />
              <div class="crop-frame"></div>
            </div>

            <div class="editor-controls">
              <label>
                <span>缩放</span>
                <input
                  type="range"
                  min="1"
                  max="3"
                  step="0.01"
                  :value="transform.zoom"
                  @input="onZoomInput"
                />
              </label>
              <button type="button" class="secondary-button" @click="resetTransform">重置</button>
            </div>
          </div>

          <aside class="preview-panel">
            <div v-for="entry in sizeEntries" :key="entry.size" class="preview-row">
              <div class="preview-meta">
                <strong>{{ entry.size }}</strong>
                <span>{{ entry.width }} x {{ entry.height }}</span>
              </div>
              <div
                class="preview-box"
                :style="{ width: `${entry.width}px`, height: `${entry.height}px` }"
              >
                <img v-if="previewUrls[entry.size]" :src="previewUrls[entry.size]" alt="" />
              </div>
            </div>
          </aside>
        </div>

        <p v-if="errorMessage" class="editor-error">{{ errorMessage }}</p>

        <footer class="editor-footer">
          <button type="button" class="secondary-button" @click="emit('close')">取消</button>
          <button type="button" class="primary-button" :disabled="!imageElement" @click="save">保存头像</button>
        </footer>
      </section>
    </div>
  </Transition>
</template>

<style scoped lang="scss">
.avatar-editor-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1300;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  background: var(--color-overlay-backdrop);
}

.avatar-editor {
  width: min(820px, 96vw);
  max-height: 92vh;
  display: flex;
  flex-direction: column;
  background: var(--color-surface-dialog);
  color: var(--color-text-dialog);
  border: 1px solid var(--color-border-dialog);
  border-radius: 8px;
  box-shadow: 0 24px 60px var(--color-shadow-modal);
  overflow: hidden;
}

.editor-header,
.editor-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 1.25rem;
}

.editor-header {
  border-bottom: 1px solid var(--color-border-dialog);

  h3 {
    margin: 0;
    font-size: 1.1rem;
  }
}

.editor-body {
  display: grid;
  grid-template-columns: minmax(320px, 1fr) 220px;
  gap: 1.25rem;
  padding: 1.25rem;
  overflow: auto;
}

.crop-panel {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-width: 0;
}

.crop-viewport {
  position: relative;
  width: 320px;
  height: 426px;
  max-width: 100%;
  margin: 0 auto;
  overflow: hidden;
  background: var(--color-character-avatar-bg);
  border-radius: 8px;
  cursor: grab;
  touch-action: none;
  user-select: none;
  box-shadow: inset 0 0 0 1px var(--color-border-dialog);

  &.dragging {
    cursor: grabbing;
  }
}

.crop-image {
  position: absolute;
  top: 0;
  left: 0;
  max-width: none;
  transform-origin: top left;
  pointer-events: none;
}

.crop-frame {
  position: absolute;
  inset: 0;
  pointer-events: none;
  box-shadow:
    inset 0 0 0 2px var(--color-border-focus),
    inset 0 0 0 999px color-mix(in srgb, var(--color-character-avatar-action-bg) 18%, transparent);
}

.editor-controls {
  display: flex;
  align-items: center;
  gap: 1rem;

  label {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex: 1;
  }

  input[type='range'] {
    flex: 1;
  }
}

.preview-panel {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.preview-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.preview-meta {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  color: var(--color-text-dialog-muted);

  strong {
    color: var(--color-text-dialog);
    text-transform: uppercase;
  }

  span {
    font-size: 0.8rem;
  }
}

.preview-box {
  flex-shrink: 0;
  overflow: hidden;
  border-radius: 6px;
  background: var(--color-character-avatar-bg);
  box-shadow: 0 0 0 1px var(--color-border-dialog);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
}

.editor-error {
  margin: 0 1.25rem;
  color: var(--color-status-danger-solid);
}

.editor-footer {
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
}

.secondary-button {
  background: var(--color-character-avatar-bg);
  color: var(--color-text-dialog);
}

.primary-button {
  background: var(--color-action-primary-bg);
  color: var(--color-action-primary-text);

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.avatar-editor-fade-enter-active,
.avatar-editor-fade-leave-active {
  transition: opacity 0.2s ease;
}

.avatar-editor-fade-enter-from,
.avatar-editor-fade-leave-to {
  opacity: 0;
}

@media (max-width: 760px) {
  .editor-body {
    grid-template-columns: 1fr;
  }

  .preview-panel {
    flex-direction: row;
    flex-wrap: wrap;
  }
}
</style>
