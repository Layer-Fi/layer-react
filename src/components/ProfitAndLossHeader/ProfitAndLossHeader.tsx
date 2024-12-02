import React, { useMemo } from 'react'
import { Heading, HeadingSize } from '../../components/Typography'
import { useLinkedAccounts } from '../../hooks/useLinkedAccounts'
import { Header } from '../Container'
import { ProfitAndLoss } from '../ProfitAndLoss'
import { SyncingBadge } from '../SyncingBadge'

export interface ProfitAndLossHeaderProps {
  text?: string
  className?: string
  headingClassName?: string
  size?: 'primary' | 'secondary' | 'view'
  withDatePicker?: boolean
}

export const ProfitAndLossHeader = ({
  text,
  className,
  headingClassName,
  size = 'view',
  withDatePicker,
}: ProfitAndLossHeaderProps) => {
  const { data: linkedAccounts } = useLinkedAccounts()

  const isSyncing = useMemo(
    () => Boolean(linkedAccounts?.some(item => item.is_syncing)),
    [linkedAccounts],
  )

  return (
    <Header className={className}>
      <span className='Layer__component-header__title-wrapper'>
        <Heading size={HeadingSize[size]} className={headingClassName}>
          {text || 'Profit & Loss'}
        </Heading>
        {isSyncing && <SyncingBadge />}
      </span>
      {withDatePicker && <ProfitAndLoss.DatePicker />}
    </Header>
  )
}
