import React from 'react'
import Page from './Page'
import Table from './Table'
import Header from './Header'
import SummaryBox from './SummaryBox'
import { addPlaceHoldersToPNLs, getMoM, MONTH_NAMES } from '../util'
import { Business, Month, ProfitAndLoss } from '../../../types'
import { PDFGenerationFormData } from '../ProfitAndLossPDFGenerator'

interface Props {
  business: Business | undefined
  formData: PDFGenerationFormData
  priorMonthData: ProfitAndLoss | null
  priorMonthDataPc: ProfitAndLoss | null
  priorMonthDataMso: ProfitAndLoss | null
  selectedMonthData: ProfitAndLoss | null
  selectedMonthDataPc: ProfitAndLoss | null
  selectedMonthDataMso: ProfitAndLoss | null
  showPreviousMonth: boolean
  priorMonth: Month
}

const PDF = ({
  business, formData,
  priorMonthData, priorMonthDataPc, priorMonthDataMso,
  selectedMonthData, selectedMonthDataPc, selectedMonthDataMso,
  showPreviousMonth, priorMonth}: Props) => {

  const incomeDelta = getMoM(
    priorMonthData?.income.value || 0,
    selectedMonthData?.income.value || 0
  )
  const expensesDelta = getMoM(
    priorMonthData?.expenses.value || 0,
    selectedMonthData?.expenses.value || 0
  )
  const profitDelta = getMoM(
    priorMonthData?.net_profit || 0,
    selectedMonthData?.net_profit || 0
  )

  let priorMonthDataPadded: ProfitAndLoss | null = null
  let selectedMonthDataPadded: ProfitAndLoss | null = null
  if (priorMonthData && selectedMonthData) {
    const { pnl1, pnl2 } = addPlaceHoldersToPNLs(
      priorMonthData,
      selectedMonthData
    )
    priorMonthDataPadded = pnl1
    selectedMonthDataPadded = pnl2
  }

  let priorMonthDataPaddedPc: ProfitAndLoss | null = null
  let selectedMonthDataPaddedPc: ProfitAndLoss | null = null
  if (priorMonthDataPc && selectedMonthDataPc) {
    const { pnl1, pnl2 } = addPlaceHoldersToPNLs(
      priorMonthDataPc,
      selectedMonthDataPc
    )
    priorMonthDataPaddedPc = pnl1
    selectedMonthDataPaddedPc = pnl2
  }

  let priorMonthDataPaddedMso: ProfitAndLoss | null = null
  let selectedMonthDataPaddedMso: ProfitAndLoss | null = null
  if (priorMonthDataMso && selectedMonthDataMso) {
    const { pnl1, pnl2 } = addPlaceHoldersToPNLs(
      priorMonthDataMso,
      selectedMonthDataMso
    )
    priorMonthDataPaddedMso = pnl1
    selectedMonthDataPaddedMso = pnl2
  }

  return <>
    <Page id='pdf-page-1'>
      <div className='Layer__pdf-header'>
        <div className='Layer__pdf-header-content'>
          Profit & Loss -{' '}
          {formData.month ? MONTH_NAMES[formData.month] : ''}{' '}
          {formData.year}
        </div>
        {business?.legal_name && (
          <div className='font-semibold'>{business.legal_name}</div>
        )}
      </div>
      <Header>Overview</Header>
      <div className='Layer__pdf-content'>
        <div className='Layer__pdf-summary-boxes'>
          <SummaryBox
            title='Net Sales'
            valueCents={selectedMonthData?.income.value || 0}
            moneyDelta={incomeDelta}
            priorMonth={priorMonth}
            showPreviousMonth={showPreviousMonth}
          />
          <SummaryBox
            title='Total Expenses'
            valueCents={
              (selectedMonthData?.expenses.value || 0)
                    + (selectedMonthData?.cost_of_goods_sold?.value || 0)
            }
            moneyDelta={expensesDelta}
            lowerIsGood
            priorMonth={priorMonth}
            showPreviousMonth={showPreviousMonth}
          />
          <SummaryBox
            title='Net Profit'
            valueCents={selectedMonthData?.net_profit || 0}
            moneyDelta={profitDelta}
            priorMonth={priorMonth}
            showPreviousMonth={showPreviousMonth}
          />
        </div>
        {priorMonthDataPadded && selectedMonthDataPadded && (
          <Table
            priorMonthData={priorMonthDataPadded}
            selectedMonthData={selectedMonthDataPadded}
            showPreviousMonth={showPreviousMonth}
          />
        )}
      </div>
    </Page>
    <div className='Layer__pdf-pages-separator'/>
    <Page id='pdf-page-2'>
      <Header>Entity Breakdown</Header>{' '}
      <div className='Layer__pdf-page-2-wrapper'>
        {priorMonthDataPaddedPc && selectedMonthDataPaddedPc && (
          <Table
            priorMonthData={priorMonthDataPaddedPc}
            selectedMonthData={selectedMonthDataPaddedPc}
            header='Professional Corporation'
            showPreviousMonth={showPreviousMonth}
          />
        )}
        {priorMonthDataPaddedMso && selectedMonthDataPaddedMso && (
          <Table
            priorMonthData={priorMonthDataPaddedMso}
            selectedMonthData={selectedMonthDataPaddedMso}
            header='Mgmt Services Organization'
            showPreviousMonth={showPreviousMonth}
            hideLabels
          />
        )}
      </div>
    </Page>
    <div className='Layer__pdf-pages-separator'/>
  </>
}

export default PDF
