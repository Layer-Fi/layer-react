import { type ChangeEvent, type ReactNode, useEffect, useLayoutEffect, useRef, useState } from 'react'
import classNames from 'classnames'

import { useElementSize } from '@hooks/utils/size/useElementSize'
import { HStack } from '@ui/Stack/Stack'
import { Tab } from '@components/Tabs/Tab'

import './tabs.scss'

const STARTING_PADDING = 12
const TAB_GAP = 8

interface Option {
  label: string
  value: string
  disabled?: boolean
  disabledMessage?: string
  leftIcon?: ReactNode
}

interface TabsProps {
  name: string
  options: Option[]
  selected?: Option['value']
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
}

export const Tabs = ({ name, options, selected, onChange }: TabsProps) => {
  const [initialized, setInitialized] = useState(false)
  const thumbRef = useRef<HTMLSpanElement>(null)

  const selectedValue = selected || options[0].value

  const baseClassName = classNames(
    'Layer__tabs',
    initialized && 'Layer__tabs--initialized',
  )

  const elementRef = useElementSize<HTMLDivElement>(() => positionThumb())

  // The thumb mirrors rendered tab layout, so it is measured and styled directly rather than via state.
  function positionThumb() {
    const container = elementRef.current
    const thumb = thumbRef.current
    if (!container || !thumb) {
      return
    }

    const optionsNodes = [...container.children].filter(c =>
      c.className.includes('Layer__tabs-option'),
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

  useEffect(() => {
    const timeout = setTimeout(() => setInitialized(true), 400)
    return () => clearTimeout(timeout)
  }, [])

  return (
    <div className='Layer__tabs__container'>
      <HStack className={baseClassName} ref={elementRef}>
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
        <span ref={thumbRef} className='Layer__tabs__thumb' />
      </HStack>
    </div>
  )
}
