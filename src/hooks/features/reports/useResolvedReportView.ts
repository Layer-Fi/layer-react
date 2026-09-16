import { type View } from '@internal-types/shared/view'
import { useElementViewSize } from '@hooks/utils/size/useElementViewSize'

export const useResolvedReportView = (passedView?: View) => {
  const { view, containerRef } = useElementViewSize<HTMLDivElement>()
  const resolvedView = passedView ?? view

  return {
    containerRef,
    isMobileView: resolvedView === 'mobile',
  }
}
