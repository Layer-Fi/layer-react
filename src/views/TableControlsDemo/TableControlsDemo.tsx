import { BankTransactions } from '@features/bankTransactions/BankTransactions/BankTransactions'
import { View } from '@blocks/Layout/View/View'
import { bankTransactionsStoryDefaultArgs } from '@testUtils/storybook/controls/bankTransactions'
import { TableControls, TableControlsProps } from '@blocks/TableControls/TableControls'
import { useEffect, useMemo, useState } from 'react'
import { BankTransactionFilters } from '@utils/features/bankTransactions/shared'

type FilterToken = TableControlsProps['filterTokens'][number]

export function TableControlsDemo() {
  const [filterTokens, setFilterTokens] = useState<Map<string, FilterToken>>(new Map())

  useEffect(() => {
    setFilterTokens(new Map([
      ['amount', {
        id: 'amount',
        props: {
          field: 'Amount',
          operator: 'gt',
          operatorOptions: [
            { value: 'lt', label: 'is less than' },
            { value: 'gt', label: 'is greater than' },
            { value: 'eq', label: 'is equal to' },
          ],
          value: '$100',
          onOperatorChange: (operator: string) => {
            setFilterTokens(prevState => {
              const newState = new Map(prevState)
              const newProps = prevState.get('amount')!.props
              newState.set('amount', {
                id: 'amount',
                props: {
                  ...newProps,
                  operator,
                }
              })
              return newState
            })
          },
          onRemove: () => handleRemoveToken('amount')(),
          valueType: 'string',
          onValueChange: (value: string) => {
            setFilterTokens(prevState => {
              const newState = new Map(prevState)
              const newProps = prevState.get('amount')!.props
              newState.set('amount', {
                id: 'amount',
                props: {
                  ...newProps,
                  value,
                }
              })
              return newState
            })
          }
        }
      }],
    ]))
  }, [])

  const handleRemoveToken = (tokenId: string) => () => {
    setFilterTokens(prevState => {
      const newState = new Map(prevState)
      newState.delete(tokenId)
      return newState
    })
  }

  const addFilter = () => {
    if (filterTokens.size <= 1) {
      setFilterTokens(prevState => {
        const newState = new Map(prevState)
        newState.set('bankAccount', {
          id: 'bankAccount',
          props: {
            onRemove: () => handleRemoveToken('bankAccount')(),
            field: 'Bank',
            operator: 'is',
            operatorOptions: [
              { value: 'is', label: 'is' },
              { value: 'isn', label: 'is not' },
            ],
            onOperatorChange: () => alert('operator change'),
            valueType: 'enum',
            valueOptions: [
              { value: 'chase', label: 'Chase' },
              { value: 'capital one', label: 'Capital One' },
              { value: 'bank of america', label: 'Bank of America' },
            ],
            value: 'chase',
            onValueChange: (value: string) => {
            setFilterTokens(prevState => {
              const newState = new Map(prevState)
              const newProps = prevState.get('bankAccount')!.props
              newState.set('bankAccount', {
                id: 'bankAccount',
                props: {
                  ...newProps,
                  value
                }
              })
              return newState
            })
          }
          }
        })
        return newState
      })
    }
  }

  const clearFilters = () => {
    setFilterTokens(new Map())
  }

  const filterTokensArray = useMemo(() =>
    Array.from(filterTokens.values()),
  [filterTokens])

  const bankTransactionsFilter: BankTransactionFilters = useMemo(() => {
    const amountFilter = filterTokens.get('amount')
    const bankAccountFilter = filterTokens.get('bankAccount')
    const amount = amountFilter?.props.value
    const operator = amountFilter?.props.operator
    const query = bankAccountFilter?.props.value

    console.log('operator', operator)

    return {
      amount: amount ? (operator === 'gt' ? { min: Number(amount.replaceAll('$', '')) } : { max: Number(amount.replaceAll('$', '')) }) : undefined,
      query
    }
  }, [filterTokens])

  return (
    <View title="Table controls demo!">
      <div style={{maxWidth: '1408px'}}>
        <TableControls
          filterTokens={filterTokensArray}
          onAddFilter={addFilter}
          onClear={clearFilters}
        />
      </div>
      <BankTransactions
        {...bankTransactionsStoryDefaultArgs}
        filters={bankTransactionsFilter}
      />
    </View>
  )
}