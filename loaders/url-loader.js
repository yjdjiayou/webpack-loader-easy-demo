/**
 读取源文件的内容，并且重命名并写入到新的输出目录下
 如果文件的大小小于limit的话，就不再拷贝新的文件一输出目录，而是直接返回base64字符串
 */
const {getOptions, interpolateName} = require('loader-utils');
//TODO:这里引用了自定义的 file-loader
const fileLoader = require('./file-loader');
const mime = require('mime');

function loader(content) {
    // this => loaderContext
    let {filename = '[name].[hash].[ext]', limit = 1024 * 64} = getOptions(this) || {};
    if (content.length < limit) {
        // 返回此图片的内容类型
        const contentType = mime.getType(this.resourcePath);
        let base64 = `data:${contentType};base64,${content.toString('base64')}`;
        return `module.exports = "${base64}"`;
    }
    return fileLoader.call(this, content);
}

loader.raw = true;
module.exports = loader;