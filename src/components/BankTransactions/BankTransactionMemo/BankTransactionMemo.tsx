import { useTranslation } from 'react-i18next'

import { type BankTransaction } from '@internal-types/bankTransactions'
import { HStack, VStack } from '@ui/Stack/Stack'
import { Label, Span } from '@ui/Typography/Text'
import { useBankTransactionMemo } from '@components/BankTransactions/BankTransactionMemo/useBankTransactionMemo'
import { Input } from '@components/Input/Input'
import { Textarea } from '@components/Textarea/Textarea'

import './bankTransactionMemo.scss'

export const BankTransactionMemo = ({ bankTransactionId, isMobile }: { bankTransactionId: BankTransaction['id'], isMobile?: boolean }) => {
  const { t } = useTranslation()
  const { form, isUpdatingMemo, isErrorUpdatingMemo, isSaved } = useBankTransactionMemo({ bankTransactionId })

  return (
    <form onBlur={() => void form.handleSubmit()}>
      <form.Field name='memo'>
        {field => (
          <VStack gap='3xs' className='Layer__BankTransactionMemo'>
            <HStack justify='space-between' align='baseline'>
              <Label htmlFor='memo' size='sm' weight='bold'>{t('description', 'Description')}</Label>
              {isUpdatingMemo && (
                <Span size='sm' weight='bold' variant='subtle'>
                  {t('saving', 'Saving...')}
                </Span>
              )}
              {!isUpdatingMemo && isSaved && (
                <Span size='sm' status='success'>
                  {t('saved', 'Saved')}
                </Span>
              )}
              {!isUpdatingMemo && !isSaved && isErrorUpdatingMemo && (
                <Span size='sm' weight='bold' status='error'>
                  {t('errorSaving', 'Error saving')}
                </Span>
              )}
            </HStack>
            {isMobile
              ? (
                <Input
                  name='memo'
                  className='Layer__BankTransactionMemo__InputTextArea'
                  placeholder='Add description'
                  value={field.state.value ?? undefined}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => field.handleChange(e.target.value)}
                />
              )
              : (
                <Textarea
                  name='memo'
                  className='Layer__BankTransactionMemo__InputTextArea'
                  placeholder='Add description'
                  value={field.state.value ?? undefined}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => field.handleChange(e.target.value)}
                />
              )}
          </VStack>
        )}
      </form.Field>
    </form>
  )
}
