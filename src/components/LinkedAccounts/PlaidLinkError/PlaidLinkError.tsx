import { useCallback, useContext } from 'react'
import { Modal } from '../../ui/Modal/Modal'
import { ModalCloseButton } from '../../ui/Modal/ModalSlots'
import { HStack, VStack } from '../../ui/Stack/Stack'
import { Button as DeprecatedButton, ButtonVariant } from '../../Button/Button'

import { usePlaidLinkErrorStore, usePlaidLinkErrorStoreActions } from '../../../providers/PlaidLinkErrorStoreProvider'
import ChevronRight from '../../../icons/ChevronRight'
import { Separator } from '../../Separator/Separator'
import { DataState, DataStateStatus } from '../../DataState/DataState'
import { AlertTriangle } from 'lucide-react'
import LinkIcon from '../../../icons/Link'
import { LinkedAccountsContext } from '../../../contexts/LinkedAccountsContext/LinkedAccountsContext'

type PlaidLinkErrorContentProps = {
  onComplete: () => void
  onPlaidLink?: () => void
}
export function PlaidLinkErrorContent({ onComplete, onPlaidLink }: PlaidLinkErrorContentProps) {
  const { addConnection } = useContext(LinkedAccountsContext)

  return (
    <VStack gap='lg' className='Layer__plaid-link-error__content'>
      <DataState
        className='Layer__plaid-link-error__data-state'
        status={DataStateStatus.failed}
        title='Something went wrong while connecting to your bank through Plaid'
        description='This may be a temporary issue. You can try again, or choose a different bank to link.'
        icon={<AlertTriangle size={14} />}
      />
      <Separator />
      <HStack gap='xs' justify='end' className='Layer__plaid-link-error__button-row'>
        <DeprecatedButton
          variant={ButtonVariant.secondary}
          onClick={() => {
            addConnection('PLAID')
            onPlaidLink?.()
          }}
          rightIcon={<LinkIcon size={12} />}
          className='Layer__plaid-link-error__button-row-item'
        >
          Link another bank
        </DeprecatedButton>
        <DeprecatedButton
          onClick={() => { onComplete() }}
          rightIcon={<ChevronRight />}
          className='Layer__plaid-link-error__button-row-item'
        >
          I’m done linking my banks
        </DeprecatedButton>
      </HStack>
    </VStack>
  )
}

export function PlaidLinkErrorModal() {
  const { isPlaidLinkError } = usePlaidLinkErrorStore()
  const { dismiss } = usePlaidLinkErrorStoreActions()

  const onOpenChange = useCallback((isOpen: boolean) => {
    if (!isOpen) {
      dismiss()
    }
  }, [dismiss])

  return (
    <Modal isOpen={isPlaidLinkError} onOpenChange={onOpenChange} flexBlock size='lg'>
      {({ close }) => (
        <>
          <ModalCloseButton onClose={close} positionAbsolute />
          <PlaidLinkErrorContent onComplete={close} onPlaidLink={close} />
        </>
      )}
    </Modal>
  )
}
