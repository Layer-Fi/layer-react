import { useContext, useMemo, useState } from 'react'
import { startOfYear } from 'date-fns'
import { useTranslation } from 'react-i18next'
import { useIntl } from 'react-intl'

import { type BankAccount } from '@internal-types/linkedAccounts'
import { getActivationDate } from '@utils/business'
import { toLocalizedCents } from '@utils/i18n/number/input'
import { useLinkedAccounts } from '@hooks/legacy/useLinkedAccounts'
import {
  type OpeningBalanceAPIResponseResult,
  type OpeningBalanceData,
  useBulkSetOpeningBalanceAndDate,
} from '@hooks/legacy/useUpdateOpeningBalanceAndDate'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'
import { LinkedAccountsContext } from '@contexts/LinkedAccountsContext/LinkedAccountsContext'
import { Button } from '@ui/Button/Button'
import { Modal } from '@ui/Modal/Modal'
import { ModalActions, ModalContent, ModalHeading, ModalTitleWithClose } from '@ui/Modal/ModalSlots'
import { VStack } from '@ui/Stack/Stack'
import { AccountFormBox, type AccountFormBoxData } from '@components/LinkedAccounts/AccountFormBox/AccountFormBox'

type OpeningBalanceModalStringOverrides = {
  title?: string
  description?: string
  buttonText?: string
}

type ResultsState = Record<string, OpeningBalanceAPIResponseResult>

function extractErrors(
  results: ResultsState,
  bankAccountId: string,
): string[] | undefined {
  if (!results) {
    return
  }

  const result = results[bankAccountId]
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
  return formsData.filter(f => results[f.bankAccount.id]?.status !== 'fulfilled')
}

function LinkedAccountsOpeningBalanceModalContent({
  onClose,
  accounts,
  stringOverrides,
}: {
  onClose: () => void
  accounts: BankAccount[]
  stringOverrides?: OpeningBalanceModalStringOverrides
}) {
  const { t } = useTranslation()
  const intl = useIntl()
  const { business } = useLayerContext()
  const { refetchAccounts } = useLinkedAccounts()

  // Mark if any data has been successfully saved with API
  // so the refetchAccounts should be called on onClose
  const [touched, setTouched] = useState(false)
  const [results, setResults] = useState<ResultsState>({})

  const [formsData, setFormsData] = useState<AccountFormBoxData[]>(accounts.map(item => (
    {
      bankAccount: item,
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
      bankAccountId: x.bankAccount.id,
      openingDate: x.openingDate,
      openingBalance: toLocalizedCents(x.openingBalance, intl.locale) ?? 0,
      isDateInvalid: x.isDateInvalid,
    })) as OpeningBalanceData[],
    {
      onSuccess: async (responses) => {
        // To preserve results from previous API calls.
        // In subsequent submits, already saved records are not passed to the hook,
        // so we need to combine new results with old ones to know
        // which records have been already saved.
        const newResults = { ...results }
        responses.forEach((r) => {
          newResults[r.bankAccountId] = r
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
    <VStack>
      <ModalTitleWithClose
        heading={(
          <ModalHeading size='sm'>
            {stringOverrides?.title ?? t('linkedAccounts:action.add_opening_balance', 'Add opening balance')}
          </ModalHeading>
        )}
        onClose={handleDismiss}
      />
      <VStack>
        <ModalContent>
          <VStack gap='md'>
            {formsData.map(item => (
              <AccountFormBox
                key={item.bankAccount.id}
                bankAccount={item.bankAccount}
                value={item}
                disableConfirmExclude={true}
                isSaved={results[item.bankAccount.id]?.status === 'fulfilled'}
                errors={extractErrors(results, item.bankAccount.id)}
                onChange={v => setFormsData(formsData.map(
                  item => item.bankAccount.id === v.bankAccount.id ? v : item,
                ))}
              />
            ),
            )}
          </VStack>
        </ModalContent>
        <ModalActions>
          <VStack gap='md'>
            <Button onPress={() => void trigger()} isPending={isMutating}>
              {stringOverrides?.buttonText ?? t('common:action.submit_label', 'Submit')}
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

  const shouldShowModal = !!(accountsToAddOpeningBalanceInModal.length)

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
