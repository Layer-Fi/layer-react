import { useTranslation } from 'react-i18next'

import { type BankTransaction } from '@internal-types/bankTransactions'
import { HStack, VStack } from '@ui/Stack/Stack'
import { Label, Span } from '@ui/Typography/Text'
import { useBankTransactionMemo } from '@components/BankTransactions/BankTransactionMemo/useBankTransactionMemo'
import { Textarea } from '@components/Textarea/Textarea'

export const BankTransactionMemo = ({ bankTransactionId }: { bankTransactionId: BankTransaction['id'] }) => {
  const { t } = useTranslation()
  const { form, isUpdatingMemo, isErrorUpdatingMemo, isSaved } = useBankTransactionMemo({ bankTransactionId })

  return (
    <form onBlur={() => void form.handleSubmit()}>
      <form.Field name='memo'>
        {field => (
          <VStack gap='3xs'>
            <HStack justify='space-between' align='baseline'>
              <Label htmlFor='memo' size='sm' weight='bold'>{t('common:label.description', 'Description')}</Label>
              {isUpdatingMemo && (
                <Span size='sm' weight='bold' variant='subtle'>
                  {t('common:state.saving', 'Saving...')}
                </Span>
              )}
              {!isUpdatingMemo && isSaved && (
                <Span size='sm' status='success'>
                  {t('common:state.saved', 'Saved')}
                </Span>
              )}
              {!isUpdatingMemo && !isSaved && isErrorUpdatingMemo && (
                <Span size='sm' weight='bold' status='error'>
                  {t('common:error.saving', 'Error saving')}
                </Span>
              )}
            </HStack>
            <Textarea
              name='memo'
              placeholder={t('common:action.add_description', 'Add description')}
              value={field.state.value ?? undefined}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => field.handleChange(e.target.value)}
            />
          </VStack>
        )}
      </form.Field>
    </form>
  )
}
