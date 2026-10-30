# 侧影资料目录

侧影筛选页从本目录读取资料：`index.json` 提供世界、角色、侧影文件夹 ID 与顺序，各侧影的 `shadow.md` 提供名称、筛选字段和图片路径。新增文件夹后要同步登记到索引，页面才会读取。

侧影资料按“世界 → 角色 → 侧影”存放。目录名使用拼音大驼峰；`id` 与实际文件夹名完全一致。中文显示名称和筛选字段统一保存在每张侧影的 `shadow.md` 中。

```text
side-shadows/
├─ index.json                         # 世界、角色、侧影目录 ID 与展示顺序
├─ 侧影卡片模板.md
└─ ShiDaiJiuYing/                     # 时代旧影
   └─ BaiYuan/                        # 柏源
      └─ JiaMianShiKe/                # 加冕时刻
         ├─ shadow.md                 # 名称与筛选元数据
         ├─ thumbnail-1.webp          # 卡面1对应的缩略图
         ├─ thumbnail-2.webp          # 卡面2对应的缩略图（可选）
         ├─ card-1.webp               # 卡面1（必需）
         ├─ card-2.webp               # 卡面2（可选）
         └─ stories.md                # 相会、钥匙、贴近、重逢剧情
```

## 索引与字段来源

浏览器不能在运行时枚举 `public` 目录，所以 `index.json` 必须列出完整目录层级。索引中的 `id` 就是对应文件夹名，只负责定位文件及控制展示顺序，不存放侧影资料。
为便于查看，`shadows` 列表按每行 4 个目录 ID 排版；创建脚本会自动保持这个格式。

```json
{
  "worlds": [
    {
      "id": "ShiDaiJiuYing",
      "characters": [
        {
          "id": "BaiYuan",
          "shadows": ["JiaMianShiKe"]
        }
      ]
    }
  ]
}
```

每份 `shadow.md` 保留完整字段，即使世界和角色也体现在父文件夹中。前端筛选以 Markdown 元数据为准；这样文件夹负责整理层级，资料文件负责描述侧影本身，读取时也能检查元数据与目录归属是否一致。

## `shadow.md` 格式

使用 YAML frontmatter 保存筛选页会用到的资料：

```md
---
name: "加冕时刻"
thumbnail1: "./thumbnail-1.webp"
thumbnail2: "./thumbnail-2.webp"
card1: "./card-1.webp"
card2: "./card-2.webp"
rarity: "星"
mainAttribute: "思维"
world: "时代旧影"
character: "柏源"
meet: ""
hasKeyStory: "false"
portrait1: ""
portrait2: ""
portrait3: ""
portrait4: ""
---
```

所有字段值都用双引号包裹，统一按字符串读取。没有填写的可选字段写成 `""`；不要把字段留成空白，否则 YAML 会将它解析为 `null`。没有卡面2时也可以省略 `card2` 字段。

- `name`：侧影名称。
- `thumbnail1`：卡面1对应的缩略图路径；筛选页目前默认显示此图，可暂时留空。
- `thumbnail2`：卡面2对应的缩略图路径，可选；没有卡面2时留空或省略。
- `card1`：卡面1图片路径，必填。
- `card2`：卡面2图片路径，可选；没有卡面2时省略字段或留空。
- `rarity`：稀有度，只能是 `刹那`、`世界`、`瞬`、`月`、`辰星`、`星` 之一。
- `mainAttribute`：主属性，只能是 `思维`、`魅力`、`体魄`、`感知`、`灵巧` 之一。
- `world`：所属世界的中文名称，应与世界目录对应。
- `character`：角色中文名称，应与角色目录对应。
- `meet`：可选的相遇短句，显示在侧影详情的稀有度图标与侧影名称下方，字体与世界名称一致；缺省时该行仍保留空位，以保持不同卡片的信息位置一致。
- `hasKeyStory`：可选字符串标记。对稀有度为“世界”的个别侧影填写 `"true"` 后显示“钥匙”入口；其他值或缺省时不显示。稀有度为“瞬”的侧影会自动显示钥匙入口，无需添加此字段。
- `portrait1` 至 `portrait4`：可选竖版卡面路径。在侧影详情页通过独立图库按钮预览；手机端旋转90度展示，桌面端按竖图比例完整显示。仅在打开图库时请求当前图片。

缩略图和卡面图片都放在侧影自己的文件夹中，路径相对于 `shadow.md`。`thumbnail1`、`thumbnail2` 分别对应 `card1`、`card2`；筛选页目前只显示 `thumbnail1`。`card1`、`card2` 保存侧影卡面图。`shadow.md` 只读取 frontmatter 作为资料；不要把卡面剧情写在此文件中。

## `stories.md` 格式

剧情不参与筛选。按“相会、贴近、重逢、钥匙”分为二级标题，每段具体剧情用三级标题命名，数量不限；没有内容的类别可以暂时省略。侧影详情页根据稀有度显示剧情入口：稀有度为“星”或“辰星”时只显示“相会”；其他稀有度显示“相会、贴近、重逢”三个入口。稀有度为“瞬”的侧影自动增加“钥匙”；稀有度为“世界”的个别侧影可在 `shadow.md` 设置 `hasKeyStory: "true"` 来增加“钥匙”。入口打开同一套剧情回顾页面并只显示所选类别；尚未补充正文的类别会显示空内容提示。

```md
## 相会

### 剧情条目名称

在这里填写剧情正文。

### 另一段相会剧情

在这里填写另一段剧情正文。

## 贴近

### 剧情条目名称

在这里填写剧情正文。

## 重逢

### 剧情条目名称

在这里填写剧情正文。

## 钥匙

### 剧情条目名称

在这里填写剧情正文。
```

详情预览页只读取 `index.json` 和各侧影的 `shadow.md` 元数据来决定入口，不会为所有侧影预载 `stories.md`。点击具体入口时才请求当前侧影的 `stories.md`；同一侧影的剧情文件在当前页面会话中只请求一次。

## 读取方式

1. 页面读取 `index.json`，根据 ID 拼出每份 `shadow.md` 的路径。
2. 筛选页读取 `shadow.md` 的 frontmatter，并根据稀有度、世界、主属性和角色进行筛选。
3. 结果卡片默认显示 `thumbnail1`；路径为空时图片区域保持透明。`thumbnail2` 已读取到数据中，当前筛选页暂不切换显示它。属性和稀有度图标从 `public/icon/` 按固定字段值匹配。
4. 图片使用浏览器懒加载；当前筛选页不读取 `stories.md`，该文件保留给后续剧情详情功能。

200 张侧影的少量 Markdown 元数据通常不构成明显负担，主要开销是独立请求数量。先避免预载全部剧情和图片；若之后实际感觉读取偏慢，再考虑由构建脚本从 Markdown 自动生成汇总目录，仍以 Markdown 作为资料源。

新增侧影时，复制对应结构，填写 `shadow.md` 和 `stories.md`，放入图片，并在 `index.json` 相应角色的 `shadows` 列表中加入侧影目录 ID。不要为了占位创建图片文件。

### 用脚本创建侧影目录

在项目根目录的 PowerShell 中运行 `scripts/New-SideShadow.ps1`。脚本会创建侧影文件夹、带完整空字段的 `shadow.md`、包含四类剧情标题的 `stories.md`，并将侧影 ID 登记到 `index.json`。如果世界或角色尚未登记，也会创建对应索引层级；已存在的侧影目录不会被覆盖。

```powershell
.\scripts\New-SideShadow.ps1 `
  -WorldId ZhaoHuanZhiWang `
  -CharacterId BaiYuan `
  -ShadowId TianGuoJiaYi `
  -Name "天国假意" `
  -WorldName "昭焕之望" `
  -CharacterName "柏源"
```

`WorldId`、`CharacterId`、`ShadowId` 是拼音大驼峰目录名；后三个中文名称参数可选。也可以补充 `-Rarity "世界"` 和 `-MainAttribute "体魄"`。卡面、缩略图及其他元数据之后填写到生成的 `shadow.md`。

柏源、易遇、顾时夜、夏萧因的示例占位资料目前都归在 `ShiDaiJiuYing/`（时代旧影）下；后续若侧影所属世界不同，再移动角色目录并同步更新索引及 `shadow.md` 的 `world` 字段。
