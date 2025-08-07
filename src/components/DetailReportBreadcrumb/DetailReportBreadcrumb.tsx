import { BackButton } from '../Button'
import { Header, HeaderCol, HeaderRow } from '../Header'
import ChevronRight from '../../icons/ChevronRight'

export interface BreadcrumbItem {
  name: string
  display_name: string
}

export interface DetailReportBreadcrumbProps {
  breadcrumbs: BreadcrumbItem[]
  subtitle?: string
  onClose: () => void
  onBreadcrumbClick?: (lineItemName: string) => void
  className?: string
}

export const DetailReportBreadcrumb = ({
  breadcrumbs,
  subtitle,
  onClose,
  onBreadcrumbClick,
  className,
}: DetailReportBreadcrumbProps) => {
  return (
    <Header className={className}>
      <HeaderRow>
        <HeaderCol>
          <div className='Layer__detail-report-breadcrumb'>
            <BackButton onClick={onClose} />
            <div className='Layer__detail-report-breadcrumb__content'>
              <div className='Layer__detail-report-breadcrumb__path'>
                {breadcrumbs.map((crumb, index) => (
                  <span key={index}>
                    {index === breadcrumbs.length - 1
                      ? (
                        <span className='Layer__detail-report-breadcrumb__current'>
                          {crumb.display_name}
                        </span>
                      )
                      : (
                        <button
                          className='Layer__detail-report-breadcrumb__segment'
                          onClick={() => onBreadcrumbClick?.(crumb.name)}
                          type='button'
                        >
                          {crumb.display_name}
                        </button>
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
      </HeaderRow>
    </Header>
  )
}
