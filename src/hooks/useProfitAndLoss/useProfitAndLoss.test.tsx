import { Layer } from '../../api/layer'
import { makeProfitAndLoss } from '../../test/factories/profitAndLoss'
import { UseProfitAndLoss, useProfitAndLoss } from './'
import { renderHook, waitFor } from '@testing-library/react'
import { startOfMonth, endOfMonth } from 'date-fns'

jest.mock('../useLayerContext', () => ({
  useLayerContext: () => ({
    auth: { access_token: '1234567890' },
    businessId: 'TRUCK',
  }),
}))

describe(UseProfitAndLoss, () => {
  it('', async () => {
    const getProfitAndLoss = jest.spyOn(Layer, 'getProfitAndLoss')
    const getProfitAndLossScoped = jest.fn()
    getProfitAndLoss.mockReturnValue((...args) =>
      getProfitAndLossScoped.mockResolvedValue(args),
    )
    const theDate = new Date(2020, 3, 29)
    const { result } = renderHook(() =>
      useProfitAndLoss({
        startDate: startOfMonth(theDate),
        endDate: endOfMonth(theDate),
      }),
    )

    await waitFor(() => expect(result.current.data?.data?.length).toEqual(3))

    await waitFor(() =>
      expect(result.current.data.data.counterparty_name).toEqual('Pat'),
    )
  })
})
