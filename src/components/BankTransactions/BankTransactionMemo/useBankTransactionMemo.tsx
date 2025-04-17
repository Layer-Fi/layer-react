import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react'
import { BankTransaction } from '../../../types'
import { useUpdateBankTransactionMetadata } from '../../../hooks/useBankTransactions/useUpdateBankTransactionMetadata'
import { useBankTransactionMetadata } from '../../../hooks/useBankTransactions/useBankTransactionsMetadata'

interface BankTransactionMemoProps {
  bankTransactionId: BankTransaction['id']
}

interface BankTransactionMemoProviderProps extends BankTransactionMemoProps {
  children: ReactNode
}

export type BankTransactionMemoContextType = ReturnType<typeof useBankTransactionMemo>

export const BankTransactionMemoContext = createContext<BankTransactionMemoContextType>({
  memo: undefined,
  setMemo: () => {},
  save: () => Promise.resolve(),
})

export const useBankTransactionMemoContext = () => useContext(BankTransactionMemoContext)

export const useBankTransactionMemo = ({ bankTransactionId }: BankTransactionMemoProps) => {
  const [memo, setMemo] = useState<string | undefined>()

  const { trigger: updateBankTransactionMetadata } = useUpdateBankTransactionMetadata({ bankTransactionId })
  const { data: bankTransactionMetadata } = useBankTransactionMetadata({ bankTransactionId })

  useEffect(() => {
    if (bankTransactionMetadata) {
      setMemo(bankTransactionMetadata.memo ?? undefined)
    }
  }, [bankTransactionMetadata])

  const save = async () => {
    try {
      if (memo !== undefined) {
        await updateBankTransactionMetadata({ memo })
      }
    }
    catch (error) {
      console.error(error)
    }
  }

  return {
    memo,
    setMemo,
    save,
  }
}

export const BankTransactionMemoProvider = ({
  children,
  bankTransactionId,
}: BankTransactionMemoProviderProps) => {
  const contextData = useBankTransactionMemo({ bankTransactionId })

  return (
    <BankTransactionMemoContext.Provider value={contextData}>
      {children}
    </BankTransactionMemoContext.Provider>
  )
}
