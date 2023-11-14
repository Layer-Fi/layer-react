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
  xit('renders and does not blow up when fetch can get mocked', async () => {
    global.fetch.mockResolvedValueOnce({
      json: () => Promise.resolve({ data: [makeBankTransaction()] }),
    })

    const { result } = renderHook(() => useBankTransactions())

    expect(result.current).toEqual({
      data: undefined,
      isLoading: true,
      error: undefined,
      mutateOne: expect.any(Function),
    })
    await waitFor(() =>
      expect(result.current).toEqual({
        data: { data: expect.arrayContaining([expect.anything()]) },
        isLoading: false,
        error: undefined,
        mutateOne: expect.any(Function),
      }),
    )
  })

  it('supplies a function to mutate a BankTransaction', async () => {
    global.fetch.mockResolvedValueOnce({
      json: () =>
        Promise.resolve({
          data: [
            makeBankTransaction({ id: '123', counterparty_name: 'Bob' }),
            makeBankTransaction({ id: '456', counterparty_name: 'Jane' }),
            makeBankTransaction({ id: '789', counterparty_name: 'Sid' }),
          ],
        }),
    })
    const { result } = renderHook(() => useBankTransactions())
    await waitFor(() => expect(result.current.data.data.length).toEqual(3))

    result.current.mutateOne({ id: '123', counterparty_name: 'Pat' })

    await waitFor(() =>
      expect(result.current.data.data[0].counterparty_name).toEqual('Pat'),
    )
  })
})
