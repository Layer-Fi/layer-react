import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react'
import { Layer } from '../../../api/layer'
import { useLayerContext } from '../../../contexts/LayerContext'
import { BankTransaction } from '../../../types'
import { useAuth } from '../../../hooks/useAuth'
import { useEnvironment } from '../../../providers/Environment/EnvironmentInputProvider'

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
  const { businessId } = useLayerContext()
  const { apiUrl } = useEnvironment()
  const { data: auth } = useAuth()

  const [memo, setMemo] = useState<string | undefined>()
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    // Fetch documents details when the row is being opened and the documents are not yet loaded
    const fetchMemos = async () => {
      try {
        const getBankTransactionMetadata = Layer.getBankTransactionMetadata(
          apiUrl,
          auth?.access_token,
          {
            params: {
              businessId: businessId,
              bankTransactionId,
            },
          },
        )
        const result = await getBankTransactionMetadata()
        if (result.data.memo) setMemo(result.data.memo)
      }
      catch (error) {
        console.error(error)
      }
    }

    if (isActive && !isLoaded) {
      void fetchMemos()
      setIsLoaded(true)
    }
  }, [isActive, isLoaded, bankTransactionId, apiUrl, auth?.access_token, businessId])

  const save = async () => {
    try {
      if (memo !== undefined) {
        await Layer.updateBankTransactionMetadata(apiUrl, auth?.access_token, {
          params: { businessId, bankTransactionId },
          body: { memo },
        })
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
