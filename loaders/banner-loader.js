/**
 * 给每个生成的模板加一个版权声明的注释
 */
const loaderUtils = require('loader-utils');
const validateOptions = require('schema-utils');
const fs = require('fs');
const path = require('path');

/*{
    test:/\.js$/,
        use:[ {
    loader:'banner-loader',
    options:{
        filename:'./banner.js',
        text:'THIS IS A BANNER',
    }
},'babel-loader']
},*/

/*{
    test:/\.js$/,
        use:[ 'babel-loader',
            {
                loader:'banner-loader',
                options:{
                    filename:'./banner.js',
                    text:'THIS IS A BANNER',
                }
            }]
}*/
// 上面两种 loader 的使用顺序，可能会导致不一样的结果
// 如果 babel-loader 传递给下一个 loader 包含 sourceMaps
// 那么下一个 loader 就得接收 sourceMaps ，否则就丢失了
// 所以 banner-loader 需要再接收一个参数
// !!!!!!
// 一般情况下，loader 只接受一个参数
// 如果上一个 loader 还传了别的值过来，那么自定义的 loader 就需要新增参数接收
function loader(inputSource, inputSourceMap) {
    this.cacheable();
    let options = loaderUtils.getOptions(this);
    let schema = {
        type: 'object',
        properties: {
            filename: {type: 'string'},
            text: {type: 'string'},
        }
    };
    // 校验 options 的合法性，是否符合上面的规则
    validateOptions(schema, options);
    let {filename,text} = options;
    // 如果设置了 filename ，就优先用 filename
    if(filename){
        let callback = this.async();
        fs.readFile(path.join(__dirname, filename), 'utf8', (err, text) => {
            callback(null, text + inputSource, inputSourceMap);
        });
    }else if(text){
        this.callback(null, `/**${options.text}**/${inputSource}`, inputSourceMap);
    }
}
module.exports = loader;