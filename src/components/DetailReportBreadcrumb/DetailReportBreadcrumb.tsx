import { ReactNode } from 'react'
import { BackButton } from '../Button'
import { Header, HeaderCol, HeaderRow } from '../Header'

export interface DetailReportBreadcrumbProps {
  breadcrumbs: string[]
  subtitle?: string
  onClose: () => void
  className?: string
}

export const DetailReportBreadcrumb = ({
  breadcrumbs,
  subtitle,
  onClose,
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
                    <span
                      className={
                        index === breadcrumbs.length - 1
                          ? 'Layer__detail-report-breadcrumb__current'
                          : 'Layer__detail-report-breadcrumb__segment'
                      }
                    >
                      {crumb}
                    </span>
                    {index < breadcrumbs.length - 1 && (
                      <span className='Layer__detail-report-breadcrumb__separator'>
                        &gt;
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