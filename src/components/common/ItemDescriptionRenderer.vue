<script setup lang="ts">
import type { ItemDescriptionBlock } from '../../types/Library';

defineProps<{
  description?: string;
  blocks?: ItemDescriptionBlock[];
  preferPlainDescription?: boolean;
}>();
</script>

<template>
  <div class="item-description">
    <template v-if="blocks?.length && !(preferPlainDescription && description?.trim())">
      <template v-for="(block, index) in blocks" :key="index">
        <p v-if="block.type === 'paragraph'" class="desc-paragraph preserve-user-lines">{{ block.text }}</p>
        <ul v-else-if="block.type === 'list'" class="desc-list">
          <li v-for="(entry, entryIndex) in block.items" :key="entryIndex" class="preserve-user-lines">{{ entry }}</li>
        </ul>
        <div v-else-if="block.type === 'table'" class="desc-table-wrap">
          <div v-if="block.caption" class="desc-table-caption">{{ block.caption }}</div>
          <table class="desc-table">
            <thead>
              <tr>
                <th v-for="column in block.columns" :key="column">{{ column }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, rowIndex) in block.rows" :key="rowIndex">
                <td v-for="(cell, cellIndex) in row" :key="cellIndex" class="preserve-user-lines">{{ cell }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>
    </template>
    <p v-else class="desc-paragraph preserve-user-lines">{{ description }}</p>
  </div>
</template>

<style scoped>
.item-description {
  color: var(--color-library-text-muted);
  font-size: 0.82rem;
  line-height: 1.55;
  overflow-wrap: anywhere;
}

.desc-paragraph {
  margin: 8px 0 0;
}

.desc-list {
  margin: 8px 0 0;
  padding-left: 18px;
}

.desc-list li + li {
  margin-top: 4px;
}

.desc-table-wrap {
  margin-top: 10px;
  overflow-x: auto;
}

.desc-table-caption {
  color: var(--color-library-text);
  font-size: 0.78rem;
  font-weight: 700;
  margin-bottom: 4px;
}

.desc-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.76rem;
}

.desc-table th,
.desc-table td {
  border: 1px solid var(--color-library-border);
  padding: 5px 6px;
  text-align: left;
  vertical-align: top;
}

.desc-table th {
  background: var(--color-library-bg-hover);
  color: var(--color-library-text);
  white-space: nowrap;
}
</style>
