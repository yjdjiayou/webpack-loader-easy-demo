const postcss = require('postcss');
const path = require('path');
const loaderUtils = require('loader-utils');
const SpriteSmith = require('spritesmith');
const Tokenizer = require('css-selector-tokenizer');

function loader(inputSource) {
    let callback = this.async();
    //this.context代表被加载资源的上下文目录
    let that = this;
    function createPlugin(postcssOptions) {
        return function (css) {//代表CSS文件本身
            css.walkDecls(function (decl) {
                let values = Tokenizer.parseValues(decl.value);
                values.nodes.forEach(value => {
                    value.nodes.forEach(item => {
                        if (item.type == 'url' && item.url.endsWith('?sprite')) {
                            //拼一个路径，找到是这个图片绝对路径
                            let url = path.resolve(that.context, item.url);
                            item.url = postcssOptions.spriteFilename;
                            //按理说我要在当前规则下面添一条background-position
                            postcssOptions.rules.push({
                                url,//就是原始图片的绝对路径，未来要用来合并雪碧图用
                                rule: decl.parent //当前的规则
                            });
                        }
                    });
                });
                decl.value = Tokenizer.stringifyValues(values);//直接把url地址改成了雪碧图的名字
            });
            postcssOptions.rules.map(item => item.rule).forEach((rule, index) => {
                rule.append(
                    postcss.decl({
                        prop: 'background-position',
                        value: `_BACKGROUND_POSITION_${index}_`
                    })
                );
            });
        }
    }

    const postcssOptions = {spriteFilename: 'sprite.jpg', rules: []}
    let pipeline = postcss([createPlugin(postcssOptions)]);
    pipeline.process(inputSource, {from: undefined}).then(cssResult => {
        let cssStr = cssResult.css;
        let sprites = postcssOptions.rules.map(item => item.url.slice(0, item.url.lastIndexOf('?')));
        SpriteSmith.run({src: sprites}, (err, spriteResult) => {
            let coordinates = spriteResult.coordinates;
            Object.keys(coordinates).forEach((key, index) => {
                cssStr = cssStr.replace(`_BACKGROUND_POSITION_${index}_`, `-${coordinates[key].x}px -${coordinates[key].y}px`);
            });
            that.emitFile(postcssOptions.spriteFilename, spriteResult.image);
            callback(null, `module.exports = ${JSON.stringify(cssStr)}`);
        });
    });
}

loader.raw = true;
module.exports = loader;