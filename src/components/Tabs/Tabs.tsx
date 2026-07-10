import { type ChangeEvent, type ReactNode, useCallback, useEffect, useState } from 'react'
import classNames from 'classnames'

import { useElementSize } from '@hooks/utils/size/useElementSize'
import { HStack } from '@ui/Stack/Stack'
import { Tab } from '@components/Tabs/Tab'

import './tabs.scss'

const STARTING_PADDING = 12

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
  const [thumbPos, setThumbPos] = useState({ left: 0, width: 0 })
  const [currentWidth, setCurrentWidth] = useState(0)

  const selectedValue = selected || options[0].value

  const baseClassName = classNames(
    'Layer__tabs',
    initialized && 'Layer__tabs--initialized',
  )

  const elementRef = useElementSize<HTMLDivElement>((size) => {
    setCurrentWidth(previous => previous === size.width ? previous : size.width)
  })

  const updateSelectPosition = useCallback((active: number) => {
    if (!elementRef.current) {
      return
    }

    const optionsNodes = [...elementRef.current.children].filter(c =>
      c.className.includes('Layer__tabs-option'),
    )

    let shift = STARTING_PADDING
    let width: number | undefined

    optionsNodes.forEach((c, i) => {
      if (i < active) {
        shift = shift + (c as HTMLElement).offsetWidth + 8
      }
      else if (i === active) {
        width = (c as HTMLElement).offsetWidth
      }
    })

    setThumbPos(previous => ({ left: shift, width: width ?? previous.width }))
  }, [elementRef])

  const getSelectedIndex = useCallback(() => {
    const selectedIndex = options.findIndex(
      option => option.value === selectedValue,
    )

    return selectedIndex === -1 ? 0 : selectedIndex
  }, [options, selectedValue])

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    updateSelectPosition(Number(e.target.getAttribute('data-idx') ?? 0))
    onChange(e)
  }

  useEffect(() => {
    const timeout = setTimeout(() => setInitialized(true), 400)
    return () => clearTimeout(timeout)
  }, [])

  useEffect(() => {
    if (currentWidth === 0) {
      return
    }

    updateSelectPosition(getSelectedIndex())
  }, [currentWidth, getSelectedIndex, updateSelectPosition])

  return (
    <div className='Layer__tabs__container'>
      <HStack className={baseClassName} ref={elementRef}>
        {options.map((option, index) => (
          <Tab
            {...option}
            key={option.value}
            name={name}
            checked={selectedValue === option.value}
            onChange={handleChange}
            disabled={option.disabled ?? false}
            disabledMessage={option.disabledMessage}
            index={index}
          />
        ))}
        <span className='Layer__tabs__thumb' style={{ ...thumbPos }} />
      </HStack>
    </div>
  )
}
