import React, { ChangeEvent, useState } from 'react'
import { Layer } from '../../api/layer'
import { useLayerContext } from '../../contexts/LayerContext'
import DownloadCloud from '../../icons/DownloadCloud'
import { DateRange, DisplayState } from '../../types'
import { getEarliestDateToBrowse } from '../../utils/business'
import { Button, ButtonVariant, RetryButton } from '../Button'
import { Header } from '../Container'
import { DatePicker } from '../DatePicker'
import { Tabs } from '../Tabs'
import { Toggle } from '../Toggle'
import { Heading, HeadingSize } from '../Typography'
import { MobileComponentType } from './constants'
import classNames from 'classnames'
import { endOfMonth, startOfMonth } from 'date-fns'

export interface BankTransactionsHeaderProps {
  shiftStickyHeader: number
  asWidget?: boolean
  categorizedOnly?: boolean
  categorizeView?: boolean
  display?: DisplayState
  onCategorizationDisplayChange: (event: ChangeEvent<HTMLInputElement>) => void
  mobileComponent?: MobileComponentType
  withDatePicker?: boolean
  listView?: boolean
  dateRange?: DateRange
  isDataLoading?: boolean
  setDateRange?: (value: DateRange) => void
}

const DownloadButton = () => {
  const { auth, businessId, apiUrl } = useLayerContext()
  const [requestFailed, setRequestFailed] = useState(false)
  const handleClick = async () => {
    const currentYear = new Date().getFullYear().toString()
    const getBankTransactionsCsv = Layer.getBankTransactionsCsv(
      apiUrl,
      auth.access_token,
      {
        params: {
          businessId: businessId,
          year: currentYear,
        },
      },
    )
    try {
      const result = await getBankTransactionsCsv()
      if (result?.data?.presignedUrl) {
        window.location.href = result.data.presignedUrl
        setRequestFailed(false)
      } else {
        setRequestFailed(true)
      }
    } catch (e) {
      setRequestFailed(true)
    }
  }

  return requestFailed ? (
    <RetryButton
      onClick={handleClick}
      className='Layer__download-retry-btn'
      error={'Approval failed. Check connection and retry in few seconds.'}
    >
      Retry
    </RetryButton>
  ) : (
    <Button
      variant={ButtonVariant.secondary}
      rightIcon={<DownloadCloud size={12} />}
      onClick={handleClick}
    >
      Download
    </Button>
  )
}

export const BankTransactionsHeader = ({
  shiftStickyHeader,
  asWidget,
  categorizedOnly,
  categorizeView = true,
  display,
  onCategorizationDisplayChange,
  mobileComponent,
  withDatePicker,
  listView,
  dateRange,
  setDateRange,
  isDataLoading,
}: BankTransactionsHeaderProps) => {
  const { business } = useLayerContext()

  return (
    <Header
      className={classNames(
        'Layer__bank-transactions__header',
        withDatePicker && 'Layer__bank-transactions__header--with-date-picker',
        mobileComponent && listView
          ? 'Layer__bank-transactions__header--mobile'
          : undefined,
      )}
      style={{ top: shiftStickyHeader }}
    >
      <div className='Layer__bank-transactions__header__content'>
        <Heading
          className='Layer__bank-transactions__title'
          size={asWidget ? HeadingSize.secondary : HeadingSize.secondary}
        >
          Transactions
        </Heading>
        {withDatePicker && dateRange && setDateRange ? (
          <DatePicker
            mode='monthPicker'
            selected={dateRange.startDate}
            onChange={date => {
              if (!Array.isArray(date)) {
                setDateRange({
                  startDate: startOfMonth(date),
                  endDate: endOfMonth(date),
                })
              }
            }}
            minDate={getEarliestDateToBrowse(business)}
          />
        ) : null}
      </div>
      <div className='Layer__header__actions-wrapper'>
        {!categorizedOnly &&
          !(mobileComponent == 'mobileList' && listView) &&
          categorizeView && (
            <div className='Layer__header__actions'>
              <DownloadButton />
              <Toggle
                name='bank-transaction-display'
                options={[
                  { label: 'To Review', value: DisplayState.review },
                  { label: 'Categorized', value: DisplayState.categorized },
                ]}
                selected={display}
                onChange={onCategorizationDisplayChange}
              />
            </div>
          )}

        {!categorizedOnly &&
          mobileComponent === 'mobileList' &&
          listView &&
          categorizeView && (
            <Tabs
              name='bank-transaction-display'
              options={[
                { label: 'To Review', value: DisplayState.review },
                { label: 'Categorized', value: DisplayState.categorized },
              ]}
              selected={display}
              onChange={onCategorizationDisplayChange}
            />
          )}
        {isDataLoading && (
          <div className='Layer__syncing__info'>
            <span>Syncing account data</span>
            <span>This may take up to 5 minutes</span>
          </div>
        )}
      </div>
    </Header>
  )
}
