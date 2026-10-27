export type WorldQuestTopicIndex = {
  id: string
  title: string
  questIds: string[]
}

// This index only defines topic order and folder IDs. Quest details live in each story.md.
export const worldQuestTopics: WorldQuestTopicIndex[] = [
  {
    id: 'ShiDaiJiuYing',
    title: '时代旧影',
    questIds: ['AiShaYiYuan', 'ShenWangMingZhu', 'BeiLuFengXue', 'DongShuiHuanShu',
       'CanKuJieMu','WuMing', 'TaDeYouXi', 'YingXiangLi',
       'ChenYuanZhaoXue','XinXiangShiCheng'],
  },
  {
    id: 'XianTuPiaoMiao',
    title: '仙途缥缈',
    questIds: ['GuangHuanZhengDuo','JuChangTiaoZhan','YunWaiZhiBao','HanXiangJiao',
      'TianDiWuShu','JinHeHuan','SiHaiXinFu','FuYouMeng','BingDiHua'],
  },
]
