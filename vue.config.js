module.exports = {
  css: {
    loaderOptions: {
      scss: {
        additionalData: '@import "@/assets/css/common.scss";',
      },
      sass: {
        additionalData: '@import "@/assets/css/common.scss"',
      },
    },
  },
  devServer: {}
};
