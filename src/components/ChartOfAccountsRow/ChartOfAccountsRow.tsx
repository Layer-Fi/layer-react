import React, { useContext, useEffect, useState } from 'react'
import ArrowRightCircle from '../../icons/ArrowRightCircle'
import ChevronDownFill from '../../icons/ChevronDownFill'
import Edit2 from '../../icons/Edit2'
import { centsToDollars } from '../../models/Money'
import { Account } from '../../types'
import { Button, ButtonVariant, TextButton } from '../Button'
import {
  ChartOfAccountsContext,
  LedgerAccountsContext,
  View,
} from '../ChartOfAccounts/ChartOfAccounts'
import { Text, TextWeight } from '../Typography'
import classNames from 'classnames'

type ChartOfAccountsRowProps = {
  account: Account
  depth?: number
  index: number
  cumulativeIndex?: number
  expanded: boolean
  acountsLength: number
  defaultOpen?: boolean
  view?: View
}

const INDENTATION = 12
const MOBILE_INDENTATION = 12

const EXPANDED_STYLE = {
  height: 52,
  paddingTop: 12,
  paddingBottom: 12,
  opacity: 1,
}

const COLLAPSED_STYLE = {
  height: 0,
  paddingTop: 0,
  paddingBottom: 0,
  opacity: 0.5,
}

export const ChartOfAccountsRow = ({
  account,
  depth = 0,
  index,
  cumulativeIndex = 0,
  expanded = false,
  defaultOpen = false,
  acountsLength,
  view,
}: ChartOfAccountsRowProps) => {
  const { form, editAccount } = useContext(ChartOfAccountsContext)

  const { setAccountId } = useContext(LedgerAccountsContext)

  const [isOpen, setIsOpen] = useState(defaultOpen)
  const style = expanded
    ? {
        ...EXPANDED_STYLE,
        transitionDelay: `${15 * index}ms`,
      }
    : {
        ...COLLAPSED_STYLE,
        transitionDelay: `${acountsLength - 15 * index}ms`,
      }

  const [showComponent, setShowComponent] = useState(false)

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setShowComponent(true)
    }, cumulativeIndex * 50)

    return () => clearTimeout(timeoutId)
  }, [])

  const baseClass = classNames(
    'Layer__table-row',
    isOpen ? 'Layer__table-row--expanded' : 'Layer__table-row--collapsed',
    !expanded && 'Layer__table-row--hidden',
    `Layer__table-row--depth-${depth}`,
    form?.accountId === account.id && 'Layer__table-row--active',
    !showComponent && 'Layer__table-row--anim-starting-state',
  )

  const desktopRowClass = classNames(
    baseClass,
    'Layer__chart-of-accounts__row---desktop',
  )
  const mobileRowClass = classNames(
    baseClass,
    'Layer__chart-of-accounts__row---mobile',
  )

  return (
    <>
      {view === 'desktop' && (
        <tr
          className={desktopRowClass}
          onClick={e => {
            e.preventDefault()
            e.stopPropagation()
            setAccountId(account.id)
          }}
        >
          <td className='Layer__table-cell Layer__coa__name'>
            <span className='Layer__table-cell-content' style={style}>
              <span
                className='Layer__table-cell-content-indentation'
                style={{
                  paddingLeft: INDENTATION * depth + 16,
                }}
              >
                {account.sub_accounts && account.sub_accounts.length > 0 && (
                  <ChevronDownFill
                    size={16}
                    className='Layer__table__expand-icon'
                    onClick={e => {
                      e.stopPropagation()
                      setIsOpen(!isOpen)
                    }}
                  />
                )}
                <span className='Layer__coa__name__text'>{account.name}</span>
              </span>
            </span>
          </td>
          <td className='Layer__table-cell Layer__coa__type'>
            {/* @TODO what is type and subtype*/}
            <span
              className='Layer__table-cell-content Layer__mobile--hidden'
              style={style}
            >
              {account.normality}
            </span>
            <span
              className='Layer__table-cell-content Layer__desktop--hidden'
              style={style}
            >
              <Text
                weight={TextWeight.bold}
                className='Layer__coa__type--mobile'
              >
                {account.normality}
              </Text>
              <Text className='Layer__coa__subtype--mobile'>Sub-Type</Text>
            </span>
          </td>
          <td className='Layer__table-cell Layer__coa__subtype Layer__mobile--hidden'>
            <span className='Layer__table-cell-content' style={style}>
              Sub-Type
            </span>
          </td>
          <td className='Layer__table-cell Layer__coa__balance'>
            <span
              className='Layer__table-cell-content Layer__table-cell--amount'
              style={style}
            >
              ${centsToDollars(Math.abs(account.balance || 0))}
            </span>
          </td>
          <td className='Layer__table-cell Layer__coa__actions'>
            <span className='Layer__table-cell-content' style={style}>
              <Button
                variant={ButtonVariant.secondary}
                rightIcon={<Edit2 size={12} />}
                iconOnly={true}
                onClick={e => {
                  e.preventDefault()
                  e.stopPropagation()
                  editAccount(account.id)
                }}
              >
                Edit
              </Button>
            </span>
          </td>
        </tr>
      )}

      {view === 'mobile' && (
        <tr
          className={mobileRowClass}
          onClick={e => {
            e.preventDefault()
            e.stopPropagation()
            setAccountId(account.id)
          }}
        >
          <td className='Layer__table-cell' colSpan={5}>
            <span
              className='Layer__table-cell-content-indentation'
              style={{
                paddingLeft: MOBILE_INDENTATION * depth + 16,
                ...style,
                height: 'auto',
              }}
            >
              {account.sub_accounts && account.sub_accounts.length > 0 && (
                <ChevronDownFill
                  size={16}
                  className='Layer__table__expand-icon'
                  onClick={e => {
                    e.stopPropagation()
                    setIsOpen(!isOpen)
                  }}
                />
              )}
              <div className='Layer__chart-of-accounts__mobile-row-content'>
                <div className='Layer__chart-of-accounts__mobile-row-content__top-row'>
                  <Text
                    as='span'
                    className='Layer__chart-of-accounts__mobile-row-content__name'
                  >
                    {account.name}
                  </Text>
                  <TextButton
                    onClick={e => {
                      e.preventDefault()
                      e.stopPropagation()
                      editAccount(account.id)
                    }}
                  >
                    Edit
                  </TextButton>
                </div>
                <div className='Layer__chart-of-accounts__mobile-row-content__bottom-row'>
                  <div className='Layer__chart-of-accounts__mobile-row-content__types'>
                    <Text as='span'>{account.normality}</Text>
                    <span className='Layer__chart-of-accounts__mobile-row-content__separator' />
                    <Text as='span'>Sub-Type</Text>
                  </div>
                  <Text
                    as='span'
                    className='Layer__chart-of-accounts__mobile-row-content__balance'
                  >
                    ${centsToDollars(Math.abs(account.balance || 0))}
                  </Text>
                </div>
              </div>
            </span>
          </td>
        </tr>
      )}

      {(account.sub_accounts || []).map((subAccount, idx) => (
        <ChartOfAccountsRow
          key={subAccount.id}
          account={subAccount}
          depth={depth + 1}
          index={idx}
          expanded={isOpen && expanded}
          cumulativeIndex={cumulativeIndex + idx + 1}
          acountsLength={(account.sub_accounts ?? []).length}
          view={view}
        />
      ))}
    </>
  )
}
