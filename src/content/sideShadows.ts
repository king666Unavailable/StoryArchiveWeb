export type SideShadow = {
  id: string
  title: string
  thumbnail: string
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
        title: metadata.name || shadowId,
        thumbnail: assetUrl(world.id, character.id, shadowId, metadata.thumbnail || ''),
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
