import { App } from 'vue';

export function setupPlugins(app: App) {
  const plugins = import.meta.globEager('./[^index]*.ts');
  for (const plugin in plugins) {
    app.use(plugins[plugin]!.default);
  }
}
