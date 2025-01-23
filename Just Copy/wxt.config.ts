import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  extensionApi: 'chrome',
  modules: ['@wxt-dev/module-react'],
  manifest: {
    name: "Just Copy",
    description: "Just Search and click to Copy Code snippets",
    version: "1.0.0",
    icons: {
      25: "icons/25.png",
      50: "icons/50.png",
      72: "icons/72.png",
    }
  }
});
