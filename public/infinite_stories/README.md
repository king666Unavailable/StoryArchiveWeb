# 无限副本资源目录

本目录独立存放无限副本。页面根据 `src/content/infiniteStories.ts` 中的主题 ID 与子文件夹 ID呈现层级；每个主题目录下的 `theme2.png` 用作该主题背景，位于子文件夹旁。

目前无限副本页面只显示主题、子文件夹入口和主题背景，不读取 `story.md` 的元数据或正文。`story.md` 与 `images/` 保留在各副本文件夹中，供后续页面使用。

目标层级：

```text
public/infinite_stories/
├── ShiDaiJiuYing/
│   ├── theme2.png
│   ├── CanKuJieMu/story.md
│   └── TaDeYouXi/story.md
└── XianTuPiaoMiao/
    ├── theme2.png
    └── TianDiWuShu/story.md
```

把原先 `public/world-quests/` 下对应主题中的副本文件夹移动到这里的同名主题目录下。保留 `story.md` 与 `images/` 的相对结构；正文标题、简介和内容仍从 `story.md` 读取。
