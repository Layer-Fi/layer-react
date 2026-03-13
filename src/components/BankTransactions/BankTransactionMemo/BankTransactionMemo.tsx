import type React from 'react'
import { useTranslation } from 'react-i18next'

import { type BankTransaction } from '@internal-types/bankTransactions'
import { Input } from '@ui/Input/Input'
import { InputGroup } from '@ui/Input/InputGroup'
import { TextArea } from '@ui/Input/TextArea'
import { HStack, VStack } from '@ui/Stack/Stack'
import { Label, Span } from '@ui/Typography/Text'
import { useBankTransactionMemo } from '@components/BankTransactions/BankTransactionMemo/useBankTransactionMemo'

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
            <HStack className='Layer__BankTransactionMemo__InputTextArea'>
              {isMobile
                ? (
                  <InputGroup>
                    <Input
                      name='memo'
                      placeholder='Add description'
                      value={field.state.value ?? undefined}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => field.handleChange(e.target.value)}
                    />
                  </InputGroup>
                )
                : (
                  <TextArea
                    name='memo'
                    placeholder='Add description'
                    value={field.state.value ?? undefined}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => field.handleChange(e.target.value)}
                  />
                )}
            </HStack>
          </VStack>
        )}
      </form.Field>
    </form>
  )
}
