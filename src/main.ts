import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import { vTooltip } from './directives/vTooltip';
import { initializeAppTheme } from './utils/appTheme';
import './style.css';

initializeAppTheme();

const app = createApp(App);

app.directive('tooltip', vTooltip);
app.use(createPinia());
app.mount('#app');
