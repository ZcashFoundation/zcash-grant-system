const wp = require("@cypress/webpack-preprocessor");
module.exports = on => {
  const options = {
    webpackOptions: {
      resolve: {
        extensions: [".ts", ".tsx", ".js", ".json"]
      },
      module: {
        rules: [
          {
            test: /\.tsx?$/,
            loader: "ts-loader",
            options: { transpileOnly: true }
          }
        ]
      }
    }
  };
  on("file:preprocessor", wp(options));
};
