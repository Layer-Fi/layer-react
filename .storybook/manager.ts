import { createElement as h, useCallback, useEffect, useState } from 'react'
import { TooltipLinkList, WithTooltip } from 'storybook/internal/components'
import { addons, types, useGlobals, useGlobalTypes } from 'storybook/manager-api'

import { readHistory, remember, type RememberedBusiness } from './businessHistory'

const ADDON_ID = 'layer/real-backend-business'

const TRIGGER_STYLE = {
  padding: '4px 6px',
  border: '1px solid rgb(0 0 0 / 0.2)',
  borderRadius: 4,
  background: 'transparent',
  color: 'inherit',
  font: '11px/1.4 ui-monospace, monospace',
  cursor: 'pointer',
}

const INPUT_STYLE = {
  padding: '4px 6px',
  border: '1px solid rgb(0 0 0 / 0.2)',
  borderRadius: 4,
  font: '11px/1.4 ui-monospace, monospace',
}

const useBusinessHistory = (current: string, isReady: boolean, restore: (id: string) => void) => {
  const [history, setHistory] = useState(readHistory)

  useEffect(() => {
    if (current) {
      setHistory(remember(current))
      return
    }

    // Only once the preview has registered its globals: updating them before the channel is live
    // silently does nothing, which left the restored id dropped on a cold load.
    if (!isReady) return

    const [mostRecent] = readHistory()
    if (mostRecent) restore(mostRecent.id)
  }, [current, isReady, restore])

  useEffect(() => {
    const sync = () => setHistory(readHistory())

    window.addEventListener('storage', sync)
    return () => window.removeEventListener('storage', sync)
  }, [])

  return history
}

const historyLinks = (
  history: RememberedBusiness[],
  current: string,
  pick: (id: string) => void,
) => history.map(({ id, label }) => ({
  id,
  // `center` is the item's second line, so the name reads as the title and the id as its subtitle.
  title: label ?? 'Unnamed business',
  center: id,
  active: id === current,
  onClick: () => pick(id),
}))

// No JSX: the manager bundle's classic transform needs a `React` binding that lint would delete.
const BusinessInput = () => {
  const globalTypes = useGlobalTypes()
  const [globals, updateGlobals] = useGlobals()

  // Declared by `preview.tsx` in real mode only, so this both keeps the field out of mock Storybook
  // and marks the point at which the preview's globals can be written to.
  const isReady = 'business' in globalTypes
  const current = (globals.business as string | undefined) ?? ''
  const [draft, setDraft] = useState(current)
  const select = useCallback((id: string) => updateGlobals({ business: id }), [updateGlobals])
  const history = useBusinessHistory(current, isReady, select)

  useEffect(() => setDraft(current), [current])

  if (!isReady) return null

  const commit = () => select(draft.trim())

  return h(
    'form',
    {
      style: { display: 'flex', alignItems: 'center', gap: 2 },
      onSubmit: (event: { preventDefault: () => void }) => {
        event.preventDefault()
        commit()
      },
    },
    h('input', {
      'aria-label': 'Business',
      'placeholder': 'Business ID',
      'value': draft,
      'size': 38,
      'onChange': (event: { target: { value: string } }) => setDraft(event.target.value),
      'onBlur': commit,
      'style': INPUT_STYLE,
    }),
    history.length > 0 && h(
      WithTooltip,
      {
        placement: 'bottom',
        trigger: 'click',
        closeOnOutsideClick: true,
        tooltip: ({ onHide }: { onHide: () => void }) => h(TooltipLinkList, {
          links: historyLinks(history, current, (id) => {
            select(id)
            onHide()
          }),
        }),
      },
      h('button', {
        'type': 'button',
        'aria-label': 'Recent businesses',
        'style': TRIGGER_STYLE,
      }, '▾'),
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
