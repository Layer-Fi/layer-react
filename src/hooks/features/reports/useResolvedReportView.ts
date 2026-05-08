import { type View } from '@internal-types/general'
import { useElementViewSize } from '@hooks/utils/size/useElementViewSize'

export const useResolvedReportView = (passedView?: View) => {
  const { view, containerRef } = useElementViewSize<HTMLDivElement>()
  const resolvedView = passedView ?? view

  return {
    containerRef,
    isMobileView: resolvedView === 'mobile',
  }
}
