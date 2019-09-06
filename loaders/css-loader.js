/**
 * 用来解析 css 文件中的 @import "base.css"  和图片资源 —— url(./bg.jpg)
 */
const postcss = require("postcss");
const loaderUtils = require('loader-utils');
const Tokenizer = require("css-selector-tokenizer");

function createPlugin(options) {
    return function (css) {
        let {importItems, urlItems} = options;
        // 遍历每一条 @import
        css.walkAtRules(/^import$/, function (rule) {
            let values = Tokenizer.parseValues(rule.params);
            let url = values.nodes[0].nodes[0];
            importItems.push(url.value);
        });
        // 遍历每一条规则
        css.walkDecls(function (decl) {
            let values = Tokenizer.parseValues(decl.value);
            values.nodes.forEach(value => {
                value.nodes.forEach(item => {
                    if (item.type === "url") {
                        let url = item.url;
                        item.url = `_CSS_URL_${urlItems.length}_`;
                        urlItems.push(url); //'./xxx.jpg'
                    }
                });
            });
            decl.value = Tokenizer.stringifyValues(values);
        });
    };
}

function loader(inputSource) {
    console.log('====================================');
    console.log('css-loader');
    console.log('====================================');
    let callback = this.async();

    let options = {
        importItems: [],//@import
        urlItems: []//url
    };
    // stringifyRequest 可以把一个绝对路径 转成适合 loader 的相对路径
    postcss([createPlugin(options)])
        .process(inputSource)
        .then(result => {// ./base.css
            let importJs = options.importItems.map(imp => {
                return "require(" + loaderUtils.stringifyRequest(this, imp) + ")";
            }).join("\n");
            let cssString = JSON.stringify(result.css);//"xxx";
            cssString = cssString.replace(/@import\s+?.+?;/g, "");
            //url('_CSS_URL_0_') ./xxx.jpg
            cssString = cssString.replace(/_CSS_URL_(\d+?)_/g, function (
                matched,
                group1
            ) {
                let imageUrl = options.urlItems[+group1];
                // "background-image:url(_CSS_URL_0_)" =>  "background-image:url("+ xxx +")"
                return '"+require("' + imageUrl + '")+"';
                //return '"+require("./xxx.jpg")+"';
            });
            callback(null, `${importJs}
            module.exports = ${cssString};
            `);
        });
}

module.exports = loader;