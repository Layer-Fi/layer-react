import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react'
import { Layer } from '../../api/layer'
import { useLayerContext } from '../../contexts/LayerContext'
import { BankTransaction } from '../../types'

interface MemoTextProps {
  bankTransaction: BankTransaction
  isActive?: boolean
}

interface MemoTextProviderProps extends MemoTextProps {
  children: ReactNode
}

export type MemoTextContextType = ReturnType<typeof useMemoText>

export const MemoTextContext = createContext<MemoTextContextType>({
  memoText: undefined,
  setMemoText: () => {},
  saveMemoText: () => Promise.resolve(),
})

export const useMemoTextContext = () => useContext(MemoTextContext)

const useMemoText = ({ bankTransaction, isActive }: MemoTextProps) => {
  const { auth, businessId, apiUrl } = useLayerContext()

  const [memoText, setMemoText] = useState<string | undefined>()
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    // Fetch documents details when the row is being opened and the documents are not yet loaded
    if (isActive && !isLoaded) {
      fetchMemos()
      setIsLoaded(true)
    }
  }, [isActive])

  const fetchMemos = async () => {
    try {
      const getBankTransactionMetadata = Layer.getBankTransactionMetadata(
        apiUrl,
        auth.access_token,
        {
          params: {
            businessId: businessId,
            bankTransactionId: bankTransaction.id,
          },
        },
      )
      const result = await getBankTransactionMetadata()
      if (result.data.memo) setMemoText(result.data.memo)
    } catch (error) {
      console.error(error)
    }
  }

  const saveMemoText = async () => {
    try {
      if (memoText !== undefined) {
        await Layer.updateBankTransactionMetadata(apiUrl, auth.access_token, {
          params: {
            businessId: businessId,
            bankTransactionId: bankTransaction.id,
          },
          body: {
            memo: memoText,
          },
        })
      }
    } catch (error) {
      console.error(error)
    }
  }

  return {
    memoText,
    setMemoText,
    saveMemoText,
  }
}

export const MemoTextProvider = ({
  children,
  bankTransaction,
  isActive,
}: MemoTextProviderProps) => {
  const contextData = useMemoText({ bankTransaction, isActive })

  return (
    <MemoTextContext.Provider value={contextData}>
      {children}
    </MemoTextContext.Provider>
  )
}
