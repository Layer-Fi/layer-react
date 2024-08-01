import React, { useState } from 'react'
import { Container, Header } from '../../components/Container'
import { ProfitAndLoss } from '../../components/ProfitAndLoss'
import { TasksComponent, TasksProvider } from '../../components/Tasks'
import { Toggle } from '../../components/Toggle'
import { Heading, HeadingSize } from '../../components/Typography'
import { View } from '../../components/View'
import { useWindowSize } from '../../hooks/useWindowSize'
import classNames from 'classnames'

export interface BookkeepingOverviewProps {
  title?: string
}

type PnlToggleOption = 'revenue' | 'expenses'

export const BookkeepingOverview = ({
  title = 'Bookkeeping overview',
}: BookkeepingOverviewProps) => {
  const [pnlToggle, setPnlToggle] = useState<PnlToggleOption>('revenue')
  const [width] = useWindowSize()

  return (
    <ProfitAndLoss asContainer={false}>
      <TasksProvider>
        <View
          viewClassName='Layer__bookkeeping-overview--view'
          title={title}
          withSidebar={width > 1100}
          sidebar={<TasksComponent tasksHeader='Bookkeeeping Tasks' />}
        >
          {width <= 1100 && (
            <TasksComponent
              tasksHeader='Bookkeeeping Tasks'
              collapsable
              collapsedWhenComplete
            />
          )}
          <Container
            name='bookkeeping-overview-profit-and-loss'
            asWidget
            elevated={true}
          >
            <Header>
              <Heading size={HeadingSize.secondary}>Profit & Loss</Heading>
              <ProfitAndLoss.DatePicker />
            </Header>
            <div className='Layer__bookkeeping-overview__summaries-row'>
              <ProfitAndLoss.Summaries />
            </div>
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
                pnlToggle !== 'revenue' &&
                  'bookkeeping-overview-profit-and-loss-chart--hidden',
              )}
            >
              <ProfitAndLoss.DetailedCharts scope='revenue' hideClose={true} />
            </Container>
            <Container
              name={classNames(
                'bookkeeping-overview-profit-and-loss-chart',
                pnlToggle !== 'expenses' &&
                  'bookkeeping-overview-profit-and-loss-chart--hidden',
              )}
            >
              <ProfitAndLoss.DetailedCharts scope='expenses' hideClose={true} />
            </Container>
          </div>
        </View>
      </TasksProvider>
    </ProfitAndLoss>
  )
}
