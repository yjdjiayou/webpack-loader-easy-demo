const postcss = require('postcss');
const loaderUtils = require('loader-utils');
const Tokenizer = require('css-selector-tokenizer');

function loader(inputSource) {
    let callback = this.async();
    let {remUnit = 75, remPrecesion = 8} = loaderUtils.getOptions(this);
    function createPlugin(postcssOptions) {
        return function (css) {//代表CSS文件本身
            css.walkDecls(function (decl) {
                let values = Tokenizer.parseValues(decl.value);
                values.nodes.forEach(value => {
                    value.nodes.forEach(item => {
                        if (item.name.endsWith('px')) {
                            let px = parseInt(item.name);
                            let rem = (px / remUnit).toFixed(remPrecesion);
                            item.name = rem + 'rem';
                        }
                    });
                });
                decl.value = Tokenizer.stringifyValues(values);
            });
        }
    }

    const postcssOptions = {};
    let pipeline = postcss([createPlugin(postcssOptions)]);
    pipeline.process(inputSource, {from: undefined}).then(cssResult => {
        let cssStr = cssResult.css;
        console.log(cssStr);
        callback(null, `module.exports = ${JSON.stringify(cssStr)}`);
    });
}

module.exports = loader;