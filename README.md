## 使用VitePress 构建静态网站
- [主题官网](https://vp.teek.top/)
- 快速构建一个和 Teek 文档类似的项目，可以直接拉取现成的 Teek 文档模板仓库。
```
git clone https://github.com/Kele-Bingtang/vitepress-theme-teek-docs-template.git
```
## 运行vitepress-theme-teek
- 必须先执行 npm install 才能运行 npm run docs:dev，核心原因是 npm run 执行的命令依赖的工具（比如 vitepress）并不是系统全局安装的，而是存放在项目本地的依赖包里，npm install 就是把这些工具下载到项目里的过程。
- 项目里的 package.json 就像一个「购物清单」，里面的 devDependencies（开发依赖）和 dependencies（生产依赖）列出了项目运行需要的所有工具（比如 vitepress、sass 等），但这只是「清单」，并不是已经把工具买回来放在项目里了。
```
克隆下来后切换目录
PS C:\IM\AllDom\CodeBuddyCN\VitePressA\ChuYanZhio.github.io> cd vitepress-theme-teek-docs-template
PS C:\IM\AllDom\CodeBuddyCN\VitePressA\ChuYanZhio.github.io\vitepress-theme-teek-docs-template> npm install
⠙/


执行 npm install
npm install
如果安装速度慢或报错，可以尝试用淘宝镜像加速
npm install --registry=https://registry.npmmirror.com

运行项目
npm run docs:dev
```

- 运行成功
![示例](ls/image.png)


# 后续从GitHub拉取到本地要执行npm install  下载依赖包

