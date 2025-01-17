import { useState, useEffect } from 'react'
import classNames from 'classnames'

interface SwitchButtonProps {
  children: string
  labelPosition?: 'left' | 'right'
  checked?: boolean
  defaultChecked?: boolean
  onChange?: (checked: boolean) => void
  disabled?: boolean
}

export const SwitchButton: React.FC<SwitchButtonProps> = ({
  children,
  checked,
  labelPosition = 'left',
  defaultChecked = false,
  onChange,
  disabled = false,
}) => {
  const [isChecked, setIsChecked] = useState(defaultChecked)

  useEffect(() => {
    if (checked !== undefined) {
      setIsChecked(checked)
    }
  }, [checked])

  const handleToggle = () => {
    if (disabled) return
    const newChecked = !isChecked
    if (checked === undefined) {
      setIsChecked(newChecked)
    }
    if (onChange) {
      onChange(newChecked)
    }
  }

  const switchClassNames = classNames(
    'Layer__switch__container',
    disabled && 'Layer__switch__container--disabled',
  )

  const buttonClassNames = classNames(
    'Layer__switch__button',
    isChecked && 'Layer__switch__button--checked',
    disabled && 'Layer__switch__button--disabled',
  )

  return (
    <div className={switchClassNames}>
      <button
        type='button'
        className={buttonClassNames}
        onClick={handleToggle}
        disabled={disabled}
        aria-pressed={isChecked}
      >
        {labelPosition === 'left' && (
          <span className='Layer__switch__label'>{children}</span>
        )}
        <div className='Layer__switch__knob__wrapper'>
          <div className='Layer__switch__knob'></div>
        </div>
        {labelPosition === 'right' && (
          <span className='Layer__switch__label'>{children}</span>
        )}
      </button>
    </div>
  )
}
