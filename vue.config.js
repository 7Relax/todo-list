module.exports = {
  productionSourceMap: false, // 打包时不会生成.map文件，加快打包速度
  publicPath: './'            // 打包后的静态文件的位置就是：href=css/app.10160afe.css, 如果不加publicPath: './' 则是：href=/css/app.10160afe.css, 这样的话index.html就找不到这个路径，就会报错
}