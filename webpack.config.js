const path = require("path");

module.exports = {
    mode: "development",
    entry: "./src/index.js",
    devServer: {
        contentBase: path.resolve(__dirname, "public"),
        port: 8000,
        writeToDisk: true
    }
};
