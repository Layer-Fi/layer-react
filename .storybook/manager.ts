import { createElement as h, useCallback, useEffect, useState } from 'react'
import { addons, types, useGlobals, useGlobalTypes } from 'storybook/manager-api'

import { readHistory, remember, type RememberedBusiness } from './businessHistory'

const ADDON_ID = 'layer/real-backend-business'
const DATALIST_ID = 'layer-business-history'

const INPUT_STYLE = {
  padding: '4px 6px',
  border: '1px solid rgb(0 0 0 / 0.2)',
  borderRadius: 4,
  font: '11px/1.4 ui-monospace, monospace',
}

// Records whatever is active, restores the most recent when nothing is, and picks up the legal names
// the preview resolves.
const useBusinessHistory = (current: string, restore: (id: string) => void) => {
  const [history, setHistory] = useState(readHistory)

  useEffect(() => {
    if (current) {
      setHistory(remember(current))
      return
    }

    const [mostRecent] = readHistory()
    if (mostRecent) restore(mostRecent.id)
  }, [current, restore])

  useEffect(() => {
    const sync = () => setHistory(readHistory())

    window.addEventListener('storage', sync)
    return () => window.removeEventListener('storage', sync)
  }, [])

  return history
}

const historyOptions = (history: RememberedBusiness[]) =>
  h('datalist', { id: DATALIST_ID }, history.map(({ id, label }) =>
    h('option', { key: id, value: id, label: label ? `${label} — ${id}` : undefined }),
  ))

// No JSX: the manager bundle's classic transform needs a `React` binding that lint would delete.
const BusinessInput = () => {
  const globalTypes = useGlobalTypes()
  const [globals, updateGlobals] = useGlobals()

  const current = (globals.business as string | undefined) ?? ''
  const [draft, setDraft] = useState(current)
  const select = useCallback((id: string) => updateGlobals({ business: id }), [updateGlobals])
  const history = useBusinessHistory(current, select)

  useEffect(() => setDraft(current), [current])

  // Declared by `preview.tsx` in real mode only, so this keeps the field out of mock Storybook.
  if (!('business' in globalTypes)) return null

  const commit = () => select(draft.trim())

  return h(
    'form',
    {
      style: { display: 'flex', alignItems: 'center' },
      onSubmit: (event: { preventDefault: () => void }) => {
        event.preventDefault()
        commit()
      },
    },
    h('input', {
      'aria-label': 'Business',
      'placeholder': 'Business ID',
      'list': DATALIST_ID,
      'value': draft,
      'size': 38,
      'onChange': (event: { target: { value: string } }) => setDraft(event.target.value),
      'onBlur': commit,
      'style': INPUT_STYLE,
    }),
    historyOptions(history),
  )
}

addons.register(ADDON_ID, () => {
  addons.add(ADDON_ID, {
    type: types.TOOL,
    title: 'Business',
    render: () => h(BusinessInput),
  })
})
