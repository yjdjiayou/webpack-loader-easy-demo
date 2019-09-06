/**
 读取源文件的内容，并且重命名并写入到新的输出目录下
 */
const {getOptions,interpolateName} = require('loader-utils');
function loader(content){
    let options = getOptions(this)||{};
    let filename = options.filename||'[name].[hash].[ext]';
    let outputFilename = interpolateName(this,filename,{content});
    // 把 content 内容输出到 outputFilename 里
    this.emitFile(outputFilename,content);
    return `module.exports = ${JSON.stringify(outputFilename)}`;
}
// 文件是 buffer
loader.raw = true;
module.exports = loader;