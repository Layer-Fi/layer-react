import { InputGroup } from '../../Input/InputGroup'
import { Textarea } from '../../Textarea/Textarea'
import { BankTransaction } from '../../../types/bank_transactions'
import { useBankTransactionMemo } from './useBankTransactionMemo'

export const BankTransactionMemo = ({ bankTransactionId }: { bankTransactionId: BankTransaction['id'] }) => {
  const form = useBankTransactionMemo({ bankTransactionId })

  return (
    <form onBlur={() => void form.handleSubmit()}>
      <form.Field name='memo'>
        {field => (
          <InputGroup
            className='Layer__bank-transaction-memo-input-group'
            name='memo'
            label='Description'
          >
            <Textarea
              name='memo'
              placeholder='Add description'
              value={field.state.value ?? undefined}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => field.handleChange(e.target.value)}
            />
          </InputGroup>
        )}
      </form.Field>
    </form>
  )
}
