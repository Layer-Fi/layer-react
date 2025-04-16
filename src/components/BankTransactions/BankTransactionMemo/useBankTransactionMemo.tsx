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
  isActive?: boolean
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

export const useBankTransactionMemo = ({ bankTransactionId, isActive }: BankTransactionMemoProps) => {
  const [memo, setMemo] = useState<string | undefined>()

  const { trigger: updateBankTransactionMetadata } = useUpdateBankTransactionMetadata({ bankTransactionId })
  const { data: bankTransactionMetadata } = useBankTransactionMetadata({ bankTransactionId })

  console.log('bankTransactionMetadata', bankTransactionMetadata)

  useEffect(() => {
    if (bankTransactionMetadata) {
      console.log('set memo', bankTransactionMetadata.memo)
      setMemo(bankTransactionMetadata.memo ?? undefined)
    }
  }, [bankTransactionMetadata])

  // useEffect(() => {
  //   // Fetch documents details when the row is being opened and the documents are not yet loaded
  //   const fetchMemos = async () => {
  //     try {
  //       const getBankTransactionMetadata = Layer.getBankTransactionMetadata(
  //         apiUrl,
  //         auth?.access_token,
  //         {
  //           params: {
  //             businessId: businessId,
  //             bankTransactionId,
  //           },
  //         },
  //       )
  //       const result = await getBankTransactionMetadata()
  //       if (result.data.memo) setMemo(result.data.memo)
  //     }
  //     catch (error) {
  //       console.error(error)
  //     }
  //   }

  //   if (isActive && !isLoaded) {
  //     void fetchMemos()
  //     setIsLoaded(true)
  //   }
  // }, [isActive, isLoaded, bankTransactionId, apiUrl, auth?.access_token, businessId])

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
  isActive = true,
}: BankTransactionMemoProviderProps) => {
  const contextData = useBankTransactionMemo({ bankTransactionId, isActive })

  return (
    <BankTransactionMemoContext.Provider value={contextData}>
      {children}
    </BankTransactionMemoContext.Provider>
  )
}
