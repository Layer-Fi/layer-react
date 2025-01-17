import { useState } from 'react'
import { Container } from '../../components/Container'
import { ProfitAndLoss } from '../../components/ProfitAndLoss'
import { ProfitAndLossDetailedChartsStringOverrides } from '../../components/ProfitAndLossDetailedCharts/ProfitAndLossDetailedCharts'
import { ProfitAndLossSummariesStringOverrides } from '../../components/ProfitAndLossSummaries/ProfitAndLossSummaries'
import { TasksComponent, TasksProvider } from '../../components/Tasks'
import { TasksStringOverrides } from '../../components/Tasks/Tasks'
import { Toggle } from '../../components/Toggle'
import { View } from '../../components/View'
import { useWindowSize } from '../../hooks/useWindowSize'
import { Variants } from '../../utils/styleUtils/sizeVariants'
import { BookkeepingProfitAndLossSummariesContainer } from './internal/BookkeepingProfitAndLossSummariesContainer'
import classNames from 'classnames'

export interface BookkeepingOverviewProps {
  showTitle?: boolean
  stringOverrides?: {
    title?: string
    tasks?: TasksStringOverrides
    profitAndLoss?: {
      header?: string
      detailedCharts?: ProfitAndLossDetailedChartsStringOverrides
      summaries?: ProfitAndLossSummariesStringOverrides
    }
  }
  slotProps?: {
    profitAndLoss?: {
      summaries?: {
        variants?: Variants
      }
    }
  }
  /**
   * @deprecated Use `stringOverrides.title` instead
   */
  title?: string
}

type PnlToggleOption = 'revenue' | 'expenses'

export const BookkeepingOverview = ({
  title,
  showTitle = true,
  stringOverrides,
  slotProps,
}: BookkeepingOverviewProps) => {
  const [pnlToggle, setPnlToggle] = useState<PnlToggleOption>('expenses')
  const [width] = useWindowSize()

  const profitAndLossSummariesVariants = slotProps?.profitAndLoss?.summaries?.variants

  return (
    <ProfitAndLoss asContainer={false}>
      <TasksProvider>
        <View
          viewClassName='Layer__bookkeeping-overview--view'
          title={stringOverrides?.title || title || 'Bookkeeping overview'}
          withSidebar={width > 1100}
          sidebar={<TasksComponent stringOverrides={stringOverrides?.tasks} />}
          showHeader={showTitle}
        >
          {width <= 1100 && (
            <TasksComponent
              collapsable
              collapsedWhenComplete
              stringOverrides={stringOverrides?.tasks}
            />
          )}
          <Container
            name='bookkeeping-overview-profit-and-loss'
            asWidget
            elevated={true}
          >
            <ProfitAndLoss.Header
              text={stringOverrides?.profitAndLoss?.header || 'Profit & Loss'}
              withDatePicker
            />
            <BookkeepingProfitAndLossSummariesContainer>
              <ProfitAndLoss.Summaries
                stringOverrides={stringOverrides?.profitAndLoss?.summaries}
                variants={profitAndLossSummariesVariants}
              />
            </BookkeepingProfitAndLossSummariesContainer>
            <ProfitAndLoss.Chart />
          </Container>
          <div className='Layer__bookkeeping-overview-profit-and-loss-charts'>
            <Toggle
              name='pnl-detailed-charts'
              options={[
                {
                  value: 'revenue',
                  label: 'Revenue',
                },
                {
                  value: 'expenses',
                  label: 'Expenses',
                },
              ]}
              selected={pnlToggle}
              onChange={e => setPnlToggle(e.target.value as PnlToggleOption)}
            />
            <Container
              name={classNames(
                'bookkeeping-overview-profit-and-loss-chart',
                pnlToggle !== 'revenue'
                && 'bookkeeping-overview-profit-and-loss-chart--hidden',
              )}
            >
              <ProfitAndLoss.DetailedCharts
                scope='revenue'
                hideClose={true}
                stringOverrides={stringOverrides?.profitAndLoss?.detailedCharts}
              />
            </Container>
            <Container
              name={classNames(
                'bookkeeping-overview-profit-and-loss-chart',
                pnlToggle !== 'expenses'
                && 'bookkeeping-overview-profit-and-loss-chart--hidden',
              )}
            >
              <ProfitAndLoss.DetailedCharts
                scope='expenses'
                hideClose={true}
                stringOverrides={stringOverrides?.profitAndLoss?.detailedCharts}
              />
            </Container>
          </div>
        </View>
      </TasksProvider>
    </ProfitAndLoss>
  )
}
