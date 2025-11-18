import { useEffect, useRef, useMemo, useState } from 'react'
import { VStack, HStack } from '@ui/Stack/Stack'
import { Heading } from '@ui/Typography/Heading'
import { Span } from '@ui/Typography/Text'
import { Text, TextSize, TextWeight } from '@components/Typography/Text'
import { Button, ButtonVariant } from '@ui/Button/Button'
import { AlertTriangle, Download } from 'lucide-react'
import { convertNumberToCurrency, formatPercent } from '@utils/format'
import { format } from 'date-fns'
import { PieChart, Pie, Cell, ResponsiveContainer, Label, Text as ChartText } from 'recharts'
import { PolarViewBox } from 'recharts/types/util/types'
import classNames from 'classnames'
import './taxEstimateOverview.scss'
import { taxEstimateDefaults } from './defaults'
import { Separator } from '@components/Separator/Separator'

interface TaxEstimateOverviewProps {
  onNavigateToBankTransactions?: () => void
}

export const TaxEstimateOverview = ({ onNavigateToBankTransactions }: TaxEstimateOverviewProps = {}) => {
  const totalIncomeBarRef = useRef<HTMLDivElement>(null)
  const incomeBarRef = useRef<HTMLDivElement>(null)
  const deductionsBarRef = useRef<HTMLDivElement>(null)
  const totalIncomeAmountRef = useRef<HTMLSpanElement>(null)
  const taxableIncomeAmountRef = useRef<HTMLSpanElement>(null)
  const deductionsAmountRef = useRef<HTMLSpanElement>(null)
  const yearForTaxFiling = 2025

  const todoItems = [
    {
      label: `Categorize ${convertNumberToCurrency(2100)} of potential deductions`,
      buttonLabel: 'Review',
      variant: 'solid' as ButtonVariant,
      icon: null,
      onPress: () => {
        onNavigateToBankTransactions?.()
      },
    },
    {
      label: `Categorize ${convertNumberToCurrency(4925)} of deposits`,
      buttonLabel: 'Review',
      variant: 'solid' as ButtonVariant,
      icon: null,
      onPress: () => {
        onNavigateToBankTransactions?.()
      },
    },
    {
      label: 'Export your tax packet',
      buttonLabel: 'Export',
      icon: <Download size={16} />,
      variant: 'outlined' as ButtonVariant,
      onPress: () => {},
    },
  ]

  const deadlines = [
    { date: 'Apr 15, 2025', label: `Q1 estimated tax due (${convertNumberToCurrency(945.52)})` },
    { date: 'Jul 15, 2025', label: `Q2 estimated tax due (${convertNumberToCurrency(6654.00)})` },
    { date: 'Oct 15, 2025', label: `Q3 estimated tax due (${convertNumberToCurrency(4649.00)})` },
    { date: 'Jan 15, 2026', label: `Q4 estimated tax due (${convertNumberToCurrency(6199.00)})` },
    { date: 'Apr 15, 2026', label: `Annual income taxes due (${convertNumberToCurrency(0)})` },
  ]
  // Quarterly total: 945.52 + 6654.00 + 4649.00 + 6199.00 = 18,447.52 ✓

  const taxableIncome = taxEstimateDefaults.taxableIncome
  const income = taxEstimateDefaults.businessIncome
  const deductions = taxEstimateDefaults.deductibleExpenses
    + taxEstimateDefaults.deductibleMileage
    + taxEstimateDefaults.selfEmploymentDeduction
    + taxEstimateDefaults.qualifiedTipDeduction
    + taxEstimateDefaults.qualifiedOvertimeDeduction
    + taxEstimateDefaults.federalDeductions
    + taxEstimateDefaults.businessIncomeDeduction
  const deductionsPercentage = (deductions / income) * 100
  const taxableIncomePercentage = (taxableIncome / income) * 100

  const federalTaxesOwed = taxEstimateDefaults.federalTaxesOwed
  const selfEmployedTaxesOwed = 0
  const stateTaxesOwed = taxEstimateDefaults.stateTaxesOwed
  const totalTaxesOwed = federalTaxesOwed + selfEmployedTaxesOwed + stateTaxesOwed
  const taxesDueDate = taxEstimateDefaults.taxesDueDate

  const [hoveredItem, setHoveredItem] = useState<string | undefined>()

  const pieChartData = useMemo(() => [
    { name: 'Federal', value: federalTaxesOwed, color: '#3b82f6' },
    { name: 'State', value: stateTaxesOwed, color: '#10b981' },
    { name: 'Self-Employed', value: selfEmployedTaxesOwed, color: '#f97316' },
  ].map(x => ({
    ...x,
    value: x.value > 0 ? x.value : 0,
  })), [federalTaxesOwed, stateTaxesOwed, selfEmployedTaxesOwed])

  const noValue = pieChartData.length === 0 || !pieChartData.find(x => x.value !== 0)

  useEffect(() => {
    if (totalIncomeBarRef.current) {
      totalIncomeBarRef.current.style.width = '100%'
    }
    if (incomeBarRef.current) {
      incomeBarRef.current.style.width = `${taxableIncomePercentage}%`
    }
    if (deductionsBarRef.current) {
      deductionsBarRef.current.style.width = `${deductionsPercentage}%`
    }
    if (totalIncomeAmountRef.current) {
      totalIncomeAmountRef.current.style.left = '100%'
      totalIncomeAmountRef.current.style.transform = 'translateX(-100%)'
    }
    if (taxableIncomeAmountRef.current) {
      taxableIncomeAmountRef.current.style.left = `${taxableIncomePercentage}%`
      taxableIncomeAmountRef.current.style.transform = 'translateX(-50%)'
    }
    if (deductionsAmountRef.current) {
      deductionsAmountRef.current.style.left = `${deductionsPercentage}%`
      deductionsAmountRef.current.style.transform = 'translateX(-50%)'
    }
  }, [deductionsPercentage, taxableIncomePercentage])

  return (
    <VStack gap='xl' fluid>
      <HStack gap='lg' fluid>
        <VStack fluid className='Layer__Stack Layer__tax-estimate-overview__section'>
          <header className='Layer__tax-estimate-overview__header'>
            <div className='Layer__tax-estimate-overview__head'>
              <Text size={TextSize.lg} weight={TextWeight.bold} className='title'>
                Taxable income estimate for
                {' '}
                {yearForTaxFiling}
              </Text>
              <Text size={TextSize.sm} className='date'>
                Taxable income estimate to date for Year
                {' '}
                {yearForTaxFiling}
              </Text>
            </div>
          </header>
          <VStack gap='md' pb='lg' pi='lg'>
            <HStack gap='md' align='center' pbe='lg' fluid>
              <Heading size='lg'>{convertNumberToCurrency(taxableIncome)}</Heading>
              <HStack gap='xs' align='center'>
                <AlertTriangle size={16} style={{ color: 'var(--fg-subtle)' }} />
                <Span size='sm' variant='subtle'>Excludes pending transactions</Span>
              </HStack>
            </HStack>
            <VStack gap='lg'>
              <HStack gap='md' align='center' fluid>
                <Span size='lg' className='Layer__tax-estimate-overview__label'>
                  Total Income
                </Span>
                <HStack
                  fluid
                  className='Layer__tax-estimate-overview__bar-container Layer__tax-estimate-overview__bar-container--with-label'
                >
                  <HStack
                    ref={totalIncomeBarRef}
                    className='Layer__tax-estimate-overview__bar Layer__tax-estimate-overview__bar--total-income'
                  />
                  <Span ref={totalIncomeAmountRef} size='sm' variant='subtle' className='Layer__tax-estimate-overview__bar-amount'>
                    {convertNumberToCurrency(income)}
                  </Span>
                </HStack>
              </HStack>
              <HStack gap='md' align='center' fluid>
                <Span size='lg' className='Layer__tax-estimate-overview__label'>
                  Deductions
                </Span>
                <HStack
                  fluid
                  className='Layer__tax-estimate-overview__bar-container Layer__tax-estimate-overview__bar-container--with-label'
                >
                  <HStack
                    ref={deductionsBarRef}
                    className='Layer__tax-estimate-overview__bar Layer__tax-estimate-overview__bar--deductions'
                  />
                  <Span ref={deductionsAmountRef} size='sm' variant='subtle' className='Layer__tax-estimate-overview__bar-amount'>
                    {convertNumberToCurrency(deductions)}
                  </Span>
                </HStack>
              </HStack>
            </VStack>
          </VStack>
        </VStack>
        <VStack fluid className='Layer__tax-estimate-overview__section'>
          <header className='Layer__tax-estimate-overview__header'>
            <div className='Layer__tax-estimate-overview__head'>
              <Text size={TextSize.lg} weight={TextWeight.bold} className='title'>
                Tax Checklist
              </Text>
            </div>
          </header>
          <VStack gap='md' pb='lg' pi='lg'>
            <VStack>
              {todoItems.map((item, index) => (
                <>
                  <HStack key={index} gap='md' align='center' justify='space-between' fluid>
                    <HStack gap='sm' align='center' fluid className='Layer__tax-estimate-overview__item'>
                      <Span size='md'>{item.label}</Span>
                    </HStack>
                    <Button variant={item.variant} onPress={item.onPress}>
                      {item.buttonLabel}
                      {item.icon}
                    </Button>
                  </HStack>
                  {index !== todoItems.length - 1 && <Separator />}
                </>
              ))}
            </VStack>
          </VStack>
        </VStack>

      </HStack>
      <HStack gap='lg' fluid>
        <VStack fluid className='Layer__tax-estimate-overview__section'>
          <header className='Layer__tax-estimate-overview__header'>
            <div className='Layer__tax-estimate-overview__head'>
              <Text size={TextSize.lg} weight={TextWeight.bold} className='title'>
                Estimated Taxes for
                {' '}
                {yearForTaxFiling}
              </Text>
            </div>
          </header>
          <VStack>
            <HStack gap='xl' align='start' pbs='md' pi='md' fluid>
              <VStack gap='xs'>
                <Span size='sm' variant='subtle'>Total Owed</Span>
                <Heading size='lg'>{convertNumberToCurrency(totalTaxesOwed)}</Heading>
              </VStack>
              <VStack gap='xs'>
                <Span size='sm' variant='subtle'>Taxes Due</Span>
                <Heading size='lg'>{format(taxesDueDate, 'MMMM d')}</Heading>
              </VStack>
            </HStack>
            <VStack>
              <div className='Layer__tax-estimate-overview__chart-container'>
                <ResponsiveContainer>
                  <PieChart>
                    <defs>
                      <pattern
                        id='layer-pie-stripe-pattern'
                        x='0'
                        y='0'
                        width='4'
                        height='4'
                        patternTransform='rotate(45)'
                        patternUnits='userSpaceOnUse'
                      >
                        <rect width='4' height='4' opacity={0.16} />
                        <line x1='0' y='0' x2='0' y2='4' strokeWidth='2' />
                      </pattern>
                      <pattern
                        id='layer-pie-dots-pattern'
                        x='0'
                        y='0'
                        width='3'
                        height='3'
                        patternUnits='userSpaceOnUse'
                      >
                        <rect width='3' height='3' opacity={0.46} className='bg' />
                        <rect width='1' height='1' opacity={0.56} />
                      </pattern>
                    </defs>
                    {!noValue
                      ? (
                        <Pie
                          data={pieChartData}
                          dataKey='value'
                          nameKey='name'
                          cx='50%'
                          cy='50%'
                          innerRadius='91%'
                          outerRadius='100%'
                          paddingAngle={0.5}
                          fill='#8884d8'
                          animationDuration={200}
                          animationEasing='ease-in-out'
                        >
                          {pieChartData.map((entry, index) => {
                            let fill: string | undefined = entry.color
                            let active = true
                            if (hoveredItem && entry.name !== hoveredItem) {
                              active = false
                              fill = undefined
                            }

                            return (
                              <Cell
                                key={`cell-${index}`}
                                className={classNames(
                                  'Layer__profit-and-loss-detailed-charts__pie',
                                  hoveredItem && active ? 'active' : 'inactive',
                                )}
                                fill={fill}
                                onMouseEnter={() => setHoveredItem(entry.name)}
                                onMouseLeave={() => setHoveredItem(undefined)}
                              />
                            )
                          })}
                          <Label
                            position='center'
                            value='Total'
                            className='pie-center-label-title'
                            content={(props) => {
                              const { cx, cy } = (props.viewBox as PolarViewBox) ?? {
                                cx: 0,
                                cy: 0,
                              }
                              const positioningProps = {
                                x: cx,
                                y: (cy || 0) - 15,
                                textAnchor: 'middle' as
                                | 'start'
                                | 'middle'
                                | 'end'
                                | 'inherit',
                                verticalAnchor: 'middle' as 'start' | 'middle' | 'end',
                              }

                              let text = 'Total'

                              if (hoveredItem) {
                                text = hoveredItem
                              }

                              return (
                                <ChartText
                                  {...positioningProps}
                                  className='pie-center-label__title'
                                >
                                  {text}
                                </ChartText>
                              )
                            }}
                          />

                          <Label
                            position='center'
                            value='Total'
                            className='pie-center-label-title'
                            content={(props) => {
                              const { cx, cy } = (props.viewBox as PolarViewBox) ?? {
                                cx: 0,
                                cy: 0,
                              }
                              const positioningProps = {
                                x: cx,
                                y: (cy || 0) + 5,
                                textAnchor: 'middle' as
                                | 'start'
                                | 'middle'
                                | 'end'
                                | 'inherit',
                                verticalAnchor: 'middle' as 'start' | 'middle' | 'end',
                              }

                              let value = totalTaxesOwed
                              if (hoveredItem) {
                                value = pieChartData.find(
                                  x => x.name === hoveredItem,
                                )?.value ?? 0
                              }

                              return (
                                <ChartText
                                  {...positioningProps}
                                  className='pie-center-label__value'
                                >
                                  {convertNumberToCurrency(value)}
                                </ChartText>
                              )
                            }}
                          />

                          <Label
                            position='center'
                            value='Total'
                            className='pie-center-label-title'
                            content={(props) => {
                              const { cx, cy } = (props.viewBox as PolarViewBox) ?? {
                                cx: 0,
                                cy: 0,
                              }
                              const positioningProps = {
                                x: cx,
                                y: (cy || 0) + 25,
                                height: 20,
                                textAnchor: 'middle' as
                                | 'start'
                                | 'middle'
                                | 'end'
                                | 'inherit',
                                verticalAnchor: 'middle' as 'start' | 'middle' | 'end',
                              }

                              if (hoveredItem) {
                                const item = pieChartData.find(
                                  x => x.name === hoveredItem,
                                )
                                const positiveTotal = pieChartData.reduce((sum, x) => sum + x.value, 0)

                                const value = item?.value ?? 0
                                const share = value > 0 ? value / positiveTotal : 0
                                return (
                                  <ChartText
                                    {...positioningProps}
                                    className='pie-center-label__share'
                                  >
                                    {`${formatPercent(share)}%`}
                                  </ChartText>
                                )
                              }

                              return null
                            }}
                          />
                        </Pie>
                      )
                      : null}

                    {noValue
                      ? (
                        <Pie
                          data={[{ name: 'Total', value: 1 }]}
                          dataKey='value'
                          nameKey='name'
                          cx='50%'
                          cy='50%'
                          innerRadius='91%'
                          outerRadius='100%'
                          paddingAngle={0}
                          fill='#F8F8FA'
                          animationDuration={200}
                          animationEasing='ease-in-out'
                        >
                          <Label
                            position='center'
                            value='Total'
                            className='pie-center-label-title'
                            content={(props) => {
                              const { cx, cy } = (props.viewBox as PolarViewBox) ?? {
                                cx: 0,
                                cy: 0,
                              }
                              const positioningProps = {
                                x: cx,
                                y: (cy || 0) - 15,
                                textAnchor: 'middle' as
                                | 'start'
                                | 'middle'
                                | 'end'
                                | 'inherit',
                                verticalAnchor: 'middle' as 'start' | 'middle' | 'end',
                              }

                              return (
                                <ChartText
                                  {...positioningProps}
                                  className='pie-center-label__title'
                                >
                                  Total
                                </ChartText>
                              )
                            }}
                          />

                          <Label
                            position='center'
                            value='Total'
                            className='pie-center-label-title'
                            content={(props) => {
                              const { cx, cy } = (props.viewBox as PolarViewBox) ?? {
                                cx: 0,
                                cy: 0,
                              }
                              const positioningProps = {
                                x: cx,
                                y: (cy || 0) + 5,
                                textAnchor: 'middle' as
                                | 'start'
                                | 'middle'
                                | 'end'
                                | 'inherit',
                                verticalAnchor: 'middle' as 'start' | 'middle' | 'end',
                              }

                              return (
                                <ChartText
                                  {...positioningProps}
                                  className='pie-center-label__value'
                                >
                                  {convertNumberToCurrency(totalTaxesOwed)}
                                </ChartText>
                              )
                            }}
                          />
                        </Pie>
                      )
                      : null}
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className='Layer__tax-estimate-overview__table-container'>
                <table>
                  <thead>
                    <tr>
                      <th>Tax Category</th>
                      <th className='value-col'>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pieChartData.map((entry, index) => (
                      <tr
                        key={`tax-category-${index}`}
                        className={classNames(
                          'Layer__profit-and-loss-detailed-table__row',
                          hoveredItem && hoveredItem === entry.name
                            ? 'active'
                            : '',
                        )}
                        onMouseEnter={() => setHoveredItem(entry.name)}
                        onMouseLeave={() => setHoveredItem(undefined)}
                      >
                        <td className='category-col'>
                          <span className='Layer__tax-estimate-overview__category-cell'>
                            <div
                              className='Layer__tax-estimate-overview__category-indicator'
                              style={{
                                background: entry.color,
                              }}
                            />
                            {entry.name}
                          </span>
                        </td>
                        <td className='value-col'>
                          {convertNumberToCurrency(entry.value)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </VStack>
          </VStack>
        </VStack>
        <VStack fluid className='Layer__tax-estimate-overview__section'>
          <header className='Layer__tax-estimate-overview__header'>
            <div className='Layer__tax-estimate-overview__head'>
              <Text size={TextSize.lg} weight={TextWeight.bold} className='title'>
                Your Federal Tax Deadlines
                {' '}
                for
                {' '}
                {yearForTaxFiling}
              </Text>
            </div>
          </header>
          <VStack gap='md' pb='lg' pi='lg'>
            <VStack>
              {deadlines.map((deadline, index) => (
                <>
                  <HStack key={index} gap='xl' align='center' justify='space-between' fluid>
                    <HStack gap='md' align='center' className='Layer__tax-estimate-overview__item'>
                      <Span size='md' weight='bold' variant='subtle'>{deadline.date}</Span>
                      <Span size='md'>{deadline.label}</Span>
                    </HStack>
                  </HStack>
                  {index !== deadlines.length - 1 && <Separator />}
                </>
              ))}
            </VStack>
          </VStack>
        </VStack>
      </HStack>

    </VStack>
  )
}
