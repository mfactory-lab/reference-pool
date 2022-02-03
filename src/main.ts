import { createApp } from 'vue';
import { setupStore } from '@/store';
import { setupRouter } from '@/router';
import { setupPlugins } from '@/plugins';

import App from './App.vue';

async function bootstrap() {
  const app = createApp(App);

  setupStore(app);
  setupRouter(app);
  setupPlugins(app);

  app.mount('#app');
}

bootstrap().then();
