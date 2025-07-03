import {
  CSSProperties,
  ChangeEvent,
  ReactNode,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { useElementSize } from '../../hooks/useElementSize'
import { Tooltip, TooltipContent, TooltipTrigger } from '../Tooltip'
import classNames from 'classnames'
import { Span } from '../ui/Typography/Text'

export interface Option {
  label: string
  value: string
  disabled?: boolean
  disabledMessage?: string
  leftIcon?: ReactNode
  style?: CSSProperties
}

export enum ToggleSize {
  medium = 'medium',
  small = 'small',
  xsmall = 'xsmall',
}

export interface ToggleProps {
  name: string
  size?: ToggleSize
  options: Option[]
  selected?: Option['value']
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
}

interface ToggleOptionProps extends Option {
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
  const activeOption = useMemo(() => {
    return selected
      ? selected
      : options[0]?.value
  }, [selected, options])

  const toggleRef = useElementSize<HTMLDivElement>((_a, _b, c) => {
    if (c.width && c?.width !== currentWidth) {
      setCurrentWidth(c.width)
    }
  })

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

    const optionsNodes = [...toggleRef.current.children]
      .map((children) => {
        if (
          children.className.includes('Layer__tooltip-trigger')
          && children.children
          && children.children.length > 0
        ) {
          return children.children[0]
        }

        return children
      })
      .filter(children => children?.className.includes('Layer__toggle-option'))

    let shift = 0
    let width = thumbPos.width

    optionsNodes.forEach((c, i) => {
      if (i < active) {
        shift = shift + (c as HTMLElement).offsetWidth
      }
      else if (i === active) {
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const selectedIndex = getSelectedIndex()
    updateThumbPosition(selectedIndex)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentWidth])

  const getSelectedIndex = () => {
    const selectedIndex = options.findIndex(
      option => option.value === activeOption,
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
          checked={activeOption === option.value}
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
  size: _size,
  leftIcon,
  disabled,
  disabledMessage = 'Disabled',
  style,
  index,
}: ToggleOptionProps) => {
  const optionClassName = classNames('Layer__toggle-option', {
    'Layer__toggle-option--active': checked,
  })

  if (disabled) {
    return (
      <Tooltip>
        <TooltipTrigger>
          <label
            className={optionClassName}
            data-checked={checked}
            style={style}
          >
            <input
              type='radio'
              checked={checked}
              name={name}
              onChange={onChange}
              value={value}
              disabled={disabled}
              data-idx={index}
            />
            <span className='Layer__toggle-option-content'>
              {leftIcon && (
                <span className='Layer__toggle-option__icon'>{leftIcon}</span>
              )}
              <Span noWrap>{label}</Span>
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
    <label className={optionClassName} data-checked={checked} style={style}>
      <input
        type='radio'
        checked={checked}
        name={name}
        onChange={onChange}
        value={value}
        disabled={disabled}
        data-idx={index}
      />
      <span className='Layer__toggle-option-content'>
        {leftIcon && (
          <span className='Layer__toggle-option__icon'>{leftIcon}</span>
        )}
        <Span noWrap>{label}</Span>
      </span>
    </label>
  )
}
