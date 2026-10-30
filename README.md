# 世界之外资料站

基于 Vue 3、TypeScript 和 Vite 的互动式资料与剧情阅读网站。首页由「现实世界」「主神空间」「暇光空间」三个场景组成，并提供世界任务、无限副本、侧影筛选与侧影剧情回顾等页面。页面以桌面端和手机横屏布局为主。

## 本地开发

```bash
npm install
npm run dev
```


## 常用命令

```bash
npm run dev      # 启动开发服务器
npm run build    # 类型检查并构建生产文件
npm run preview  # 本地预览 dist 构建结果
```

生产构建输出到 `dist/`。静态部署时，将 `dist/` 内容发布到 Web 服务器，并为 Vue Router history 路由配置回退到 `index.html`。

## 页面与路由

| 页面 | 路径 | 说明 |
| --- | --- | --- |
| 现实世界 | `/` | 城市场景、日夜背景切换与首页快捷入口 |
| 主神空间 | `/archive` | 世界任务、无限副本等资料入口 |
| 暇光空间 | `/leisure` | 唱片机、珍藏时光和空间选择入口 |
| 世界任务 | `/world-quests` | 按主题浏览任务及其元数据 |
| 世界任务回顾 | `/world-quests/:topicId/:questId/recap` | 阅读任务正文、目录与剧情分支 |
| 无限副本 | `/infinite-stories` | 按主题展示副本入口和主题背景 |
| 侧影筛选 | `/side-shadows` | 按世界、属性、稀有度和角色筛选侧影 |
| 侧影详情 | `/side-shadows/:worldId/:characterId/:shadowId` | 查看卡面、切换卡面并进入剧情 |
| 侧影剧情回顾 | `/side-shadows/:worldId/:characterId/:shadowId/recap/:storyType` | 阅读侧影的指定剧情类别 |

首页场景可以使用页面箭头或键盘左右方向键切换；详情面板可用 `Esc` 关闭。部分筛选、目录和场景选择状态保存在当前标签页会话或浏览器本地存储中。

## 项目目录

```text
src/
├── components/       # 共用组件，例如底部快捷栏和身份提示
├── content/          # 路由页面使用的数据索引、读取器和用户资料逻辑
├── pages/             # 世界任务、无限副本、侧影和剧情回顾页面
├── scenes/            # 三个首页场景
├── styles/            # 全局基础样式
├── App.vue            # 共用 NAV、场景切换、弹窗和路由容器
└── main.ts            # Vue 应用与路由入口

public/
├── backgrounds/       # 首页及子页面背景图
├── icon/              # 属性、稀有度和剧情入口图标
├── world-quests/      # 世界任务 story.md 和相关素材
├── infinite_stories/  # 无限副本主题背景与 story.md
└── side-shadows/      # 侧影索引、元数据、卡面、缩略图和剧情
```

## 内容与素材

内容文件都放在 `public/` 下，浏览器通过 HTTP 请求读取。由于浏览器运行时不能枚举服务器目录，新增内容时通常需要同时更新 `src/content/` 中的索引；具体字段和 Markdown 格式见各内容目录自己的 README 与模板。

- **世界任务**：主题和任务文件夹 ID、展示顺序由 `src/content/worldQuests.ts` 指定。每个 `public/world-quests/<主题>/<任务>/story.md` 使用 YAML frontmatter 保存标题、描述、时期、人物、类型及图片路径，正文写在 frontmatter 之后。
- **无限副本**：独立存放在 `public/infinite_stories/<主题>/`。主题背景图和各子文件夹同级；主题、子文件夹 ID 与顺序由 `src/content/infiniteStories.ts` 指定。子文件夹的 `story.md` 提供入口标题和剧情正文。
- **侧影**：`public/side-shadows/index.json` 登记世界、角色、侧影文件夹及顺序；每个侧影目录包含 `shadow.md` 元数据、卡面和缩略图，可选 `stories.md` 与竖版预览图。筛选不读取剧情正文，点选剧情入口时才加载当前侧影的 `stories.md`。
- **图片路径**：Markdown 元数据中的图片路径相对于对应内容文件所在目录填写。不要把大图转成内联数据；使用 `public/` 下的静态文件路径。
- **玩家变量**：剧情支持 `{userLastname}`、`{userFirstName}`、`{userName}` 和 `{gameName}`。姓名和代号保存在浏览器本地存储；未填写的变量会原样显示。
- **剧情解析**：正文支持按三级标题生成目录、段落和说话人排版、括号段落格式、分支选择及分支结局。分支格式请参考世界任务或无限副本目录 README。

## 内容说明文档

- [世界任务内容格式](public/world-quests/README.md)
- [无限副本内容格式](public/infinite_stories/README.md)
- [侧影目录、字段和剧情格式](public/side-shadows/README.md)
- [侧影资料模板](public/side-shadows/侧影卡片模板.md)
- [世界任务索引说明](public/world-quests/索引.md)
- [世界任务正文模板](public/world-quests/子任务正文模板.md)

## 背景与界面约定

- 首页的顶部 NAV 由 `App.vue` 共用；新增首页场景时应复用现有 NAV 和切换行为。
- 首页现实世界支持日夜切换，相关背景资源位于 `public/backgrounds/`。
- 手机端主要按横屏画布设计；样式调整时注意桌面端和手机端的媒体查询可能分别控制布局。
- 图标使用 `@lucide/vue` 或 `public/icon/` 中已有的资源；页面中的星点、装饰线等可由 CSS 绘制。

## 部署

先在本地构建并确认 `dist/` 输出正常，再将构建产物部署到静态 Web 服务器。若使用 Nginx 等服务器托管，需允许 `/world-quests/...`、`/infinite-stories/...`、`/side-shadows/...` 等前端路由直接回退到 `index.html`，以支持刷新和直达子路由。服务器目录、端口及发布方式由实际部署环境决定。
