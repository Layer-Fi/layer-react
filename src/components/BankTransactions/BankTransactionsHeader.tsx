import React, { ChangeEvent, useState } from 'react'
import { Layer } from '../../api/layer'
import { useLayerContext } from '../../contexts/LayerContext'
import { DateRange, DisplayState } from '../../types'
import { getEarliestDateToBrowse } from '../../utils/business'
import { DownloadButton as DownloadButtonComponent } from '../Button'
import { Header } from '../Container'
import { DatePicker } from '../DatePicker'
import { SyncingComponent } from '../SyncingComponent'
import { Toggle } from '../Toggle'
import { ToggleSize } from '../Toggle/Toggle'
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
  isSyncing?: boolean
  setDateRange?: (value: DateRange) => void
  stringOverrides?: BankTransactionsHeaderStringOverrides
}

export interface BankTransactionsHeaderStringOverrides {
  header?: string
  downloadButton?: string
}

const DownloadButton = ({
  downloadButtonTextOverride,
  iconOnly,
}: {
  downloadButtonTextOverride?: string
  iconOnly?: boolean
}) => {
  const { auth, businessId, apiUrl } = useLayerContext()
  const [requestFailed, setRequestFailed] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const handleClick = async () => {
    setIsDownloading(true)
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
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <DownloadButtonComponent
      iconOnly={iconOnly}
      onClick={handleClick}
      isDownloading={isDownloading}
      requestFailed={requestFailed}
      text={downloadButtonTextOverride ?? 'Download'}
    />
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
  stringOverrides,
  isSyncing,
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
        <div className='Layer__bank-transactions__header__content-title'>
          <Heading
            className='Layer__bank-transactions__title'
            size={asWidget ? HeadingSize.secondary : HeadingSize.secondary}
          >
            {stringOverrides?.header || 'Transactions'}
          </Heading>
          {isSyncing && (
            <SyncingComponent
              timeSync={5}
              inProgress={true}
              hideContent={listView}
            />
          )}
        </div>
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
        <div className='Layer__header__actions Layer__justify--space-between'>
          {!categorizedOnly && categorizeView && (
            <Toggle
              name='bank-transaction-display'
              size={
                mobileComponent === 'mobileList'
                  ? ToggleSize.small
                  : ToggleSize.medium
              }
              options={[
                { label: 'To Review', value: DisplayState.review },
                { label: 'Categorized', value: DisplayState.categorized },
              ]}
              selected={display}
              onChange={onCategorizationDisplayChange}
            />
          )}
          <DownloadButton
            downloadButtonTextOverride={stringOverrides?.downloadButton}
            iconOnly={listView}
          />
        </div>
      </div>
    </Header>
  )
}
