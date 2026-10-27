export type InfiniteStoryTopicIndex = {
  id: string
  title: string
  subfolderIds: string[]
}

// This index maps the independent public/infinite_stories folder hierarchy.
export const infiniteStoryTopics: InfiniteStoryTopicIndex[] = [
  {
    id: 'ShiDaiJiuYing',
    title: '时代旧影',
    subfolderIds: ['CanKuJieMu', 'TaDeYouXi'],
  },
  {
    id: 'XianTuPiaoMiao',
    title: '仙途缥缈',
    subfolderIds: ['TianDiWuShu'],
  },
  {
    id: 'XingJiZongHeng',
    title: '星际纵横',
    subfolderIds: ['QunXingQiMingShi'],
  },
  {
    id: 'MiShiGuoDu',
    title: '迷失国度',
    subfolderIds: ['YongWuDeDiYu'],
  },
]
