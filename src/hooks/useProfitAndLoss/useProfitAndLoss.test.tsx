import { Layer } from '../../api/layer'
import { useProfitAndLoss } from './'
import { renderHook, waitFor } from '@testing-library/react'
import { startOfMonth, endOfMonth } from 'date-fns'

jest.mock('../../contexts/LayerContext/LayerContext', () => ({
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

  it('reports the date range', async () => {
    const getProfitAndLoss = jest.spyOn(Layer, 'getProfitAndLoss')
    const swrFetcher = jest.fn()
    getProfitAndLoss.mockReturnValue(swrFetcher)
    const theDate = new Date(2020, 1, 29)

    const { result } = renderHook(() =>
      useProfitAndLoss({
        startDate: startOfMonth(theDate),
        endDate: endOfMonth(theDate),
      }),
    )

    expect(result.current.dateRange).toEqual({
      startDate: new Date(2020, 1, 1, 0, 0, 0, 0),
      endDate: new Date(2020, 1, 29, 23, 59, 59, 999),
    })
  })

  it('can change the date range', async () => {
    const getProfitAndLoss = jest.spyOn(Layer, 'getProfitAndLoss')
    const swrFetcher = jest.fn()
    getProfitAndLoss.mockReturnValue(swrFetcher)
    const theDate = new Date(2020, 1, 29)
    const { result } = renderHook(() =>
      useProfitAndLoss({
        startDate: startOfMonth(theDate),
        endDate: endOfMonth(theDate),
      }),
    )

    result.current.changeDateRange({
      startDate: new Date(2008, 9, 4),
      endDate: new Date(2008, 9, 4, 23, 59, 59, 999),
    })

    await waitFor(() =>
      expect(result.current.dateRange).toEqual({
        startDate: new Date(2008, 9, 4),
        endDate: new Date(2008, 9, 4, 23, 59, 59, 999),
      }),
    )
  })
})
