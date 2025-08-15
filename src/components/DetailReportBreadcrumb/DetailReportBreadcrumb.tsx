import { HeaderCol } from '../Header'
import { Button } from '../ui/Button/Button'
import { Span } from '../ui/Typography/Text'
import ChevronRight from '../../icons/ChevronRight'

export interface BreadcrumbItem {
  name: string
  display_name: string
}

export interface DetailReportBreadcrumbProps {
  breadcrumbs: BreadcrumbItem[]
  subtitle?: string
  onBreadcrumbClick?: (lineItemName: string) => void
}

export const DetailReportBreadcrumb = ({
  breadcrumbs,
  subtitle,
  onBreadcrumbClick,
}: DetailReportBreadcrumbProps) => {
  return (
    <HeaderCol>
      <div className='Layer__detail-report-breadcrumb'>
        {/* <BackButton onClick={onClose} /> */}
        <div className='Layer__detail-report-breadcrumb__content'>
          <div className='Layer__detail-report-breadcrumb__path'>
            {breadcrumbs.map((crumb, index) => (
              <span key={crumb.name}>
                {index === breadcrumbs.length - 1
                  ? (
                    <span className='Layer__detail-report-breadcrumb__current'>
                      {crumb.display_name}
                    </span>
                  )
                  : (
                    <Button
                      variant='text'
                      onPress={() => onBreadcrumbClick?.(crumb.name)}
                    >
                      <Span variant='subtle'>{crumb.display_name}</Span>
                    </Button>
                  )}
                {index < breadcrumbs.length - 1 && (
                  <span className='Layer__detail-report-breadcrumb__separator'>
                    <ChevronRight size={10} />
                  </span>
                )}
              </span>
            ))}
          </div>
          {subtitle && (
            <div className='Layer__detail-report-breadcrumb__subtitle'>
              {subtitle}
            </div>
          )}
        </div>
      </div>
    </HeaderCol>
  )
}
