import { View } from '../View'
import { ProfitAndLoss } from '../ProfitAndLoss'
import { Panel } from '../Panel'
import React, { RefObject, useContext, useState } from 'react'
import { ProfitAndLossCompareOptionsProps } from '../ProfitAndLossCompareOptions/ProfitAndLossCompareOptions'
import { ReportsStringOverrides } from '../../views/Reports/Reports'
import { DateRangeDatePickerModes } from '../DatePicker/DatePicker'
import { MoneyFormat } from '../../types'
import { useLayerContext } from '../../contexts/LayerContext'
import { Layer } from '../../api/layer'
import { Button, ButtonVariant, RetryButton } from '../Button'
import DownloadCloud from '../../icons/DownloadCloud'

import { DownloadButton as DownloadButtonComponent } from '../../components/Button'
import { Header, HeaderCol, HeaderRow } from '../../components/Header'
import { BREAKPOINTS } from '../../config/general'
import { useElementSize } from '../../hooks/useElementSize'
import { useElementViewSize } from '../../hooks/useElementViewSize'
import { View as ViewType } from '../../types/general'

type ViewBreakpoint = ViewType | undefined


export interface ProfitAndLossReportProps {
  stringOverrides?: ReportsStringOverrides
  comparisonConfig?: ProfitAndLossCompareOptionsProps
  datePickerMode?: DateRangeDatePickerModes
  csvMoneyFormat?: MoneyFormat
  parentRef?: RefObject<HTMLDivElement>
}

export interface DownloadButtonStringOverrides {
  downloadButtonText?: string
  retryButtonText?: string
}

export interface DownloadButtonProps {
  stringOverrides?: DownloadButtonStringOverrides
  moneyFormat?: MoneyFormat
}

export const PnLDownloadButton = ({
  stringOverrides,
  moneyFormat,
}: DownloadButtonProps) => {
  const { dateRange } = useContext(ProfitAndLoss.Context)
  const { auth, businessId, apiUrl } = useLayerContext()
  const [requestFailed, setRequestFailed] = useState(false)

  const handleClick = async () => {
    const month = (dateRange.startDate.getMonth() + 1).toString()
    const year = dateRange.startDate.getFullYear().toString()
    const getProfitAndLossCsv = Layer.getProfitAndLossCsv(
      apiUrl,
      auth.access_token,
      {
        params: {
          businessId: businessId,
          year: year,
          month: month,
          moneyFormat: moneyFormat,
        },
      },
    )
    try {
      const result = await getProfitAndLossCsv()
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
      {stringOverrides?.retryButtonText || 'Retry'}
    </RetryButton>
  ) : (
    <Button
      variant={ButtonVariant.secondary}
      rightIcon={<DownloadCloud size={12} />}
      onClick={handleClick}
    >
      {stringOverrides?.downloadButtonText || 'Download'}
    </Button>
  )
}

export const ProfitAndLossReport = ({
  stringOverrides,
  comparisonConfig,
  datePickerMode,
  csvMoneyFormat,
  parentRef,
}: ProfitAndLossReportProps) => {
  const { sidebarScope } = useContext(ProfitAndLoss.Context)

  return (
    <View
      type='panel'
      headerControls={
        <>
          <ProfitAndLoss.DatePicker
            datePickerMode={datePickerMode}
          />
          <div className='Layer__compare__controls__wrapper'>
            {comparisonConfig && (
              <ProfitAndLoss.CompareOptions
                tagComparisonOptions={comparisonConfig.tagComparisonOptions}
                defaultTagFilter={comparisonConfig.defaultTagFilter}
              />
            )}
            <PnLDownloadButton
              stringOverrides={stringOverrides?.downloadButton}
              moneyFormat={csvMoneyFormat}
            />
          </div>
        </>
      }
    >
      <Panel
        sidebar={
          <ProfitAndLoss.DetailedCharts
            showDatePicker={false}
            stringOverrides={stringOverrides?.profitAndLoss?.detailedCharts}
          />
        }
        sidebarIsOpen={Boolean(sidebarScope)}
        parentRef={parentRef}
      >
        <ProfitAndLoss.Table
          asContainer={false}
          stringOverrides={stringOverrides?.profitAndLoss?.table}
        />
      </Panel>
    </View>
  )
}