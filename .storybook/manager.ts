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

/**
 * A free-text field rather than a dropdown: demo businesses are replaced often, so any curated list
 * would go stale and need re-curating. Previously used businesses come back as autocomplete,
 * labelled with the legal name the preview resolved for them.
 *
 * Written with `createElement` rather than JSX because the manager bundle uses the classic
 * transform, which needs a `React` binding that nothing references — so lint deletes it and the
 * toolbar throws "React is not defined" at runtime.
 */
const BusinessInput = () => {
  const globalTypes = useGlobalTypes()
  const [globals, updateGlobals] = useGlobals()

  const current = (globals.business as string | undefined) ?? ''
  const [draft, setDraft] = useState(current)
  const [history, setHistory] = useState(readHistory)

  useEffect(() => setDraft(current), [current])

  // Globals live in the URL, which a bare visit doesn't carry — so the last id is restored rather
  // than retyped. A URL-supplied id always wins.
  useEffect(() => {
    if (current) {
      setHistory(remember(current))
      return
    }

    const [mostRecent] = readHistory()
    if (mostRecent) updateGlobals({ business: mostRecent.id })
  }, [current, updateGlobals])

  // Fires when the preview iframe stores a resolved legal name, which is how labels appear here.
  useEffect(() => {
    const onStorage = () => setHistory(readHistory())

    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  // Declared by `preview.tsx` in real mode only, so this is what keeps the field out of the
  // mock-backed Storybook.
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
