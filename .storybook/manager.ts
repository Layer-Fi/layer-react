import { createElement as h, useEffect, useState } from 'react'
import { addons, types, useGlobals, useGlobalTypes } from 'storybook/manager-api'

import { readHistory, remember } from './businessHistory'

const ADDON_ID = 'layer/real-backend-business'
const DATALIST_ID = 'layer-business-history'

const INPUT_STYLE = {
  padding: '4px 6px',
  border: '1px solid rgb(0 0 0 / 0.2)',
  borderRadius: 4,
  font: '11px/1.4 ui-monospace, monospace',
}

// No JSX: the manager bundle's classic transform needs a `React` binding that lint would delete.
const BusinessInput = () => {
  const globalTypes = useGlobalTypes()
  const [globals, updateGlobals] = useGlobals()

  const current = (globals.business as string | undefined) ?? ''
  const [draft, setDraft] = useState(current)
  const [history, setHistory] = useState(readHistory)

  useEffect(() => setDraft(current), [current])

  useEffect(() => {
    if (current) {
      setHistory(remember(current))
      return
    }

    const [mostRecent] = readHistory()
    if (mostRecent) updateGlobals({ business: mostRecent.id })
  }, [current, updateGlobals])

  useEffect(() => {
    const onStorage = () => setHistory(readHistory())

    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  // Declared by `preview.tsx` in real mode only, so this keeps the field out of mock Storybook.
  if (!('business' in globalTypes)) return null

  const commit = () => updateGlobals({ business: draft.trim() })

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
    h(
      'datalist',
      { id: DATALIST_ID },
      history.map(({ id, label }) =>
        h('option', { key: id, value: id, label: label ? `${label} — ${id}` : undefined }),
      ),
    ),
  )
}

addons.register(ADDON_ID, () => {
  addons.add(ADDON_ID, {
    type: types.TOOL,
    title: 'Business',
    render: () => h(BusinessInput),
  })
})
