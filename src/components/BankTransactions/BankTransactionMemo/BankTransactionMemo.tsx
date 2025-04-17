import { InputGroup } from '../../Input/InputGroup'
import { Textarea } from '../../Textarea'
import { BankTransaction } from '../../../types/bank_transactions'
import { BankTransactionMemoProvider, useBankTransactionMemo, useBankTransactionMemoContext } from './useBankTransactionMemo'

export const BankTransactionMemo = ({ bankTransactionId }: { bankTransactionId: BankTransaction['id'] }) => {
  return (
    <BankTransactionMemoProvider bankTransactionId={bankTransactionId}>
      <BankTransactionMemoInContext />
    </BankTransactionMemoProvider>
  )
}

export const BankTransactionMemoInContext = () => {
  const { memo, setMemo, save } = useBankTransactionMemoContext()

  return <BankTransactionMemoComponent memo={memo} setMemo={setMemo} save={save} />
}

export const BankTransactionMemoComponent = ({
  memo,
  setMemo,
  save,
}: ReturnType<typeof useBankTransactionMemo>) => {
  return (
    <InputGroup
      className='Layer__bank-transaction-memo-input-group'
      name='description'
      label='Description'
    >
      <Textarea
        name='description'
        placeholder='Add description'
        value={memo}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
          setMemo(e.target.value)}
        onBlur={() => void save()}
      />
    </InputGroup>
  )
}
