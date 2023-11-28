import React, { PropsWithChildren, createContext } from 'react'
import { useProfitAndLoss } from '../../hooks/useProfitAndLoss'
import { useWindowSize } from '../../hooks/useWindowSize/useWindowSize'
import { ProfitAndLossDatePicker } from '../ProfitAndLossDatePicker'
import { ProfitAndLossTable } from '../ProfitAndLossTable'
import { endOfMonth, startOfMonth } from 'date-fns'

type PNLContextType = ReturnType<typeof useProfitAndLoss> & {
  dimensions?: DOMRect
}
const PNLContext = createContext<PNLContextType>({
  data: undefined,
  isLoading: true,
  error: undefined,
  dimensions: undefined,
  dateRange: {
    startDate: startOfMonth(new Date()),
    endDate: endOfMonth(new Date()),
  },
  changeDateRange: () => {},
})

const ProfitAndLoss = ({ children }: PropsWithChildren) => {
  const contextData = useProfitAndLoss()
  const size = useWindowSize()
  const boundsRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState<DOMRect | undefined>(undefined)
  useLayoutEffect(() => {
    if (boundsRef.current) {
      setDimensions(boundsRef.current.getBoundingClientRect())
    }
  }, size)
  return (
    <PNLContext.Provider value={{ ...contextData, dimensions }}>
      <div ref={boundsRef} className="Layer__profit-and-loss">
        {children}
      </div>
    </PNLContext.Provider>
  )
}

ProfitAndLoss.DatePicker = ProfitAndLossDatePicker
ProfitAndLoss.Table = ProfitAndLossTable
ProfitAndLoss.Context = PNLContext
export { ProfitAndLoss }
