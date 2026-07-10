import { type ChangeEvent, type ReactNode, useEffect, useLayoutEffect, useRef } from 'react'

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
  const thumbRef = useRef<HTMLSpanElement>(null)

  const selectedValue = selected || options[0].value

  const elementRef = useElementSize<HTMLDivElement>(() => positionThumb())

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

  // Enable the thumb transition one frame after the first positioning paint, so mount never animates.
  // Applied via classList (like the thumb itself) - the container's rendered className never changes,
  // so React's prop diffing won't remove it.
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      elementRef.current?.classList.add('Layer__tabs--initialized')
    })
    return () => cancelAnimationFrame(frame)
  }, [elementRef])

  return (
    <div className='Layer__tabs__container'>
      <HStack className='Layer__tabs' ref={elementRef}>
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
