module.exports = {
    chainWebpack: config => {
        config
            .plugin('html')
            .tap(args => {
                args[0].title = "Stock Tracker";
                return args;
            })
    },
    devServer: {
        proxy: {
            '^/api': {
                target: 'http://127.0.0.1:5001',
                pathRewrite: { '^/api': '' },
                changeOrigin: true,
                logLevel: 'debug'
            }
        }
    }
}
