const loaderUtils = require('loader-utils');

function loader(source) {
    let script = (`
       let style = document.createElement('style');
       style.innerHTML = ${JSON.stringify(source)};
       document.head.appendChild(style);
    `);
    return script;
}
// remainingRequest 剩下的路径
// previousRequest 之前的路径
// https://github.com/webpack/webpack/blob/v4.39.3/lib/NormalModuleFactory.js#L339
loader.pitch = function (remainingRequest, previousRequest, data) {
    // console.log('style-loader pitch', remainingRequest);
    let importLoader = 2;
    // 如果 style-loader 要和 css-loader 联合使用
    // 因为 css-loader 输出的是 js ，如果 style-loader 只使用 normal 的话会无法解析
    // 所以需要使用 pitch 跳过 normal 执行

    // stringifyRequest 可以把一个绝对路径转成适合 loader 的相对路径： "!!../loaders/css-loader.js!./style.css"
    // 这里用到了内联 loader
    // 如果不加 !! 会出现死循环，因为当匹配到 style.css 文件时，又会 “先” 去执行 normal loader -> css-loader

    let script = (`
       let style = document.createElement('style');
       style.innerHTML = require(${loaderUtils.stringifyRequest(this, "!!" + remainingRequest)});
       document.head.appendChild(style);
    `);
    // 这里最终会输出 js 代码，然后交给 webpack 去处理解析（转成 AST）
    // 在解析阶段，webpack 会去执行 require("!!../loaders/css-loader.js!./style.css")
    // 得到最终的 css 内容，然后再赋值给 style.innerHTML
    return script;
};
module.exports = loader;
// 如果使用原生的 style-loader + css-loader 也是一样的：
// "./node_modules/_css-loader@3.2.0@css-loader/dist/cjs.js!./src/style.css"