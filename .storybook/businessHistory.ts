// Shared by the manager and the preview, which are same-origin, so the preview's write reaches the
// manager as a `storage` event.
export type RememberedBusiness = { id: string, label?: string }

const STORAGE_KEY = 'layer-storybook-businesses'
const HISTORY_LIMIT = 8

export const readHistory = (): RememberedBusiness[] => {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
    if (!Array.isArray(parsed)) return []

    return parsed.filter((entry): entry is RememberedBusiness =>
      typeof entry === 'object' && entry !== null && typeof (entry as RememberedBusiness).id === 'string')
  }
  catch {
    return []
  }
}

// Keeps a stored label when called without one, so re-entering an id doesn't erase its name.
export const remember = (id: string, label?: string) => {
  const existing = readHistory()
  const resolvedLabel = label ?? existing.find(entry => entry.id === id)?.label
  const entry: RememberedBusiness = resolvedLabel ? { id, label: resolvedLabel } : { id }
  const next = [entry, ...existing.filter(other => other.id !== id)].slice(0, HISTORY_LIMIT)

  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))

  return next
}
