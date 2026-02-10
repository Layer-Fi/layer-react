import { type ChangeEvent, type ReactNode, useEffect, useState } from 'react'
import classNames from 'classnames'

import { useElementSize } from '@hooks/useElementSize/useElementSize'
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

  const selectedValue: string | undefined = selected || options[0]?.value

  const baseClassName = classNames(
    'Layer__tabs',
    initialized && 'Layer__tabs--initialized',
  )

  const elementRef = useElementSize<HTMLDivElement>((size) => {
    if (size.width !== currentWidth) {
      setCurrentWidth(size.width)
    }
  })

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    updateSelectPosition(Number(e.target.getAttribute('data-idx') ?? 0))
    onChange(e)
  }

  const updateSelectPosition = (active: number) => {
    if (!elementRef?.current) {
      return
    }

    const optionsNodes = [...elementRef.current.children].filter(c =>
      c.className.includes('Layer__tabs-option'),
    )

    let shift = 0
    let width = thumbPos.width

    optionsNodes.forEach((c, i) => {
      if (i < active) {
        shift = shift + (c as HTMLElement).offsetWidth + 8
      }
      else if (i === active) {
        width = (c as HTMLElement).offsetWidth
      }
    })

    shift = shift + STARTING_PADDING

    setThumbPos({ left: shift, width })
  }

  useEffect(() => {
    const selectedIndex = getSelectedIndex()
    updateSelectPosition(selectedIndex)

    setTimeout(() => {
      setInitialized(true)
    }, 400)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const selectedIndex = getSelectedIndex()
    updateSelectPosition(selectedIndex)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedValue, currentWidth])

  const getSelectedIndex = () => {
    const selectedIndex = options.findIndex(
      option => option.value === selectedValue,
    )
    if (selectedIndex === -1) {
      return 0
    }

    return selectedIndex
  }

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
