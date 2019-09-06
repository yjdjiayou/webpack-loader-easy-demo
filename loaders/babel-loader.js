const babel = require('@babel/core');
const path = require('path');
const loaderUtils = require('loader-utils');
function loader(inputSource){
    // loaderUtils.getOptions 可以获取 .babelrc 文件的配置项吗？
    // 不能，@babel/core 自己会去查找 .babelrc 文件，读取配置项
    let options =loaderUtils.getOptions(this);
    options = {
        ...options,
        // 告诉 babel我要生成sourcemap
        sourceMaps:true,
        // 指定生成的 sourcemap 文件名
        // 如果不指定就是 unknown
        filename:path.basename(this.resourcePath)
    };
    // code 转换后的代码
    // map sourcemap 文件
    // ast 转换后的抽象语法树
    let {code,map,ast} = babel.transform(inputSource,options);
    //我们可以把 sourcemap ast 都传给webpack
    // 这样 webpack 就不再需要自己把源代码转语法树了，也不需要自己生成 sourcemap
    return this.callback(null,code,map);
}
module.exports = loader;