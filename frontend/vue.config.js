const { defineConfig } = require("@vue/cli-service");
module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    historyApiFallback: true,
    host: "0.0.0.0",
    port: 8080,
    allowedHosts: "all",
  },
  publicPath: "/",
});
