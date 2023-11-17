import { Layer } from '../../api/layer'
import { makeBankTransaction } from '../../test/factories/bankTransaction'
import { useBankTransactions } from './useBankTransactions'
import { renderHook, waitFor } from '@testing-library/react'

jest.mock('../useLayerContext', () => ({
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
    categorizeBankTransaction.mockImplementation((_, { body }) =>
      Promise.resolve({ data: body }),
    )
    const { result } = renderHook(() => useBankTransactions())
    await waitFor(() => expect(result.current.data?.data?.length).toEqual(3))

    result.current.categorize({ id: '123', counterparty_name: 'Pat' })

    expect(categorizeBankTransaction).toHaveBeenCalledWith('1234567890', {
      params: { businessId: 'TRUCK', bankTransactionId: '123' },
      body: { id: '123', counterparty_name: 'Pat' },
    })
    await waitFor(() =>
      expect(result.current.data.data[0].counterparty_name).toEqual('Pat'),
    )
  })
})
