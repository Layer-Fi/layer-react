import { ProfitAndLossDetailReport, type ProfitAndLossDetailReportProps } from '@components/ProfitAndLossDetailReport/ProfitAndLossDetailReport'
import { type SelectedLineItem } from '@components/ProfitAndLossReport/ProfitAndLossReport'
import { Drawer } from '@ui/Modal/Modal'
import { useSizeClass } from '@hooks/useWindowSize/useWindowSize'

export interface DetailReportModalProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  selectedItem: SelectedLineItem | null
  onBreadcrumbClick?: (lineItemName: string) => void
  stringOverrides?: ProfitAndLossDetailReportProps['stringOverrides']
}

export function DetailReportModal({
  isOpen,
  onOpenChange,
  selectedItem,
  onBreadcrumbClick,
  stringOverrides,
}: DetailReportModalProps) {
  const { isMobile, isTablet } = useSizeClass()
  const handleClose = () => {
    onOpenChange(false)
  }

  const shouldUseMobileDrawer = isMobile || isTablet

  return (
    <Drawer
      isOpen={isOpen}
      size='xl'
      onOpenChange={onOpenChange}
      aria-label='Profit and Loss Detail Report'
      variant={shouldUseMobileDrawer ? 'mobile-drawer' : 'drawer'}
    >
      <div className={shouldUseMobileDrawer ? 'Layer__ProfitAndLossReport__Modal--mobile' : 'Layer__ProfitAndLossReport__Modal--drawer'}>
        {selectedItem && selectedItem.lineItemName && (
          <ProfitAndLossDetailReport
            lineItemName={selectedItem.lineItemName}
            breadcrumbPath={selectedItem.breadcrumbPath}
            onClose={handleClose}
            onBreadcrumbClick={onBreadcrumbClick}
            stringOverrides={stringOverrides}
          />
        )}
      </div>
    </Drawer>
  )
}
