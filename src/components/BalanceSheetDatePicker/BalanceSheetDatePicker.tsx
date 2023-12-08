import React, { useRef } from 'react'
import CalendarIcon from '../../icons/Calendar'
import { format } from 'date-fns'

type Props = {
  value: Date
  onChange: React.ChangeEventHandler<HTMLInputElement>
}

export const BalanceSheetDatePicker = ({ value, onChange }: Props) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const showPicker = () => inputRef.current && inputRef.current.showPicker()
  return (
    <span className="Layer__balance-sheet-date-picker">
      <button onClick={showPicker}>
        <CalendarIcon />
        {format(value, 'LLLL dd, yyyy')}
        <input
          type="date"
          ref={inputRef}
          value={format(value, 'yyyy-MM-dd')}
          onChange={onChange}
        />
      </button>
    </span>
  )
}
