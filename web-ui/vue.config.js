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
                target: 'http://localhost:5000',
                pathRewrite: { '^/api': '' },
                changeOrigin: true,
                logLevel: 'debug'
            }
        }
    }
}
