import { Layer } from '../../api/layer'
import { makeBankTransaction } from '../../test/factories/bankTransaction'
import { useBankTransactions } from './useBankTransactions'
import { renderHook, waitFor } from '@testing-library/react'

jest.mock('../../contexts/LayerContext/LayerContext', () => ({
  useLayerContext: () => ({
    auth: { access_token: '1234567890' },
    businessId: 'TRUCK',
  }),
}))

describe(useBankTransactions, () => {
  it('supplies a function to mutate a BankTransaction', async () => {
    const getBankTransactions = jest.spyOn(Layer, 'getBankTransactions')
    getBankTransactions.mockReturnValue(() =>
      Promise.resolve({
        data: [
          makeBankTransaction({ id: '123', counterparty_name: 'Bob' }),
          makeBankTransaction({ id: '456', counterparty_name: 'Jane' }),
          makeBankTransaction({ id: '789', counterparty_name: 'Sid' }),
        ],
      }),
    )
    const categorizeBankTransaction = jest.spyOn(
      Layer,
      'categorizeBankTransaction',
    )
    categorizeBankTransaction.mockImplementation((_, params) =>
      Promise.resolve({ data: params?.body }),
    )
    const { result } = renderHook(() => useBankTransactions())
    await waitFor(() => expect(result.current.data.length).toEqual(3))

    result.current.categorize('1234567890', {
      type: 'Category',
      category: {
        type: 'StableName',
        stable_name: 'FUEL',
      },
    })

    expect(categorizeBankTransaction).toHaveBeenCalledWith('1234567890', {
      params: { businessId: 'TRUCK', bankTransactionId: '1234567890' },
      body: {
        type: 'Category',
        category: {
          type: 'StableName',
          stable_name: 'FUEL',
        },
      },
    })
  })
})
