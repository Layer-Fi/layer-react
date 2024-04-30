import { useEffect, useMemo, useState } from 'react'
import { ProfitAndLoss, ReportingBasis } from '../../types'
import { LoadedStatus } from '../../types/general'
import { useLayerContext } from '../useLayerContext'
import { useProfitAndLossQuery } from './useProfitAndLossQuery'
import { startOfMonth, endOfMonth, formatISO, sub } from 'date-fns'

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
  loaded?: LoadedStatus
  error?: any
}

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
}

export const useProfitAndLossLTM: UseProfitAndLossLTMReturn = (
  { currentDate, tagFilter, reportingBasis }: UseProfitAndLossLTMProps = {
    currentDate: new Date(),
  },
) => {
  const { businessId } = useLayerContext()
  const [loaded, setLoaded] = useState<LoadedStatus>('initial')

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

  const {
    data: data4,
    isLoading: isLoading4,
    error: error4,
    startDate: startDate4,
    endDate: endDate4,
  } = useProfitAndLossQuery({
    startDate: dates[4].startDate,
    endDate: dates[4].endDate,
    tagFilter,
    reportingBasis,
  })

  const {
    data: data5,
    isLoading: isLoading5,
    error: error5,
    startDate: startDate5,
    endDate: endDate5,
  } = useProfitAndLossQuery({
    startDate: dates[5].startDate,
    endDate: dates[5].endDate,
    tagFilter,
    reportingBasis,
  })

  const {
    data: data6,
    isLoading: isLoading6,
    error: error6,
    startDate: startDate6,
    endDate: endDate6,
  } = useProfitAndLossQuery({
    startDate: dates[6].startDate,
    endDate: dates[6].endDate,
    tagFilter,
    reportingBasis,
  })

  const {
    data: data7,
    isLoading: isLoading7,
    error: error7,
    startDate: startDate7,
    endDate: endDate7,
  } = useProfitAndLossQuery({
    startDate: dates[7].startDate,
    endDate: dates[7].endDate,
    tagFilter,
    reportingBasis,
  })

  const {
    data: data8,
    isLoading: isLoading8,
    error: error8,
    startDate: startDate8,
    endDate: endDate8,
  } = useProfitAndLossQuery({
    startDate: dates[8].startDate,
    endDate: dates[8].endDate,
    tagFilter,
    reportingBasis,
  })

  const {
    data: data9,
    isLoading: isLoading9,
    error: error9,
    startDate: startDate9,
    endDate: endDate9,
  } = useProfitAndLossQuery({
    startDate: dates[9].startDate,
    endDate: dates[9].endDate,
    tagFilter,
    reportingBasis,
  })

  const {
    data: data10,
    isLoading: isLoading10,
    error: error10,
    startDate: startDate10,
    endDate: endDate10,
  } = useProfitAndLossQuery({
    startDate: dates[10].startDate,
    endDate: dates[10].endDate,
    tagFilter,
    reportingBasis,
  })

  const {
    data: data11,
    isLoading: isLoading11,
    error: error11,
    startDate: startDate11,
    endDate: endDate11,
  } = useProfitAndLossQuery({
    startDate: dates[11].startDate,
    endDate: dates[11].endDate,
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

        {
          data: data4,
          isLoading: isLoading4,
          error: error4,
          startDate: startDate4,
          endDate: endDate4,
        },

        {
          data: data5,
          isLoading: isLoading5,
          error: error5,
          startDate: startDate5,
          endDate: endDate5,
        },

        {
          data: data6,
          isLoading: isLoading6,
          error: error6,
          startDate: startDate6,
          endDate: endDate6,
        },

        {
          data: data7,
          isLoading: isLoading7,
          error: error7,
          startDate: startDate7,
          endDate: endDate7,
        },

        {
          data: data8,
          isLoading: isLoading8,
          error: error8,
          startDate: startDate8,
          endDate: endDate8,
        },

        {
          data: data9,
          isLoading: isLoading9,
          error: error9,
          startDate: startDate9,
          endDate: endDate9,
        },

        {
          data: data10,
          isLoading: isLoading10,
          error: error10,
          startDate: startDate10,
          endDate: endDate10,
        },

        {
          data: data11,
          isLoading: isLoading11,
          error: error11,
          startDate: startDate11,
          endDate: endDate11,
        },
      ],
      error: [
        error0,
        error1,
        error2,
        error3,
        error4,
        error5,
        error6,
        error7,
        error8,
        error9,
        error10,
        error11,
      ].find(x => !!x),
      isLoading: [
        isLoading0,
        isLoading1,
        isLoading2,
        isLoading3,
        isLoading4,
        isLoading5,
        isLoading6,
        isLoading7,
        isLoading8,
        isLoading9,
        isLoading10,
        isLoading11,
      ].find(x => !!x),
    }
  }, [
    data0,
    data1,
    data2,
    data3,
    data4,
    data5,
    data6,
    data7,
    data8,
    data9,
    data10,
    data11,
    isLoading0,
    isLoading1,
    isLoading2,
    isLoading3,
    isLoading4,
    isLoading5,
    isLoading6,
    isLoading7,
    isLoading8,
    isLoading9,
    isLoading10,
    isLoading11,
    error0,
    error1,
    error2,
    error3,
    error4,
    error5,
    error6,
    error7,
    error8,
    error9,
    error10,
    error11,
  ])

  useEffect(() => {
    if (isLoading && loaded === 'initial') {
      setLoaded('loading')
      return
    }

    if (!isLoading && data && !data.find(x => !x.data && !x.error)) {
      // setLoaded('complete')
    }
  }, [data, isLoading])

  return {
    data,
    isLoading,
    loaded,
    error,
  }
}
