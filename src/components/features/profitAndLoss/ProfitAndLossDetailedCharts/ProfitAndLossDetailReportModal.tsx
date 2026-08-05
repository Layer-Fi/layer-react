import { useTranslation } from 'react-i18next'

import { useSizeClass } from '@hooks/utils/size/useWindowSize'
import { type SelectedLineItem } from '@providers/features/profitAndLoss/ProfitAndLossContext/useProfitAndLoss'
import { Drawer } from '@ui/Modal/Modal'
import { ProfitAndLossDetailReport, type ProfitAndLossDetailReportStringOverrides } from '@features/profitAndLoss/ProfitAndLossDetailReport/ProfitAndLossDetailReport'

export interface ProfitAndLossDetailReportModalProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  selectedItem: SelectedLineItem | null
  onBreadcrumbClick?: (lineItemName: string) => void
  stringOverrides?: ProfitAndLossDetailReportStringOverrides
}

export function ProfitAndLossDetailReportModal({
  isOpen,
  onOpenChange,
  selectedItem,
  onBreadcrumbClick,
  stringOverrides,
}: ProfitAndLossDetailReportModalProps) {
  const { t } = useTranslation()
  const { isMobile, isTablet } = useSizeClass()
  const handleClose = () => {
    onOpenChange(false)
  }

  const shouldUseMobileDrawer = isMobile || isTablet

  return (
    <Drawer
      isOpen={isOpen}
      size='2xl'
      onOpenChange={onOpenChange}
      aria-label={t('reports:label.profit_loss_detail_report', 'Profit and Loss Detail Report')}
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
