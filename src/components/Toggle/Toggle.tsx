import React, {
  ChangeEvent,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react'
import { useElementSize } from '../../hooks/useElementSize'
import { Tooltip, TooltipContent, TooltipTrigger } from '../Tooltip'
import classNames from 'classnames'

export interface Option {
  label: string
  value: string
  disabled?: boolean
  disabledMessage?: string
  leftIcon?: ReactNode
}

export enum ToggleSize {
  medium = 'medium',
  small = 'small',
}

export interface ToggleProps {
  name: string
  size?: ToggleSize
  options: Option[]
  selected?: Option['value']
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
}

interface ToggleOptionProps {
  checked: boolean
  label: string
  name: string
  size: ToggleSize
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
  value: string
  disabled?: boolean
  disabledMessage?: string
  leftIcon?: ReactNode
  index: number
}

export const Toggle = ({
  name,
  options,
  selected,
  onChange,
  size = ToggleSize.medium,
}: ToggleProps) => {
  const [currentWidth, setCurrentWidth] = useState(0)
  const [thumbPos, setThumbPos] = useState({ left: 0, width: 0 })
  const [initialized, setInitialized] = useState(false)

  const toggleRef = useElementSize<HTMLDivElement>((a, b, c) => {
    if (c.width && c?.width !== currentWidth) {
      setCurrentWidth(c.width)
    }
  })

  const selectedValue = selected || options[0].value
  const baseClassName = classNames(
    'Layer__toggle',
    `Layer__toggle--${size}`,
    initialized ? 'Layer__toggle--initialized' : '',
  )

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    updateThumbPosition(Number(e.target.getAttribute('data-idx') ?? 0))
    onChange(e)
  }

  const updateThumbPosition = (active: number) => {
    if (!toggleRef?.current) {
      return
    }

    const optionsNodes = [...toggleRef.current.children].filter(c =>
      c.className.includes('Layer__toggle-option'),
    )

    let shift = 0
    let width = thumbPos.width

    optionsNodes.forEach((c, i) => {
      if (i < active) {
        shift = shift + (c as HTMLElement).offsetWidth
      } else if (i === active) {
        width = (c as HTMLElement).offsetWidth
      }
    })

    shift = shift + (size === ToggleSize.medium ? 2 : 1.5)

    setThumbPos({ left: shift, width })
  }

  useEffect(() => {
    const selectedIndex = getSelectedIndex()
    updateThumbPosition(selectedIndex)

    setTimeout(() => {
      setInitialized(true)
    }, 400)
  }, [])

  useEffect(() => {
    const selectedIndex = getSelectedIndex()
    updateThumbPosition(selectedIndex)
  }, [currentWidth])

  const getSelectedIndex = () => {
    let selectedIndex = options.findIndex(
      option => option.value === selectedValue,
    )
    if (selectedIndex === -1) {
      return 0
    }

    return selectedIndex
  }

  return (
    <div className={baseClassName} ref={toggleRef}>
      {options.map((option, index) => (
        <ToggleOption
          {...option}
          size={size}
          key={option.value}
          name={name}
          checked={selectedValue === option.value}
          onChange={handleChange}
          disabled={option.disabled ?? false}
          disabledMessage={option.disabledMessage}
          index={index}
        />
      ))}
      <span className='Layer__toggle__thumb' style={{ ...thumbPos }} />
    </div>
  )
}

const ToggleOption = ({
  checked,
  label,
  name,
  onChange,
  value,
  size,
  leftIcon,
  disabled,
  disabledMessage = 'Disabled',
  index,
}: ToggleOptionProps) => {
  if (disabled) {
    return (
      <Tooltip>
        <TooltipTrigger>
          <label className={`Layer__toggle-option`} data-checked={checked}>
            <input
              type='radio'
              checked={checked}
              name={name}
              onChange={onChange}
              value={value}
              disabled={disabled ?? false}
              data-idx={index}
            />
            <span className='Layer__toggle-option-content'>
              {leftIcon && (
                <span className='Layer__toggle-option__icon'>{leftIcon}</span>
              )}
              <span>{label}</span>
            </span>
          </label>
        </TooltipTrigger>
        <TooltipContent className='Layer__tooltip'>
          {disabledMessage}
        </TooltipContent>
      </Tooltip>
    )
  }

  return (
    <label className={`Layer__toggle-option`} data-checked={checked}>
      <input
        type='radio'
        checked={checked}
        name={name}
        onChange={onChange}
        value={value}
        disabled={disabled ?? false}
        data-idx={index}
      />
      <span className='Layer__toggle-option-content'>
        {leftIcon && (
          <span className='Layer__toggle-option__icon'>{leftIcon}</span>
        )}
        <span>{label}</span>
      </span>
    </label>
  )
}
