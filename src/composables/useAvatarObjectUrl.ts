import { computed, onUnmounted, ref, watch, type MaybeRefOrGetter, toValue } from 'vue';
import type { CharacterAvatar, CharacterAvatarSize } from '../types/Character';
import { avatarService } from '../services/avatarService';

interface AvatarSource {
  characterId: string;
  avatar?: CharacterAvatar;
  avatarUrl?: string;
}

export const useAvatarObjectUrl = (
  source: MaybeRefOrGetter<AvatarSource>,
  size: CharacterAvatarSize = 'large'
) => {
  const objectUrl = ref<string | null>(null);
  const failedAssetKey = ref<string | null>(null);

  const revokeObjectUrl = () => {
    if (objectUrl.value) {
      URL.revokeObjectURL(objectUrl.value);
      objectUrl.value = null;
    }
  };

  watch(
    () => {
      const current = toValue(source);
      return {
        characterId: current.characterId,
        assetId: current.avatar?.assetId,
        avatarUrl: current.avatarUrl,
      };
    },
    async ({ characterId, assetId }) => {
      revokeObjectUrl();
      failedAssetKey.value = null;
      const current = toValue(source);
      if (!current.avatar || !assetId) return;

      try {
        objectUrl.value = await avatarService.readAvatarObjectUrl(characterId, current.avatar, size);
      } catch {
        failedAssetKey.value = `${characterId}:${assetId}`;
        objectUrl.value = null;
      }
    },
    { immediate: true }
  );

  onUnmounted(revokeObjectUrl);

  const imageUrl = computed(() => {
    const current = toValue(source);
    if (objectUrl.value) return objectUrl.value;
    if (current.avatarUrl) return current.avatarUrl;
    return null;
  });

  return {
    imageUrl,
    failedAssetKey,
    revokeObjectUrl,
  };
};
