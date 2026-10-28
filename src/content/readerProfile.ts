export type ReaderProfile = {
  userLastname: string
  userFirstName: string
}

const storageKey = 'story-world-hub:reader-profile'
const variablePattern = /\{(?:userLastname|userFirstName|userName|user)\}/

export function hasReaderNameVariables(text: string): boolean {
  return variablePattern.test(text)
}

export function loadReaderProfile(): ReaderProfile {
  try {
    const value = localStorage.getItem(storageKey)
    if (!value) return { userLastname: '', userFirstName: '' }
    const parsed = JSON.parse(value) as Partial<ReaderProfile>
    return {
      userLastname: typeof parsed.userLastname === 'string' ? parsed.userLastname : '',
      userFirstName: typeof parsed.userFirstName === 'string' ? parsed.userFirstName : '',
    }
  } catch {
    return { userLastname: '', userFirstName: '' }
  }
}

export function saveReaderProfile(profile: ReaderProfile): ReaderProfile {
  const saved = {
    userLastname: profile.userLastname.trim(),
    userFirstName: profile.userFirstName.trim(),
  }
  localStorage.setItem(storageKey, JSON.stringify(saved))
  return saved
}
