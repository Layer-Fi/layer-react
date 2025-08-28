import { useContext, useMemo, useState } from 'react'
import { DialogModal as Modal } from '../../ui/Modal/DialogModal'
import { ModalHeading, ModalActions, ModalContent, ModalTitleWithClose } from '../../ui/Modal/ModalSlots'
import { Button } from '../../ui/Button/Button'
import { VStack } from '../../ui/Stack/Stack'
import { useLinkedAccounts } from '../../../hooks/useLinkedAccounts'
import { useLayerContext } from '../../../contexts/LayerContext'
import { LinkedAccount } from '../../../types/linked_accounts'
import { getActivationDate } from '../../../utils/business'
import { AccountFormBox, AccountFormBoxData } from '../AccountFormBox/AccountFormBox'
import {
  OpeningBalanceAPIResponseResult,
  OpeningBalanceData,
  useBulkSetOpeningBalanceAndDate,
} from './useUpdateOpeningBalanceAndDate'
import { convertToCents } from '../../../utils/format'
import { LinkedAccountsContext } from '../../../contexts/LinkedAccountsContext'
import { startOfYear } from 'date-fns'

type OpeningBalanceModalStringOverrides = {
  title?: string
  description?: string
  buttonText?: string
}

type ResultsState = Record<string, OpeningBalanceAPIResponseResult>

function extractErrors(
  results: ResultsState,
  accountId: string,
): string[] | undefined {
  if (!results) {
    return
  }

  const result = results[accountId]
  if (!result || result?.status === 'fulfilled') {
    return undefined
  }

  if (result.status === 'rejected' && 'cause' in result.reason && result.reason.cause.type === 'validation') {
    return result.reason.cause.errors
  }

  return ['API_ERROR']
}

function ignoreAlreadySaved(
  formsData: AccountFormBoxData[],
  results: ResultsState,
) {
  return formsData.filter(f => results[f.account.id]?.status !== 'fulfilled')
}

function LinkedAccountsOpeningBalanceModalContent({
  onClose,
  accounts,
  stringOverrides,
}: {
  onClose: () => void
  accounts: LinkedAccount[]
  stringOverrides?: OpeningBalanceModalStringOverrides
}) {
  const { business } = useLayerContext()
  const { refetchAccounts } = useLinkedAccounts()

  // Mark if any data has been successfully saved with API
  // so the refetchAccounts should be called on onClose
  const [touched, setTouched] = useState(false)
  const [results, setResults] = useState<ResultsState>({})

  const [formsData, setFormsData] = useState<AccountFormBoxData[]>(accounts.map(item => (
    {
      account: item,
      isConfirmed: true,
      openingDate: getActivationDate(business) ?? startOfYear(new Date()),
    }
  )))

  const formsDataToSave = useMemo(() =>
    ignoreAlreadySaved(formsData, results),
  [formsData, results],
  )

  const { trigger, isMutating } = useBulkSetOpeningBalanceAndDate(
    formsDataToSave.map(x => ({
      accountId: x.account.id,
      openingDate: x.openingDate,
      openingBalance: convertToCents(x.openingBalance)?.toString(),
    })) as OpeningBalanceData[],
    {
      onSuccess: async (responses) => {
        // To preserve results from previous API calls.
        // In subsequent submits, already saved records are not passed to the hook,
        // so we need to combine new results with old ones to know
        // which records have been already saved.
        const newResults = { ...results }
        responses.forEach((r) => {
          newResults[r.accountId] = r
        })

        setResults(newResults)

        setTouched(true)
        if (responses.every(x => x.status === 'fulfilled')) {
          await refetchAccounts()
          onClose()
        }
      },
    })

  const handleDismiss = () => {
    if (touched) {
      void refetchAccounts()
    }

    onClose()
  }

  return (
    <VStack gap='lg'>
      <ModalTitleWithClose
        heading={(
          <ModalHeading size='xl'>
            {stringOverrides?.title ?? 'Add opening balance'}
          </ModalHeading>
        )}
        onClose={handleDismiss}
      />
      <VStack>
        <ModalContent>
          <VStack gap='md'>
            {formsData.map(item => (
              <AccountFormBox
                key={item.account.id}
                account={item.account}
                value={item}
                disableConfirmExclude={true}
                isSaved={results[item.account.id]?.status === 'fulfilled'}
                errors={extractErrors(results, item.account.id)}
                onChange={v => setFormsData(formsData.map(
                  item => item.account.id === v.account.id ? v : item,
                ))}
              />
            ),
            )}
          </VStack>
        </ModalContent>
        <ModalActions>
          <VStack gap='md'>
            <Button onPress={() => void trigger()} isPending={isMutating}>
              {stringOverrides?.buttonText ?? 'Submit'}
            </Button>
          </VStack>
        </ModalActions>
      </VStack>
    </VStack>
  )
}

export function OpeningBalanceModal({
  stringOverrides,
}: {
  stringOverrides?: OpeningBalanceModalStringOverrides
}) {
  const {
    accountsToAddOpeningBalanceInModal,
    setAccountsToAddOpeningBalanceInModal,
  } = useContext(LinkedAccountsContext)

  const shouldShowModal = Boolean(accountsToAddOpeningBalanceInModal.length)

  if (!shouldShowModal) {
    return null
  }

  return (
    <Modal
      isOpen={shouldShowModal}
      size='lg'
      flexBlock
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          setAccountsToAddOpeningBalanceInModal([])
        }
      }}
    >
      {({ close }) => (
        <LinkedAccountsOpeningBalanceModalContent
          accounts={accountsToAddOpeningBalanceInModal}
          onClose={close}
          stringOverrides={stringOverrides}
        />
      )}
    </Modal>
  )
}
