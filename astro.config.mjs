import { defineConfig } from 'astro/config';
import { qrcode } from 'vite-plugin-qrcode';
// import glslify from "vite-plugin-glslify";

// https://astro.build/config
export default defineConfig({
  site: "https://test.com/",
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@import "./src/styles/vars.scss";`
        }
      }
    },
    plugins: [qrcode()]
  },
});