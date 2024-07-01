import React, { useState, useEffect, useRef } from 'react'
import Check from '../../icons/Check'
import ChevronDown from '../../icons/ChevronDown'

export const PeriodPicker = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedOption, setSelectedOption] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)
  
  const toggleDropdown = () => {
    setIsOpen(!isOpen)
  }

  const handleOptionClick = (option: string) => {
    setSelectedOption(option)
    setIsOpen(false)
  }

  const handleClickOutside = (event: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node)
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

  const renderOption = (option: string) => (
    <div
      className={`Layer__option ${
        selectedOption === option ? 'Layer__selected' : ''
      }`}
      onClick={() => handleOptionClick(option)}
    >
      {option}
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
        {selectedOption ? `${selectedOption} view` : 'Select an option'}
        <span className={`Layer__chevron ${isOpen ? 'open' : ''}`}>
          <ChevronDown />
        </span>
      </button>
      {isOpen && (
        <div className='Layer__dropdown-menu Layer__fade-in'>
          <div className='Layer__compare-options-wrapper'>
            {renderOption('Month')}
            {renderOption('Quarter')}
            {renderOption('Year')}
          </div>
          <div className='Layer__compare-options-wrapper'>
            <div className='Layer__compare-header'>Compare months</div>
            <div className='Layer__compare-options'>
              {renderOption('2 months')}
              {renderOption('3 months')}
              {renderOption('6 months')}
              {renderOption('12 months')}
            </div>
          </div>
          <div className='Layer__compare-options-wrapper'>
            <div className='Layer__compare-header'>Compare quarters</div>
            <div className='Layer__compare-options'>
              {renderOption('2 quarters')}
              {renderOption('3 quarters')}
              {renderOption('4 quarters')}
              {renderOption('8 quarters')}
            </div>
          </div>
          <div className='Layer__compare-options-wrapper'>
            <div className='Layer__compare-header'>Compare years</div>
            <div className='Layer__compare-options'>
              {renderOption('2 years')}
              {renderOption('3 years')}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
