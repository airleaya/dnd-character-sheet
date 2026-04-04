<script setup lang="ts">
import { ref, computed } from 'vue';
import { useActiveSheetStore } from '../../../stores/activeSheet';
import EditableText from '../../common/EditableText.vue';
import ProficiencySettingsModal from './../modals/ProficiencySettingsModal.vue';
import BioPanel from './../bio/BioPanel.vue'; 
import ClassSelector from './../bio/ClassSelector.vue';
import XpProgressBar from './XpProgressBar.vue';
import AlignmentPicker from './AlignmentPicker.vue';

const store = useActiveSheetStore();

const character = computed(() => store.character);
// const xpInput = ref<number | ''>(''); 已移动至XpProgressBar中
const showProfModal = ref(false);
const showBioModal = ref(false); // 控制 Bio Modal 显隐

const fmt = (num: number | undefined) => num?.toLocaleString() ?? '0';

// const handleAddXp 已移动至XpProgressBar中
// const handleResetXp 已移动至XpProgressBar中

const update = (field: string, val: any) => {
  store.updateProfile(field as any, val);
};
</script>

<template>
  <div class="char-header" v-if="character">
    <div class="avatar-col">
      <div class="avatar-box">
        <div class="avatar-text" v-if="!character.profile.avatarUrl">
          {{ character.profile.name.charAt(0) || '?' }}
        </div>
        <img v-else :src="character.profile.avatarUrl" class="avatar-img" />
      </div>
    </div>
    
    <div class="middle-col">
      <div class="row-name-alignment">
        <div class="main-name">
          <EditableText 
            :model-value="character.profile.name" 
            @update:model-value="v => update('name', v)"
          />
        </div>
        <AlignmentPicker 
          :model-value="character.profile.alignment"
          @update:model-value="v => update('alignment', v)"
        />
      </div>
      
      <div class="row-player-name">
        <span class="label">玩家:</span>
        <EditableText 
          :model-value="character.profile.playerName || ''" 
          @update:model-value="v => update('playerName', v)"
          placeholder="Your Name"
        />
      </div>

      <div class="row-info">
        <div class="field">
          <label>种族</label>
          <EditableText 
            :model-value="character.profile.race" 
            @update:model-value="v => update('race', v)"
          />
        </div>
        <div class="field">
          <label>背景</label>
          <EditableText 
            :model-value="character.profile.background || ''" 
            @update:model-value="v => update('background', v)"
            placeholder="—"
          />
        </div>
        <div class="field class-span">
          <label>职业</label>
          <ClassSelector />
        </div>
      </div>

      <div class="row-progress">
        <div class="field level-field">
          <label>等级</label>
          <div class="static-value level-value">{{ character.profile.level }}</div>
        </div>
        <div class="field xp-field">
          <XpProgressBar />
        </div>
      </div>
    </div>

    <div class="action-col">
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
  display: flex; gap: 2rem; padding-bottom: 1.5rem; border-bottom: 2px solid #ecf0f1; margin-bottom: 1.5rem;
  align-items: stretch;

  /* 1. 左侧头像区：放大并撑满高度 */
  .avatar-col {
    display: flex;
    flex-shrink: 0;
    width: 160px; /* 放大头像区宽度 */
    
    .avatar-box {
      width: 100%; 
      height: 0; /* 高度设为 0，靠 padding 撑开 */
      padding-top: 133.33%; /* 3 / 4 = 75%, 实现 4:3 的比例 */
      position: relative; /* 为内部元素提供定位基准 */
      background: #eee; border-radius: 8px;
      display: flex; align-items: center; justify-content: center;
      overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05);
      .avatar-text, .avatar-img {
        position: absolute;
        top: 0; left: 0;
        width: 100%; height: 100%;
        display: flex; align-items: center; justify-content: center;
      }
    }
  }

  /* 2. 中部核心信息区：四行垂直布局 */
  .middle-col {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between; /* 均匀分布四行 */

    /* 第一行：角色名与阵营 */
    .row-name-alignment {
      display: flex;
      align-items: center; /* 居中对齐，让气泡在名字旁边 */
      gap: 1rem;
      
      .main-name { 
        font-size: 1.8rem; /* 放大主角名突出核心 */
        font-weight: 900; 
        color: #2c3e50; 
        line-height: 1.1; 
      }
      
    }

    /* 第二行：玩家名作为附属，紧贴第一行 */
    .row-player-name {
      display: flex; 
      align-items: center; 
      gap: 4px; 
      font-size: 0.85rem; 
      color: #95a5a6; /* 使用灰阶弱化 */
      margin-top: -6px; /* 负边距拉近与角色名的距离，形成附属感 */
      margin-bottom: 0.8rem; /* 与下方设定拉开一点距离 */
      
      .label { font-size: 0.75rem; opacity: 0.7; }
    }

    /* 第三行：种族、背景、职业 */
    .row-info {
      display: flex;
      gap: 2.5rem; /* 控制字段横向间距 */
      align-items: flex-start;
      
      .field {
        display: flex; flex-direction: column; gap: 0.2rem;
        label { font-weight: bold; text-transform: uppercase; font-size: 0.7rem; color: #95a5a6; }
      }
      .class-span { flex: 1; } /* 职业占据剩余空间，避免折行 */
    }

    /* 第四行：等级与经验条 */
    .row-progress {
      display: flex;
      gap: 1.5rem;
      align-items: flex-end; /* 底部对齐，让等级数字和进度条在一条视觉水平线上 */
      margin-top: 0.5rem;
      
      .field {
        display: flex; flex-direction: column; gap: 0.2rem;
        label { font-weight: bold; text-transform: uppercase; font-size: 0.7rem; color: #95a5a6; }
      }
      .level-value { font-weight: bold; font-size: 1.5rem; color: #2c3e50; line-height: 1; }
      .xp-field { flex: 1; width: 100%; padding-bottom: 2px; } /* XP条撑满剩余宽度 */
    }
  }

  /* 3. 右侧操作区：整齐划一的工具栏风格 */
  .action-col {
    display: flex; flex-direction: column; align-items: stretch; gap: 8px;
    width: 110px; /* 固定右侧栏宽度，确保所有按钮等宽 */
    flex-shrink: 0;

    .pb-badge {
      display: flex; justify-content: center; align-items: center; gap: 6px;
      background: #34495e; color: #fff; height: 34px; border-radius: 6px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1); 
      .label { font-size: 0.7rem; text-transform: uppercase; opacity: 0.8; }
      .val { font-size: 1.1rem; font-weight: bold; }
    }

    .btn-tool {
      width: 100%; height: 34px; /* 统一高度 */
      display: flex; justify-content: center; align-items: center;
      border: none; border-radius: 6px; 
      font-weight: bold; cursor: pointer; font-size: 0.85rem;
      transition: all 0.2s; box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      
      &:hover { transform: translateY(-1px); box-shadow: 0 2px 5px rgba(0,0,0,0.15); filter: brightness(1.05); }
    }

    /* 调整配色，使其和谐且不刺眼 */
    .btn-bio { background: #e67e22; color: white; }
    .btn-settings { background: #ecf0f1; color: #2c3e50; }
    .btn-spellbook { background: #9b59b6; color: white; }
  }
}
</style>