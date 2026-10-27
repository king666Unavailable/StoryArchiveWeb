# 世界任务素材目录

按“主题 ID / 子任务 ID”放置每项任务的正文和素材。

- 在对应子任务目录粘贴或创建 `story.md`。文件开头的 YAML frontmatter 提供页面资料，下面编写故事正文。
- 将该子任务用到的图片放进同目录的 `images/`。
- 在 frontmatter 中填写 `image: images/文件名.png`，页面会将它显示在右侧场景区域；省略 `image` 时图片区域保持空白。
- 人物头像可填写 `avatar: images/头像文件.png`；有 `character` 但没有 `avatar` 时显示空框占位，`character` 留空时不显示人物区域。
- 主题名称和子任务 ID 在 `src/content/worldQuests.ts` 中维护；`story.md` 提供标题、简介、时期、人物和类型。
- 类型填写 `world_quests` 或 `infinite_stories`；人物留空时页面不显示人物区域。

例如：

```text
ShiDaiJiuYing/
  AiShaYiYuan/
    story.md
    images/
      preview.webp
```
