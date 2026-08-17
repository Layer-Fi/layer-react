// Shared by the manager and the preview: same-origin, so a write raises `storage` in the other.
export type RememberedBusiness = { id: string, label?: string }

const STORAGE_KEY = 'layer-storybook-businesses'
const HISTORY_LIMIT = 8

const isRemembered = (value: unknown): value is RememberedBusiness =>
  typeof value === 'object' && value !== null && typeof (value as RememberedBusiness).id === 'string'

export const readHistory = (): RememberedBusiness[] => {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')

    return Array.isArray(parsed) ? parsed.filter(isRemembered) : []
  }
  catch {
    return []
  }
}

export const remember = (id: string, label?: string) => {
  const existing = readHistory()
  const resolvedLabel = label ?? existing.find(entry => entry.id === id)?.label
  const entry: RememberedBusiness = resolvedLabel ? { id, label: resolvedLabel } : { id }
  const next = [entry, ...existing.filter(other => other.id !== id)].slice(0, HISTORY_LIMIT)

  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))

  return next
}
