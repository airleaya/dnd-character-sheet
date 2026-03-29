<script setup lang="ts">
import { ref, computed } from 'vue';
import { useActiveSheetStore } from '../../stores/activeSheet';
import EditableText from '../common/EditableText.vue';
import ProficiencySettingsModal from './ProficiencySettingsModal.vue';
import BioPanel from './BioPanel.vue'; 
import ClassSelector from './ClassSelector.vue';

const store = useActiveSheetStore();

const character = computed(() => store.character);
const xpInput = ref<number | ''>('');
const showProfModal = ref(false);
const showBioModal = ref(false); // 控制 Bio Modal 显隐

const fmt = (num: number | undefined) => num?.toLocaleString() ?? '0';

const handleAddXp = () => {
  const val = Number(xpInput.value);
  if (!val || val <= 0) return;
  store.addExperience(val);
  xpInput.value = '';
};

const handleResetXp = () => {
  if (confirm('⚠️ 警告：确定要重置 XP 吗？\n\nXP 将变为 0，等级将变为 1。此操作无法撤销！')) {
    store.resetExperience();
  }
};

const update = (field: string, val: any) => {
  store.updateProfile(field as any, val);
};
</script>

<template>
  <div class="char-header" v-if="character">
    <div class="avatar-box">
      <div class="avatar-text" v-if="!character.profile.avatarUrl">
        {{ character.profile.name.charAt(0) || '?' }}
      </div>
      <img v-else :src="character.profile.avatarUrl" class="avatar-img" />
    </div>
    
    <div class="info-grid">
      <div class="top-row">
        <div class="name-group">
          <div class="main-name">
            <EditableText 
              :model-value="character.profile.name" 
              @update:model-value="v => update('name', v)"
            />
          </div>
          <div class="player-name">
            <span class="label">玩家:</span>
            <EditableText 
              :model-value="character.profile.playerName || ''" 
              @update:model-value="v => update('playerName', v)"
              placeholder="Your Name"
            />
          </div>
        </div>

        <div class="header-tools">
          <div class="pb-badge" title="熟练加值 (Proficiency Bonus)">
            <span class="label">PB</span>
            <span class="val">+{{ store.proficiencyBonus }}</span>
          </div>
          
          <button class="btn-tool btn-bio" @click="showBioModal = true">
            📝 设定
          </button>

          <button class="btn-tool btn-settings" @click="showProfModal = true">
            ⚙️ 熟练
          </button>
          
          <button class="btn-tool btn-spellbook" @click="store.toggleSpellbook(true)">
            📖 法术
          </button>
        </div>
      </div>
      
      <div class="meta-row">
        <div class="field">
          <label>种族</label>
          <EditableText 
            :model-value="character.profile.race" 
            @update:model-value="v => update('race', v)"
          />
        </div>
        <div class="field">
          <label>职业</label>
          <ClassSelector />
        </div>
        
        <div class="field">
          <label>背景</label>
          <EditableText 
            :model-value="character.profile.background || ''" 
            @update:model-value="v => update('background', v)"
            placeholder="—"
          />
        </div>

        <div class="field">
          <label>阵营</label>
          <EditableText 
            :model-value="character.profile.alignment || ''" 
            @update:model-value="v => update('alignment', v)"
            placeholder="—"
          />
        </div>
        
        <div class="field">
          <label>等级</label>
          <div class="static-value level-value">{{ character.profile.level }}</div>
        </div>

        <div class="field xp-field">
          <div class="xp-adder">
            <input 
              type="number" 
              v-model.number="xpInput" 
              placeholder="Add XP"
              @keyup.enter="handleAddXp"
            />
            <button class="btn-add" @click="handleAddXp" title="增加 XP">+</button>
            <button class="btn-reset" @click="handleResetXp" title="重置 XP">↺</button>
          </div>
          
          <div class="xp-display">
            <span class="current">{{ fmt(character.profile.xp) }}</span>
            <span class="divider">/</span>
            <span class="next">{{ store.nextLevelXp ? fmt(store.nextLevelXp) : 'MAX' }}</span>
            <label>XP</label>
          </div>
        </div>
      </div>
    </div>

    <ProficiencySettingsModal 
      :is-open="showProfModal" 
      @close="showProfModal = false" 
    />
    
    <BioPanel 
      :is-open="showBioModal"
      @close="showBioModal = false"
    />
  </div>
</template>

<style scoped lang="scss">
.char-header {
  display: flex; gap: 1rem; padding-bottom: 1.5rem; border-bottom: 2px solid #2c3e50; margin-bottom: 1.5rem;
  
  .avatar-box {
    width: 80px; height: 80px; background: #eee; border-radius: 8px;
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    overflow: hidden;
    .avatar-text { font-size: 2rem; color: #aaa; font-weight: bold; }
    .avatar-img { width: 100%; height: 100%; object-fit: cover; }
  }
  
  .info-grid {
    flex: 1; display: flex; flex-direction: column; justify-content: space-between;

    .top-row {
      display: flex; justify-content: space-between; align-items: flex-start;
      
      .name-group {
        display: flex; flex-direction: column;
        .main-name { font-size: 1.8rem; font-weight: bold; color: #2c3e50; line-height: 1.2; }
        .player-name { 
          display: flex; align-items: center; gap: 4px; font-size: 0.85rem; color: #7f8c8d; 
          .label { font-size: 0.75rem; opacity: 0.8; }
        }
      }
    }

    .header-tools {
      display: flex; align-items: center; gap: 8px;

      .pb-badge {
        display: flex; flex-direction: column; align-items: center; justify-content: center;
        background: #2c3e50; color: #fff; width: 36px; height: 36px; border-radius: 6px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin-right: 8px;
        .label { font-size: 0.5rem; text-transform: uppercase; opacity: 0.8; }
        .val { font-size: 1rem; font-weight: bold; line-height: 1; }
      }

      /* 统一按钮样式 */
      .btn-tool {
        border: none; padding: 6px 12px; border-radius: 4px; 
        font-weight: bold; cursor: pointer; font-size: 0.9rem;
        transition: all 0.2s; box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        
        &:hover { transform: translateY(-1px); box-shadow: 0 2px 5px rgba(0,0,0,0.15); }
      }

      .btn-settings { background: #ecf0f1; color: #2c3e50; &:hover { background: #dfe6e9; } }
      .btn-spellbook { background: #8e44ad; color: white; &:hover { background: #9b59b6; } }
      /* 新增按钮颜色 */
      .btn-bio { background: #e67e22; color: white; &:hover { background: #f39c12; } }
    }

    .meta-row {
      display: flex; gap: 1.2rem; align-items: flex-end; flex-wrap: wrap;
      .field {
        display: flex; flex-direction: column; gap: 0.2rem;
        label { font-weight: bold; text-transform: uppercase; font-size: 0.7rem; color: #95a5a6; }
        .static-value { font-size: 1rem; padding: 2px 0; min-height: 1.5em; }
        .level-value { font-weight: bold; font-size: 1.2rem; color: #2c3e50; }
      }
      .xp-field { align-items: flex-start; }
      
      /* XP 样式保持不变... */
      .xp-adder {
        display: flex; gap: 4px; margin-bottom: 2px;
        /*防止 Electron 窗口拖拽区域拦截点击事件*/
        -webkit-app-region: no-drag;
        input { width: 90px; border: 1px solid #ccc; border-radius: 4px; padding: 2px 4px; font-size: 0.85rem; }
        button { border: none; border-radius: 4px; width: 22px; height: 22px; cursor: pointer; color: white; display: flex; align-items: center; justify-content: center; }
        .btn-add { background: #27ae60; }
        .btn-reset { background: #e74c3c; }
      }
      .xp-display {
        font-size: 0.85rem; color: #34495e;
        .divider { margin: 0 2px; }
        .next { color: #999; }
      }
    }
  }
}
</style>