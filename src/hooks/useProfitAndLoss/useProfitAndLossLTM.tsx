import { useMemo } from 'react'
import { Layer } from '../../api/layer'
import { ProfitAndLoss, ReportingBasis } from '../../types'
import { useLayerContext } from '../useLayerContext'
import { useProfitAndLossQuery } from './useProfitAndLossQuery'
import { startOfMonth, endOfMonth, formatISO, sub } from 'date-fns'
import useSWR, { KeyedMutator } from 'swr'

type UseProfitAndLossLTMProps = {
  currentDate: Date
  tagFilter?: {
    key: string
    values: string[]
  }
  reportingBasis?: ReportingBasis
}

type UseProfitAndLossLTMReturn = (props?: UseProfitAndLossLTMProps) => {
  data: {
    data: ProfitAndLoss | undefined
    isLoading: boolean
    error: any
    startDate: Date
    endDate: Date
  }[]
  isLoading?: boolean
  error?: any
}

// const getStartAndEndDates = (currentDate: Date) => {
//   startOfMonth(sub(currentDate, { months: 8 }))

//   return {
//     startDate: startOfMonth(sub(currentDate, { months: 11 })),
//     endDate: endOfMonth(currentDate),
//   }
// }

const buildDates = ({ currentDate }: { currentDate: Date }) => {
  const list: { startDate: Date; endDate: Date }[] = []
  for (let i = 11; i > 0; i--) {
    const startDateWithOffset = startOfMonth(sub(currentDate, { months: i }))
    const endDateWithOffset = endOfMonth(sub(currentDate, { months: i }))

    list.push({
      startDate: startDateWithOffset,
      endDate: endDateWithOffset,
    })
  }

  list.push({
    startDate: startOfMonth(currentDate),
    endDate: endOfMonth(currentDate),
  })

  return list

  // const urls: string[] = []
  // for (let i = 11; i > 0; i--) {
  //   const startDateWithOffset = startOfMonth(sub(currentDate, { months: i }))
  //   const endDateWithOffset = endOfMonth(sub(currentDate, { months: i }))

  //   urls.push(
  //     `profit-and-loss-${businessId}-${startDateWithOffset.valueOf()}-${endDateWithOffset.valueOf()}-${tagFilter?.key}-${tagFilter?.values?.join(
  //       ',',
  //     )}-${reportingBasis}`,
  //   )
  // }

  // urls.push(
  //   `profit-and-loss-${businessId}-${startOfMonth(currentDate)}-${endOfMonth(
  //     currentDate,
  //   )}-${tagFilter?.key}-${tagFilter?.values?.join(',')}-${reportingBasis}`,
  // )

  // return urls
}

export const useProfitAndLossLTM: UseProfitAndLossLTMReturn = (
  { currentDate, tagFilter, reportingBasis }: UseProfitAndLossLTMProps = {
    currentDate: new Date(),
  },
) => {
  const { businessId } = useLayerContext()

  const dates: { startDate: Date; endDate: Date }[] = useMemo(() => {
    return buildDates({ currentDate })
  }, [currentDate, businessId, tagFilter, reportingBasis])

  const {
    data: data0,
    isLoading: isLoading0,
    error: error0,
    startDate: startDate0,
    endDate: endDate0,
  } = useProfitAndLossQuery({
    startDate: dates[0].startDate,
    endDate: dates[0].endDate,
    tagFilter,
    reportingBasis,
  })

  const {
    data: data1,
    isLoading: isLoading1,
    error: error1,
    startDate: startDate1,
    endDate: endDate1,
  } = useProfitAndLossQuery({
    startDate: dates[1].startDate,
    endDate: dates[1].endDate,
    tagFilter,
    reportingBasis,
  })

  const {
    data: data2,
    isLoading: isLoading2,
    error: error2,
    startDate: startDate2,
    endDate: endDate2,
  } = useProfitAndLossQuery({
    startDate: dates[2].startDate,
    endDate: dates[2].endDate,
    tagFilter,
    reportingBasis,
  })

  const {
    data: data3,
    isLoading: isLoading3,
    error: error3,
    startDate: startDate3,
    endDate: endDate3,
  } = useProfitAndLossQuery({
    startDate: dates[3].startDate,
    endDate: dates[3].endDate,
    tagFilter,
    reportingBasis,
  })

  const { data, isLoading, error } = useMemo(() => {
    return {
      data: [
        {
          data: data0,
          isLoading: isLoading0,
          error: error0,
          startDate: startDate0,
          endDate: endDate0,
        },
        {
          data: data1,
          isLoading: isLoading1,
          error: error1,
          startDate: startDate1,
          endDate: endDate1,
        },
        {
          data: data2,
          isLoading: isLoading2,
          error: error2,
          startDate: startDate2,
          endDate: endDate2,
        },
        {
          data: data3,
          isLoading: isLoading3,
          error: error3,
          startDate: startDate3,
          endDate: endDate3,
        },
      ],
      error: [error0, error1, error2, error3].find(x => !!x),
      isLoading: [isLoading0, isLoading1, isLoading2, isLoading3].find(
        x => !!x,
      ),
    }
  }, [
    data0,
    data1,
    data2,
    data3,
    isLoading0,
    isLoading1,
    isLoading2,
    isLoading3,
    error0,
    error1,
    error2,
    error3,
  ])

  return {
    data,
    isLoading,
    error,
  }
}
