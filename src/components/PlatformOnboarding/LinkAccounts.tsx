import React, { useContext, useMemo } from 'react'
import { LinkedAccountsContext } from '../../contexts/LinkedAccountsContext'
import LinkIcon from '../../icons/Link'
import PlaidIcon from '../../icons/PlaidIcon'
import { LinkedAccountsProvider } from '../../providers/LinkedAccountsProvider'
import { ActionableRow } from '../ActionableRow'
import { Button, ButtonVariant } from '../Button'
import { DataState, DataStateStatus } from '../DataState'
import { LinkedAccountItemThumb } from '../LinkedAccounts'
import { Loader } from '../Loader'
import { Heading, HeadingSize } from '../Typography'
import { LinkedAccountsConfirmationModal } from '../LinkedAccounts/ConfirmationModal/LinkedAccountsConfirmationModal'

export interface LinkAccountsStringOverrides {
  backButtonText?: string
  nextButtonText?: string
}

export interface LinkAccountsProps {
  title?: string
  asWidget?: boolean
  showLedgerBalance?: boolean
  showUnlinkItem?: boolean
  showBreakConnection?: boolean
  hideLoading?: boolean
  inBox?: boolean
  stringOverrides?: LinkAccountsStringOverrides
  onBack?: () => void
  onNext?: () => void
}

export const LinkAccounts = ({ inBox, ...props }: LinkAccountsProps) => {
  const content = useMemo(() => {
    if (inBox) {
      return (
        <div className='Layer__link-accounts__box'>
          <LinkAccountsContent {...props} />
        </div>
      )
    }
    return <LinkAccountsContent {...props} />
  }, [inBox, props])

  return (
    <LinkedAccountsProvider>
      {content}
    </LinkedAccountsProvider>
  )
}

export const LinkAccountsContent = ({
  title,
  asWidget,
  showLedgerBalance = true,
  showUnlinkItem = false,
  showBreakConnection = false,
  hideLoading = false,
  stringOverrides,
  onBack,
  onNext,
}: LinkAccountsProps) => {
  const { data, loadingStatus, error, refetchAccounts, addConnection } =
    useContext(LinkedAccountsContext)

  return (
    <div className='Layer__link-accounts Layer__component'>
      {title && <Heading size={HeadingSize.view}>{title}</Heading>}

      {data && data.length === 0
        ? (
          <div className='Layer__link-accounts__data-status-container'>
            {!hideLoading && loadingStatus !== 'complete' ? <Loader /> : null}

            {Boolean(error) && (
              <DataState
                status={DataStateStatus.failed}
                title='Failed to load accounts'
                description='Please try again later'
                onRefresh={refetchAccounts}
              />
            )}
          </div>
        )
        : null}

      {data && data.length > 0
        ? (
          <div className='Layer__link-accounts__list'>
            {data?.map((account, index) => (
              <LinkedAccountItemThumb
                key={index}
                account={account}
                showLedgerBalance={showLedgerBalance}
                showUnlinkItem={showUnlinkItem}
                showBreakConnection={showBreakConnection}
                asWidget={asWidget}
              />
            ))}
          </div>
        )
        : null}
      <ActionableRow
        iconBox={<PlaidIcon />}
        title={
          data && data.length > 0
            ? 'Connect my next business account'
            : 'Connect accounts'
        }
        description='Import data with one simple integration.'
        button={(
          <Button
            onClick={() => addConnection('PLAID')}
            rightIcon={<LinkIcon size={12} />}
            disabled={loadingStatus !== 'complete'}
          >
            {data && data.length > 0 ? 'Connect next' : 'Connect'}
          </Button>
        )}
      />
      <LinkedAccountsConfirmationModal />

      {onBack || onNext
        ? (
          <div className='Layer__link-accounts__footer'>
            {onBack && (
              <Button onClick={onBack} variant={ButtonVariant.secondary}>
                {stringOverrides?.backButtonText ?? 'Back'}
              </Button>
            )}
            {onNext && (
              <Button onClick={onNext}>
                {stringOverrides?.nextButtonText
                || 'I’m done connecting my business accounts'}
              </Button>
            )}
          </div>
        )
        : null}
    </div>
  )
}
