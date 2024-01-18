import { Layer } from '../../api/layer'
import { BankTransaction, CategoryUpdate, Metadata } from '../../types'
import { useLayerContext } from '../useLayerContext'
import useSWR from 'swr'

type UseBankTransactions = () => {
  data: BankTransaction[]
  metadata: Metadata
  isLoading: boolean
  error: unknown
  categorize: (
    id: BankTransaction['id'],
    newCategory: CategoryUpdate,
  ) => Promise<void>
  updateOneLocal: (bankTransaction: BankTransaction) => void
}

export const useBankTransactions: UseBankTransactions = () => {
  const { auth, businessId, apiUrl } = useLayerContext()

  const {
    data: responseData,
    isLoading,
    error: responseError,
    mutate,
  } = useSWR(
    businessId && auth?.access_token && `bank-transactions-${businessId}`,
    Layer.getBankTransactions(apiUrl, auth?.access_token, {
      params: { businessId },
    }),
  )

  const {
    data = [],
    meta: metadata = {},
    error = undefined,
  } = responseData || {}

  const categorize = (
    id: BankTransaction['id'],
    newCategory: CategoryUpdate,
  ) => {
    const foundBT = data.find(x => x.business_id === businessId && x.id === id)
    if (foundBT) {
      updateOneLocal({ ...foundBT, processing: true, error: undefined })
    }

    return Layer.categorizeBankTransaction(apiUrl, auth.access_token, {
      params: { businessId, bankTransactionId: id },
      body: newCategory,
    })
      .then(({ data: newBT, errors }) => {
        if (newBT) {
          newBT.recently_categorized = true
          updateOneLocal(newBT)
        }
        if (errors) {
          console.error(errors)
          throw errors
        }
      })
      .catch(err => {
        const newBT = data.find(
          x => x.business_id === businessId && x.id === id,
        )

        if (newBT) {
          updateOneLocal({
            ...newBT,
            error: err.message,
            processing: false,
          })
        }
      })
  }

  const updateOneLocal = (newBankTransaction: BankTransaction) => {
    const updatedData = data.map(bt =>
      bt.id === newBankTransaction.id ? newBankTransaction : bt,
    )
    mutate({ data: updatedData }, { revalidate: false })
  }

  return {
    data,
    metadata,
    isLoading,
    error: responseError || error,
    categorize,
    updateOneLocal,
  }
}
