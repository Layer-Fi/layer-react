import { Layer } from '../../api/layer'
import { useProfitAndLoss } from './'
import { renderHook } from '@testing-library/react'
import { startOfMonth, endOfMonth } from 'date-fns'

jest.mock('../useLayerContext', () => ({
  useLayerContext: () => ({
    auth: { access_token: '1234567890' },
    businessId: 'TRUCK',
  }),
}))

describe(useProfitAndLoss, () => {
  it('calls the proper endpoint', async () => {
    const getProfitAndLoss = jest.spyOn(Layer, 'getProfitAndLoss')
    const swrFetcher = jest.fn()
    getProfitAndLoss.mockReturnValue(swrFetcher)
    const theDate = new Date(2020, 1, 29)

    renderHook(() =>
      useProfitAndLoss({
        startDate: startOfMonth(theDate),
        endDate: endOfMonth(theDate),
      }),
    )

    expect(getProfitAndLoss).toHaveBeenCalledWith('1234567890', {
      params: {
        businessId: 'TRUCK',
        startDate: '2020-02-01T00:00:00-05:00',
        endDate: '2020-02-29T23:59:59-05:00',
      },
    })
    expect(swrFetcher).toHaveBeenCalledWith(
      'profit-and-loss-TRUCK-1580533200000-1583038799999',
    )
  })
})
