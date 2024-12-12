import React, { useState, useEffect, useRef } from 'react'
import Check from '../../icons/Check'
import ChevronDown from '../../icons/ChevronDown'

export type PeriodPickerOption =
  | 'month'
  | 'quarter'
  | 'year'
  | '2_months'
  | '3_months'
  | '6_months'
  | '12_months'
  | '2_quarters'
  | '3_quarters'
  | '4_quarters'
  | '8_quarters'
  | '2_years'
  | '3_years'

interface PeriodPickerProps {
  onSelect: (option: {
    key: PeriodPickerOption
    start_date: string
    end_date: string
  }) => void
  defaultValue?: PeriodPickerOption
}

const periodLabelMap: Record<PeriodPickerOption, string> = {
  'month': 'Month',
  'quarter': 'Quarter',
  'year': 'Year',
  '2_months': '2 months',
  '3_months': '3 months',
  '6_months': '6 months',
  '12_months': '12 months',
  '2_quarters': '2 quarters',
  '3_quarters': '3 quarters',
  '4_quarters': '4 quarters',
  '8_quarters': '8 quarters',
  '2_years': '2 years',
  '3_years': '3 years',
}

export const PeriodPicker = ({ onSelect, defaultValue }: PeriodPickerProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedOption, setSelectedOption] = useState<PeriodPickerOption>(
    () => {
      const storedOption = localStorage.getItem('selectedPeriodOption')
      return storedOption
        ? (storedOption as PeriodPickerOption)
        : defaultValue || 'month'
    },
  )

  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!selectedOption && defaultValue) {
      setSelectedOption(defaultValue)
    }
  }, [defaultValue, selectedOption])

  const toggleDropdown = () => {
    setIsOpen(!isOpen)
  }

  const getStartEndDate = (
    option: PeriodPickerOption,
  ): { start_date: string, end_date: string } => {
    const currentDate = new Date()
    let startDate: Date
    let endDate: Date

    switch (option) {
      case 'month':
        startDate = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          1,
        )
        endDate = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() + 1,
          0,
        )
        break
      case 'quarter': {
        const currentQuarter = Math.floor(currentDate.getMonth() / 3)
        startDate = new Date(currentDate.getFullYear(), currentQuarter * 3, 1)
        endDate = new Date(currentDate.getFullYear(), currentQuarter * 3 + 3, 0)
        break
      }
      case 'year':
        startDate = new Date(currentDate.getFullYear(), 0, 1)
        endDate = new Date(currentDate.getFullYear(), 11, 31)
        break
      case '2_months':
        startDate = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() - 1,
          1,
        )
        endDate = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() + 1,
          0,
        )
        break
      case '3_months':
        startDate = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() - 2,
          1,
        )
        endDate = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() + 1,
          0,
        )
        break
      case '6_months':
        startDate = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() - 5,
          1,
        )
        endDate = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() + 1,
          0,
        )
        break
      case '12_months':
        startDate = new Date(
          currentDate.getFullYear() - 1,
          currentDate.getMonth(),
          1,
        )
        endDate = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() + 1,
          0,
        )
        break
      case '2_quarters': {
        const currentQuarter2 = Math.floor(currentDate.getMonth() / 3)
        startDate = new Date(
          currentDate.getFullYear(),
          currentQuarter2 * 3 - 3,
          1,
        )
        endDate = new Date(
          currentDate.getFullYear(),
          currentQuarter2 * 3 + 3,
          0,
        )
        break
      }
      case '3_quarters': {
        const currentQuarter3 = Math.floor(currentDate.getMonth() / 3)
        startDate = new Date(
          currentDate.getFullYear(),
          currentQuarter3 * 3 - 6,
          1,
        )
        endDate = new Date(
          currentDate.getFullYear(),
          currentQuarter3 * 3 + 3,
          0,
        )
        break
      }
      case '4_quarters': {
        const currentQuarter4 = Math.floor(currentDate.getMonth() / 3)
        startDate = new Date(
          currentDate.getFullYear(),
          currentQuarter4 * 3 - 9,
          1,
        )
        endDate = new Date(
          currentDate.getFullYear(),
          currentQuarter4 * 3 + 3,
          0,
        )
        break
      }
      case '8_quarters': {
        const currentQuarter8 = Math.floor(currentDate.getMonth() / 3)
        startDate = new Date(
          currentDate.getFullYear(),
          currentQuarter8 * 3 - 21,
          1,
        )
        endDate = new Date(
          currentDate.getFullYear(),
          currentQuarter8 * 3 + 3,
          0,
        )
        break
      }
      case '2_years':
        startDate = new Date(currentDate.getFullYear() - 2, 0, 1)
        endDate = new Date(currentDate.getFullYear(), 11, 31)
        break
      case '3_years':
        startDate = new Date(currentDate.getFullYear() - 3, 0, 1)
        endDate = new Date(currentDate.getFullYear(), 11, 31)
        break
      default:
        startDate = new Date()
        endDate = new Date()
    }

    return {
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0],
    }
  }

  const handleOptionClick = (option: PeriodPickerOption) => {
    setSelectedOption(option)
    setIsOpen(false)
    const dates = getStartEndDate(option)
    onSelect({
      key: option,
      start_date: dates.start_date,
      end_date: dates.end_date,
    })
    localStorage.setItem('selectedPeriodOption', option)
  }

  const handleClickOutside = (event: MouseEvent) => {
    if (
      dropdownRef.current
      && !dropdownRef.current.contains(event.target as Node)
    ) {
      setIsOpen(false)
    }
  }

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const renderOption = (option: PeriodPickerOption) => (
    <div
      key={option}
      className={`Layer__option ${
        selectedOption === option ? 'Layer__selected' : ''
      }`}
      onClick={() => handleOptionClick(option)}
    >
      {periodLabelMap[option]}
      {selectedOption === option && (
        <span className='Layer__tick'>
          <Check />
        </span>
      )}
    </div>
  )

  return (
    <div className='Layer__date-picker' ref={dropdownRef}>
      <button className='Layer__dropdown-toggle' onClick={toggleDropdown}>
        {selectedOption
          ? `${periodLabelMap[selectedOption]} view`
          : 'Select an option'}
        <span className={`Layer__chevron ${isOpen ? 'open' : ''}`}>
          <ChevronDown />
        </span>
      </button>
      {isOpen && (
        <div className='Layer__dropdown-menu Layer__fade-in'>
          <div className='Layer__compare-options-wrapper'>
            {renderOption('month')}
            {renderOption('quarter')}
            {renderOption('year')}
          </div>
          <div className='Layer__compare-options-wrapper'>
            <div className='Layer__compare-header'>Compare months</div>
            <div className='Layer__compare-options'>
              {renderOption('2_months')}
              {renderOption('3_months')}
              {renderOption('6_months')}
              {renderOption('12_months')}
            </div>
          </div>
          <div className='Layer__compare-options-wrapper'>
            <div className='Layer__compare-header'>Compare quarters</div>
            <div className='Layer__compare-options'>
              {renderOption('2_quarters')}
              {renderOption('3_quarters')}
              {renderOption('4_quarters')}
              {renderOption('8_quarters')}
            </div>
          </div>
          <div className='Layer__compare-options-wrapper'>
            <div className='Layer__compare-header'>Compare years</div>
            <div className='Layer__compare-options'>
              {renderOption('2_years')}
              {renderOption('3_years')}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
