export type Hotspot = {
  id: string
  title: string
  eyebrow?: string
  description: string
  x: number
  y: number
  align?: 'left' | 'center' | 'right'
  size?: 'large' | 'normal'
}

export const cityHotspots: Hotspot[] = [
  { id: 'events', title: '活动', eyebrow: 'EVENTS', description: '限时故事与特别篇将会在这里相遇。', x: 8, y: 37, align: 'center', size: 'large' },
  { id: 'daily', title: '日常档案', eyebrow: 'DAILY FILES', description: '收录日常片段、委托与未完待续的小事。', x: 39, y: 31, align: 'left', size: 'large' },
  { id: 'memories', title: '回忆', eyebrow: 'MEMORIES', description: '回到那些仍然闪闪发亮的相遇时刻。', x: 41, y: 64, align: 'center', size: 'large' },
  { id: 'mail', title: '信笺', eyebrow: 'LETTERS', description: '一封还没拆开的信，或许藏着新的故事。', x: 20, y: 75, align: 'center' },
  { id: 'city', title: '城市', eyebrow: 'CITY GUIDE', description: '沿着城市的光，看看故事发生过的地方。', x: 76, y: 59, align: 'center', size: 'large' },
]

export const archiveHotspots: Hotspot[] = [
  { id: 'world-quests', title: '世界任务', eyebrow: 'WORLD QUESTS', description: '查看各个世界中的任务与故事线索。', x: 17, y: 35, align: 'center', size: 'large' },
  { id: 'collections', title: '藏品', eyebrow: 'COLLECTIONS', description: '保存角色、卡面与故事相关的珍贵片段。', x: 35, y: 39, align: 'center' },
  { id: 'exchange', title: '无尽密室', eyebrow: 'ENDLESS ROOMS', description: '进入不同空间，继续探索无尽故事。', x: 62, y: 38, align: 'center', size: 'large' },
  { id: 'infinite', title: '无限副本', eyebrow: 'INFINITE STORIES', description: '进入独立篇章，继续探索不同的故事线。', x: 80, y: 24, align: 'center', size: 'large' },
  { id: 'identity', title: '身份回廊', eyebrow: 'IDENTITY ARCHIVE', description: '那些曾经短暂生活过的身份，也值得被记住。', x: 48, y: 68, align: 'center' },
  { id: 'between-worlds', title: '世界之间', eyebrow: 'BETWEEN WORLDS', description: '在不同世界之间穿行，发现故事的连接。', x: 78, y: 72, align: 'center', size: 'large' },
]
