import { compact } from 'lodash-es'
import { useTranslation } from 'react-i18next'

import { HStack, VStack } from '@ui/Stack/Stack'
import { ErrorText } from '@components/Typography/ErrorText'

export type BankTransactionErrorTextProps = {
  submitErrorMessage?: string | null
  splitFormError?: string | null
  matchFormError?: string | null
  showApprovalError?: boolean
  layout?: 'inline' | 'padded'
}

export const BankTransactionErrorText = ({
  submitErrorMessage,
  splitFormError,
  matchFormError,
  showApprovalError,
  layout = 'padded',
}: BankTransactionErrorTextProps) => {
  const { t } = useTranslation()

  const messages = compact([
    submitErrorMessage,
    splitFormError,
    matchFormError,
    showApprovalError ? t('bankTransactions:error.approval_failed_check_connection', 'Approval failed. Check connection and retry in a few seconds.') : null,
  ])

  if (messages.length === 0) return null

  if (layout === 'inline') {
    return (
      <VStack gap='2xs'>
        {messages.map(message => <ErrorText key={message}>{message}</ErrorText>)}
      </VStack>
    )
  }

  return (
    <HStack pis='md' pbe='md'>
      <VStack gap='2xs'>
        {messages.map(message => <ErrorText key={message}>{message}</ErrorText>)}
      </VStack>
    </HStack>
  )
}
