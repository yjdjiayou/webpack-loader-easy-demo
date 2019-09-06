const path = require('path');
module.exports = {
    // 用开发模式，防止代码被压缩
    mode: 'development',
    entry: {
        main: './src/index.js'
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js',
    },
    resolveLoader: {
        modules: [path.resolve(__dirname, 'node_modules'), path.resolve(__dirname, 'loaders')]
    },
    module: {
        rules: [
         /*   {
                // css-loader 是用来处理解析@import "base.css" url(./bg.jpg)
                test:/\.css$/,
                use:['style-loader','css-loader']
            },*/
            // {
            //     test:/\.css$/,
            //     use:['exact-loader']
            // },
            // {
            //     test:/\.css$/,
            //     use:['style-loader','sprite-loader']
            // },
            {
                test: /\.less$/,
                use: ['style-basic-loader', 'less-loader']
            },
       /*     {
                test:/\.css$/,
                use:['style-loader',{
                    loader:'px2rem-loader',
                    options:{
                        remUnit:75,
                        remPrecesion:8
                    }
                }]
            },*/
          /*  {
                test: /\.(jpg|png|gif)$/,
                use: ['file-loader']
            },*/
            {
                test: /\.(jpg|png|gif)$/,
                use: [
                    {
                        loader: 'url-loader',
                        options: {
                            limit: 1024 * 8,
                            filename: '[name].[hash].[ext]'
                        }
                    }
                ]
            },
            {
                test: /\.js$/,
                // use:['loader1','loader2','loader3']
                use: [
                    {
                        loader: 'banner-loader',
                        options: {
                            filename: './banner.js',
                            // text: '版权声明:YJD'
                        }
                    },
                    {
                        loader: 'babel-loader',
                        options: {
                            presets: ["@babel/preset-env"]
                        }
                    }
                ]
            }
        ]
    }
};