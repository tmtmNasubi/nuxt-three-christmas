// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: true },
  typescript: {
    strict: true,
  },
  // plugins: [{ src: "~/plugins/three.client.ts", mode: "client" }],
  // build: {
  //   transpile: ["three", "@ar-js-org/ar.js-threejs"],
  // },
  runtimeConfig: {
    public: {
      // ここに公開設定を追加
    },
  },
});
