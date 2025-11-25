import { type BankTransaction } from '@internal-types/bank_transactions'
import { HStack, VStack } from '@ui/Stack/Stack'
import { Label, Span } from '@ui/Typography/Text'
import { useBankTransactionMemo } from '@components/BankTransactions/BankTransactionMemo/useBankTransactionMemo'
import { Textarea } from '@components/Textarea/Textarea'

export const BankTransactionMemo = ({ bankTransactionId }: { bankTransactionId: BankTransaction['id'] }) => {
  const { form, isUpdatingMemo, isErrorUpdatingMemo, isSaved } = useBankTransactionMemo({ bankTransactionId })

  return (
    <form onBlur={() => void form.handleSubmit()}>
      <form.Field name='memo'>
        {field => (
          <VStack gap='3xs'>
            <HStack justify='space-between' align='baseline'>
              <Label htmlFor='memo' size='sm' weight='bold'>Description</Label>
              {isUpdatingMemo && (
                <Span size='sm' weight='bold' variant='subtle'>
                  Saving...
                </Span>
              )}
              {!isUpdatingMemo && isSaved && (
                <Span size='sm' status='success'>
                  Saved
                </Span>
              )}
              {!isUpdatingMemo && !isSaved && isErrorUpdatingMemo && (
                <Span size='sm' weight='bold' status='error'>
                  Error saving
                </Span>
              )}
            </HStack>
            <Textarea
              name='memo'
              placeholder='Add description'
              value={field.state.value ?? undefined}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => field.handleChange(e.target.value)}
            />
          </VStack>
        )}
      </form.Field>
    </form>
  )
}
