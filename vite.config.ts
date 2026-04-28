import { defineConfig } from 'vite';

export default defineConfig({
  root: 'src',

  server: {
    port: 3000
  },

  preview: {
    port: 3000
  },

  build: {
    outDir: '../dist',
    emptyOutDir: true
  },
  plugins: [
    {
      name: 'handlebars-loader',
      transform(src: string, id: string) {
        if (id.endsWith('.hbs')) {
          return {
            code: `export default ${JSON.stringify(src)};`,
            map: null
          };
        }
      }
    }
  ]
});