export type ReaderProfile = {
  userLastname: string
  userFirstName: string
  gameName: string
}

const storageKey = 'story-world-hub:reader-profile'
const promptPreferenceKey = 'story-world-hub:reader-name-prompt-enabled'
const variablePattern = /\{(?:userLastname|userFirstName|userName|gameName|user)\}/

export function hasReaderNameVariables(text: string): boolean {
  return variablePattern.test(text)
}

export function loadReaderNamePromptEnabled(): boolean {
  try {
    return localStorage.getItem(promptPreferenceKey) !== 'false'
  } catch {
    return true
  }
}

export function saveReaderNamePromptEnabled(enabled: boolean): void {
  localStorage.setItem(promptPreferenceKey, String(enabled))
}

export function loadReaderProfile(): ReaderProfile {
  try {
    const value = localStorage.getItem(storageKey)
    if (!value) return { userLastname: '', userFirstName: '', gameName: '' }
    const parsed = JSON.parse(value) as Partial<ReaderProfile>
    return {
      userLastname: typeof parsed.userLastname === 'string' ? parsed.userLastname : '',
      userFirstName: typeof parsed.userFirstName === 'string' ? parsed.userFirstName : '',
      gameName: typeof parsed.gameName === 'string' ? parsed.gameName : '',
    }
  } catch {
    return { userLastname: '', userFirstName: '', gameName: '' }
  }
}

export function saveReaderProfile(profile: ReaderProfile): ReaderProfile {
  const saved = {
    userLastname: profile.userLastname.trim(),
    userFirstName: profile.userFirstName.trim(),
    gameName: profile.gameName.trim(),
  }
  localStorage.setItem(storageKey, JSON.stringify(saved))
  return saved
}
