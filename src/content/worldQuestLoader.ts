import { worldQuestTopics, type WorldQuestTopicIndex } from './worldQuests'
import { infiniteStoryTopics } from './infiniteStories'

export type WorldQuestType = 'world_quests' | 'infinite_stories'

export type WorldQuest = {
  id: string
  type: WorldQuestType
  title: string
  description: string
  period: string
  character: string
  image: string
  avatar: string
  body: string
}

export type WorldQuestTopic = Omit<WorldQuestTopicIndex, 'questIds'> & { quests: WorldQuest[] }
export type InfiniteStory = WorldQuest & { topicId: string; topicTitle: string }

function unquote(value: string) {
  const trimmed = value.trim()
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    return trimmed.slice(1, -1)
  }
  return trimmed
}

export function parseStoryMarkdown(topicId: string, id: string, markdown: string, resourceRoot = 'world-quests'): WorldQuest {
  const match = markdown.match(/^---\s*\r?\n([\s\S]*?)\r?\n---\s*(?:\r?\n|$)/)
  const metadata: Record<string, string> = {}
  if (match) {
    for (const line of match[1].split(/\r?\n/)) {
      const separator = line.indexOf(':')
      if (separator < 0) continue
      metadata[line.slice(0, separator).trim()] = unquote(line.slice(separator + 1))
    }
  }
  const type: WorldQuestType = metadata.type === 'infinite_stories' ? 'infinite_stories' : 'world_quests'
  return {
    id,
    type,
    title: metadata.title || id,
    description: metadata.description || '',
    period: metadata.period || '',
    character: metadata.character || '',
    image: metadata.image ? encodeURI(`/${resourceRoot}/${topicId}/${id}/${metadata.image.replace(/^\/+/, '')}`) : '',
    avatar: metadata.avatar ? encodeURI(`/${resourceRoot}/${topicId}/${id}/${metadata.avatar.replace(/^\/+/, '')}`) : '',
    body: match ? markdown.slice(match[0].length).trim() : markdown.trim(),
  }
}

async function loadQuest(topicId: string, questId: string, resourceRoot = 'world-quests'): Promise<WorldQuest> {
  const response = await fetch(`/${resourceRoot}/${topicId}/${questId}/story.md`)
  if (!response.ok) throw new Error(`无法读取${resourceRoot}正文：${topicId}/${questId}/story.md`)
  const story = parseStoryMarkdown(topicId, questId, await response.text(), resourceRoot)
  if (resourceRoot === 'infinite_stories') story.type = 'infinite_stories'
  return story
}

export async function loadWorldQuestTopics(): Promise<WorldQuestTopic[]> {
  const infiniteStoryIds = new Set(infiniteStoryTopics.flatMap((topic) => topic.subfolderIds))
  return Promise.all(worldQuestTopics.map(async ({ id, title, questIds }) => ({
    id,
    title,
    quests: await Promise.all(questIds.map((questId) => loadQuest(
      id,
      questId,
      infiniteStoryIds.has(questId) ? 'infinite_stories' : 'world-quests',
    ))),
  })))
}

export async function loadInfiniteStories(): Promise<InfiniteStory[]> {
  const topics = await Promise.all(infiniteStoryTopics.map(async ({ id: topicId, title: topicTitle, subfolderIds }) => {
    const stories = await Promise.all(subfolderIds.map((storyId) => loadQuest(topicId, storyId, 'infinite_stories')))
    return stories.map((story) => ({ ...story, type: 'infinite_stories' as const, topicId, topicTitle }))
  }))
  return topics.flat()
}
