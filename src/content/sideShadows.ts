export type SideShadow = {
  id: string
  worldId: string
  characterId: string
  shadowId: string
  title: string
  thumbnail1: string
  thumbnail2: string
  card1: string
  card2: string
  rarity: string
  mainAttribute: string
  world: string
  character: string
  meet: string
  hasKeyStory: boolean
  portraitImages: string[]
}

export type SideShadowStoryType = 'meeting' | 'key' | 'approach' | 'reunion'
export type SideShadowStories = Partial<Record<SideShadowStoryType, string>>

const storySectionTitles: Record<SideShadowStoryType, string> = {
  meeting: '相会',
  key: '钥匙',
  approach: '贴近',
  reunion: '重逢',
}
const storiesCache = new Map<string, Promise<SideShadowStories>>()

type SideShadowIndex = {
  worlds: Array<{
    id: string
    characters: Array<{
      id: string
      shadows: string[]
    }>
  }>
}

function unquote(value: string) {
  const trimmed = value.trim()
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    return trimmed.slice(1, -1)
  }
  return trimmed
}

function parseShadowMetadata(markdown: string) {
  const match = markdown.match(/^---\s*\r?\n([\s\S]*?)\r?\n---\s*(?:\r?\n|$)/)
  const metadata: Record<string, string> = {}
  if (!match) return metadata

  for (const line of match[1].split(/\r?\n/)) {
    const separator = line.indexOf(':')
    if (separator < 0) continue
    metadata[line.slice(0, separator).trim()] = unquote(line.slice(separator + 1))
  }
  return metadata
}

function assetUrl(worldId: string, characterId: string, shadowId: string, path: string) {
  const relativePath = path.trim().replace(/^(?:\.\/|\/)+/, '')
  if (!relativePath) return ''
  return encodeURI(`/side-shadows/${worldId}/${characterId}/${shadowId}/${relativePath}`)
}

function splitShadowStories(markdown: string): SideShadowStories {
  const stories: SideShadowStories = {}
  let activeType: SideShadowStoryType | null = null
  let lines: string[] = []
  const saveSection = () => {
    if (!activeType) return
    const content = lines.join('\n').trim()
    const readableContent = content
      .replace(/<!--[\s\S]*?-->/g, '')
      .replace(/^\s*#{1,6}\s+.*$/gm, '')
      .trim()
    if (readableContent) stories[activeType] = content
  }

  for (const line of markdown.split(/\r?\n/)) {
    const heading = line.match(/^##\s+(.+?)\s*#*\s*$/)
    if (heading) {
      saveSection()
      const title = heading[1].trim()
      activeType = (Object.keys(storySectionTitles) as SideShadowStoryType[])
        .find((type) => storySectionTitles[type] === title) ?? null
      lines = []
      continue
    }
    if (activeType) lines.push(line)
  }
  saveSection()
  return stories
}

export function loadSideShadowStories(shadow: SideShadow): Promise<SideShadowStories> {
  const cached = storiesCache.get(shadow.id)
  if (cached) return cached

  const path = `/side-shadows/${shadow.worldId}/${shadow.characterId}/${shadow.shadowId}/stories.md`
  const request = fetch(path).then(async (response) => {
    if (!response.ok) throw new Error(`无法读取侧影剧情：${path}`)
    return splitShadowStories(await response.text())
  }).catch((error) => {
    storiesCache.delete(shadow.id)
    throw error
  })
  storiesCache.set(shadow.id, request)
  return request
}

export type SideShadowCardVariant = 'card1' | 'card2'

export type SideShadowFilterKey = 'rarity' | 'world' | 'attribute' | 'character'
export type SideShadowFilterState = Record<SideShadowFilterKey, string[]>
export type SideShadowFilterSort = 'rarity-desc' | 'rarity-asc' | 'name'
export type SideShadowFilterContext = {
  resultIds: string[]
  filters: SideShadowFilterState
  sortOrder: SideShadowFilterSort
}

const filterContextStorageKey = 'side-shadow-filter-contexts'
const activeFilterContextStorageKey = 'side-shadow-active-filter-context'

export function createSideShadowFilterContextId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`
}

export function getActiveSideShadowFilterContextId() {
  try {
    return sessionStorage.getItem(activeFilterContextStorageKey) ?? ''
  } catch {
    return ''
  }
}

export function saveSideShadowFilterContext(id: string, context: SideShadowFilterContext) {
  if (!id) return
  try {
    const contexts = JSON.parse(sessionStorage.getItem(filterContextStorageKey) ?? '{}') as Record<string, SideShadowFilterContext>
    contexts[id] = context
    sessionStorage.setItem(filterContextStorageKey, JSON.stringify(contexts))
    sessionStorage.setItem(activeFilterContextStorageKey, id)
  } catch {
    // Browsing still works if session storage is unavailable.
  }
}

export function loadSideShadowFilterContext(id: string): SideShadowFilterContext | null {
  if (!id) return null
  try {
    const contexts = JSON.parse(sessionStorage.getItem(filterContextStorageKey) ?? '{}') as Record<string, SideShadowFilterContext>
    const context = contexts[id]
    if (!context || !Array.isArray(context.resultIds) || !context.filters) return null
    return context
  } catch {
    return null
  }
}

function preferenceKey(id: string) {
  return `side-shadow-card:${id}`
}

export function getSideShadowCardVariant(shadow: SideShadow): SideShadowCardVariant {
  if (typeof window === 'undefined' || !shadow.card2) return 'card1'
  try {
    return window.localStorage.getItem(preferenceKey(shadow.id)) === 'card2' ? 'card2' : 'card1'
  } catch {
    return 'card1'
  }
}

export function saveSideShadowCardVariant(shadow: SideShadow, variant: SideShadowCardVariant) {
  if (typeof window === 'undefined' || (variant === 'card2' && !shadow.card2)) return
  try {
    window.localStorage.setItem(preferenceKey(shadow.id), variant)
  } catch {
    // Keep the current page usable if browser storage is unavailable.
  }
}

export function getSideShadowThumbnail(shadow: SideShadow) {
  return getSideShadowCardVariant(shadow) === 'card2' && shadow.thumbnail2
    ? shadow.thumbnail2
    : shadow.thumbnail1
}

export async function loadSideShadows(): Promise<SideShadow[]> {
  const indexResponse = await fetch('/side-shadows/index.json')
  if (!indexResponse.ok) throw new Error('无法读取侧影索引文件')

  const index = await indexResponse.json() as SideShadowIndex
  const entries = (index.worlds ?? []).flatMap((world) =>
    (world.characters ?? []).flatMap((character) =>
      (character.shadows ?? []).map((shadowId) => ({ world, character, shadowId }))))

  const results = await Promise.all(entries.map(async ({ world, character, shadowId }) => {
    const metadataPath = `/side-shadows/${world.id}/${character.id}/${shadowId}/shadow.md`
    try {
      const response = await fetch(metadataPath)
      if (!response.ok) throw new Error(`无法读取 ${metadataPath}`)
      const metadata = parseShadowMetadata(await response.text())
      return {
        id: `${world.id}/${character.id}/${shadowId}`,
        worldId: world.id,
        characterId: character.id,
        shadowId,
        title: metadata.name || shadowId,
        thumbnail1: assetUrl(world.id, character.id, shadowId, metadata.thumbnail1 || ''),
        thumbnail2: assetUrl(world.id, character.id, shadowId, metadata.thumbnail2 || ''),
        card1: assetUrl(world.id, character.id, shadowId, metadata.card1 || ''),
        card2: assetUrl(world.id, character.id, shadowId, metadata.card2 || ''),
        rarity: metadata.rarity || '',
        mainAttribute: metadata.mainAttribute || '',
        world: metadata.world || '',
        character: metadata.character || '',
        meet: metadata.meet || '',
        hasKeyStory: metadata.hasKeyStory === 'true',
        portraitImages: [metadata.portrait1, metadata.portrait2, metadata.portrait3, metadata.portrait4]
          .map((path) => assetUrl(world.id, character.id, shadowId, path || ''))
          .filter(Boolean),
      } satisfies SideShadow
    } catch (error) {
      console.warn(`侧影资料读取失败：${metadataPath}`, error)
      return null
    }
  }))

  return results.filter((shadow): shadow is SideShadow => shadow !== null)
}
