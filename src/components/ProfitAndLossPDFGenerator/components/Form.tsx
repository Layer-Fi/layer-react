import React, { ChangeEvent } from 'react'
import { YEARS, MONTHS, MONTH_NAMES } from '../util'
import { PDFGenerationFormData } from '../ProfitAndLossPDFGenerator'
import classNames from 'classnames'
import { Checkbox } from '../../ui/Checkbox/Checkbox'

interface Props {
  handleChange:(e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void
  formData: PDFGenerationFormData
  showPreview: boolean
  setShowPreview: React.Dispatch<React.SetStateAction<boolean>>
  showPreviousMonth: boolean
  setShowPreviousMonth: React.Dispatch<React.SetStateAction<boolean>>
  fetchData: () => Promise<void>
  isButtonDisabled: boolean
}

const Form = ({
  handleChange, formData, showPreview, setShowPreview, setShowPreviousMonth,
  fetchData, isButtonDisabled, showPreviousMonth
}: Props) => {
  return <form className={'Layer__pdf-generation-form'}>
    <h2 className={
      'Layer__pdf-generation-form-header'
    }>P&L PDF Generator</h2>
    <div className={'Layer__pdf-generation-form-fields'}>
      <div className={'Layer__pdf-generation-form-field' }>
        <label
          htmlFor='year'
          className={'Layer__pdf-generation-form-label'}
        >
          Year
        </label>
        <select
          id='year'
          name='year'
          value={formData.year || ''}
          className={'Layer__pdf-generation-select-input'}
          onChange={handleChange}
        >
          <option value='' disabled>
            Select Year
          </option>
          {YEARS.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>

      <div className='Layer__pdf-generation-form-field'>
        <label
          htmlFor='month'
          className='Layer__pdf-generation-form-label'
        >
          Month
        </label>
        <select
          id='month'
          name='month'
          className='Layer__pdf-generation-select-input'
          value={formData.month || ''}
          onChange={handleChange}
        >
          <option value='' disabled>
            Select Month
          </option>
          {MONTHS.map((month) => (
            <option key={month} value={month}>
              {MONTH_NAMES[month]}
            </option>
          ))}
        </select>
      </div>
      <div className='Layer__pdf-generation-form-field--horizontal'>
        <label
          htmlFor='show-previous-month'
          className={
            classNames(
              'Layer__pdf-generation-form-label',
              'Layer__pdf-generation-form-label--checkbox-label'
            )
          }
        >
          Show Previous Month
        </label>
        <Checkbox
          isSelected={showPreviousMonth}
          onChange={(e) => {setShowPreviousMonth(e)
            setShowPreview(false)}}
          id='show-previous-month'
        />
      </div>
      {/*
      <div className='Layer__pdf-generation-form-field'>
        <label
          htmlFor='structure1'
          className='Layer__pdf-generation-form-label'
        >
          Combined P&L Structure
        </label>
        <select
          id='structure1'
          name='structure1'
          value={formData.structure1 || 'DEFAULT'}
          className='Layer__pdf-generation-select-input'
          onChange={handleChange}
        >
          <option value='' disabled>
            Select Combined P&L Structure
          </option>
          {STRUCTURES.map((structure) => (
            <option key={structure} value={structure}>
              {structure}
            </option>
          ))}
        </select>
      </div>

      <div className='Layer__pdf-generation-form-field'>
        <label
          htmlFor='structure2'
          className='Layer__pdf-generation-form-label'
        >
          PC & MSO P&L Structure
        </label>
        <select
          id='structure2'
          name='structure2'
          value={formData.structure2 || 'DEFAULT'}
          className='Layer__pdf-generation-select-input'
          onChange={handleChange}
        >
          <option value='' disabled>
            Select PC & MSO P&L Structure
          </option>
          {STRUCTURES.map((structure) => (
            <option key={structure} value={structure}>
              {structure}
            </option>
          ))}
        </select>
      </div>
      */}

      <button
        type='button'
        onClick={fetchData}
        className={
          classNames(
            'Layer__pdf-form-button',
            isButtonDisabled ? 'Layer__pdf-form-button--disabled' : ''
          )
        }
        disabled={isButtonDisabled}
      >
        {showPreview ? 'Re-Generate' : 'Generate'}
      </button>
    </div>
  </form>
}

export default Form
