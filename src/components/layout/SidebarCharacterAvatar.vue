<script setup lang="ts">
import { computed } from 'vue';
import type { CharacterAvatar } from '../../types/Character';
import { useAvatarObjectUrl } from '../../composables/useAvatarObjectUrl';

const props = defineProps<{
  characterId: string;
  name: string;
  avatar?: CharacterAvatar;
  avatarUrl?: string;
}>();

const { imageUrl } = useAvatarObjectUrl(() => ({
  characterId: props.characterId,
  avatar: props.avatar,
  avatarUrl: props.avatarUrl,
}));

const fallbackInitial = computed(() => props.name.trim().charAt(0) || '?');
</script>

<template>
  <div class="sidebar-character-avatar" aria-hidden="true">
    <img v-if="imageUrl" :src="imageUrl" alt="" />
    <span v-else>{{ fallbackInitial }}</span>
  </div>
</template>

<style scoped lang="scss">
.sidebar-character-avatar {
  width: 40px;
  height: 53px;
  flex: 0 0 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 6px;
  background: var(--color-character-avatar-bg);
  color: var(--color-shell-left-text-muted);
  box-shadow: inset 0 0 0 1px var(--color-shell-left-border);
  font-size: 1rem;
  font-weight: 800;
  line-height: 1;
}

.sidebar-character-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
</style>
