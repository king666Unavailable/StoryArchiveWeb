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
}

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

export type SideShadowCardVariant = 'card1' | 'card2'

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
      } satisfies SideShadow
    } catch (error) {
      console.warn(`侧影资料读取失败：${metadataPath}`, error)
      return null
    }
  }))

  return results.filter((shadow): shadow is SideShadow => shadow !== null)
}
