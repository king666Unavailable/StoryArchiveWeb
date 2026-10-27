# Story Archive 场景原型

Vue 3 + TypeScript + Vite 的交互式场景 UI 原型，当前包含「城市索引」和「世界档案」两屏。

## 本地预览

```bash
npm install
npm run dev
```

Vite 启动后打开终端显示的本地地址。开发服务器支持热更新，修改 Vue 或 CSS 后浏览器会自动刷新。

## 当前交互

- 顶部 NAV 和左右场景箭头可在两屏之间切换。
- 场景热点、底部快捷入口会打开说明面板。
- 支持键盘左右方向键切换场景，Esc 关闭面板。
- 手机竖屏时显示横屏提示；手机横屏展示场景布局。
- 当前场景由 CSS 与 SVG 绘制，未使用参考截图作为背景素材。

## 构建

```bash
npm run build
```

构建结果输出到 `dist/`。

## 更新 Ubuntu 服务器

本地修改完成后，先提交并推送到 GitHub：

```bash
git add .
git commit -m "描述本次修改"
git push
```

然后 SSH 登录 Ubuntu 服务器，拉取最新代码、重新构建并更新 Nginx 网站目录：

```bash
cd ~/StoryArchiveWeb
git pull
npm ci
npm run build
sudo cp -r dist/. /var/www/story-world-hub/
```

构建成功后刷新浏览器即可。网站通过 Nginx 的 25717 端口访问；通常更新静态文件后不需要重启 Nginx。
