import { type ChangeEvent, type ReactNode, useEffect, useLayoutEffect, useRef, useState } from 'react'

import { createLegacyClassNames, type LegacyClassNameMapFor } from '@utils/shared/styles/legacyClassNames'
import { useElementSize } from '@hooks/utils/size/useElementSize'
import { HStack } from '@ui/Stack/Stack'
import { Tab, TABS_OPTION_CLASS_NAME } from '@ui/Tabs/Tab'

import './tabs.scss'

const legacyClassNames = createLegacyClassNames({
  'Layer__UI__Tabs': 'Layer__tabs',
  'Layer__UI__Tabs__Container': 'Layer__tabs__container',
  'Layer__UI__Tabs__Thumb': 'Layer__tabs__thumb',
  'state:initialized': 'Layer__tabs--initialized',
} satisfies LegacyClassNameMapFor<
  'Layer__UI__Tabs' | 'Layer__UI__Tabs__Container' | 'Layer__UI__Tabs__Thumb',
  `state:${string}`
>)

const STARTING_PADDING = 12
const TAB_GAP = 8

interface Option {
  label: string
  value: string
  disabled?: boolean
  disabledMessage?: string
  leftIcon?: ReactNode
  badge?: ReactNode
}

interface TabsProps {
  name: string
  options: Option[]
  selected?: Option['value']
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
}

export const Tabs = ({ name, options, selected, onChange }: TabsProps) => {
  const [isInitialized, setIsInitialized] = useState(false)
  const thumbRef = useRef<HTMLSpanElement>(null)

  const selectedValue = selected || options[0]?.value

  const baseClassName = legacyClassNames(
    'Layer__UI__Tabs',
    isInitialized && 'state:initialized',
  )

  const elementRef = useElementSize<HTMLDivElement>(() => positionThumb())

  function positionThumb() {
    const container = elementRef.current
    const thumb = thumbRef.current
    if (!container || !thumb) {
      return
    }

    const optionsNodes = [...container.children].filter(c =>
      c.className.includes(TABS_OPTION_CLASS_NAME),
    )

    const active = Math.max(0, options.findIndex(option => option.value === selectedValue))

    let shift = STARTING_PADDING
    let width: number | undefined

    optionsNodes.forEach((c, i) => {
      if (i < active) {
        shift = shift + (c as HTMLElement).offsetWidth + TAB_GAP
      }
      else if (i === active) {
        width = (c as HTMLElement).offsetWidth
      }
    })

    thumb.style.left = `${shift}px`
    if (width !== undefined) {
      thumb.style.width = `${width}px`
    }
  }

  useLayoutEffect(() => {
    positionThumb()
  })

  // Enable the thumb transition one frame after the first positioning paint, so mount never animates.
  useEffect(() => {
    const frame = requestAnimationFrame(() => setIsInitialized(true))
    return () => cancelAnimationFrame(frame)
  }, [])

  return (
    <div className={legacyClassNames('Layer__UI__Tabs__Container')}>
      <HStack className={baseClassName} data-initialized={isInitialized || undefined} ref={elementRef}>
        {options.map((option, index) => (
          <Tab
            {...option}
            key={option.value}
            name={name}
            checked={selectedValue === option.value}
            onChange={onChange}
            disabled={option.disabled ?? false}
            disabledMessage={option.disabledMessage}
            index={index}
          />
        ))}
        <span ref={thumbRef} className={legacyClassNames('Layer__UI__Tabs__Thumb')} />
      </HStack>
    </div>
  )
}
