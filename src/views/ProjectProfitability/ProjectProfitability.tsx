import React, { useState } from 'react'
import { ChartOfAccounts } from '../../components/ChartOfAccounts'
import { Container } from '../../components/Container'
import { DateRangeDatePickerModes } from '../../components/DatePicker/DatePicker'
import { Journal } from '../../components/Journal'
import { ProfitAndLoss } from '../../components/ProfitAndLoss'
import { ProfitAndLossCompareOptionsProps } from '../../components/ProfitAndLossCompareOptions/ProfitAndLossCompareOptions'
import { Toggle } from '../../components/Toggle'
import { View } from '../../components/View'
import { useElementViewSize } from '../../hooks/useElementViewSize'
import { MoneyFormat } from '../../types'
import { View as ViewType } from '../../types/general'
import { ReportsStringOverrides } from '../Reports/Reports'

type ViewBreakpoint = ViewType | undefined

export interface ProjectProfitabilityProps {
  showTitle?: boolean
  stringOverrides?: ReportsStringOverrides
}

export const ProjectProfitabilityView = ({
  showTitle,
  stringOverrides,
}: ProjectProfitabilityProps) => {
  const [activeTab, setActiveTab] = useState<string>('')
  const [view, setView] = useState<ViewBreakpoint>('desktop')

  const containerRef = useElementViewSize<HTMLDivElement>(newView =>
    setView(newView),
  )

  return (
    <View title={stringOverrides?.title || ''} showHeader={showTitle}>
      <div className='Layer__component Layer__header__actions'>
        <Toggle
          name='project-profitability-tabs'
          options={[]}
          selected={activeTab}
          onChange={opt => setActiveTab('')}
        />
      </div>
      <Container name='project profitability' ref={containerRef}>
        <>Empty container</>
      </Container>
    </View>
  )
}
