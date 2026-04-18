import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import { vTooltip } from './directives/vTooltip';
import './style.css';

const app = createApp(App);

app.directive('tooltip', vTooltip);
app.use(createPinia());
app.mount('#app');
