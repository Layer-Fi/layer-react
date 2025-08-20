import { ReactNode } from 'react'
import { BackButton, CloseButton } from '../Button'
import { Header, HeaderCol, HeaderRow } from '../Header'
import { Heading, HeadingSize } from '../Typography'

export interface DetailReportHeaderProps {
  title: ReactNode
  onClose: () => void
  className?: string
}

export const DetailReportHeader = ({
  title,
  onClose,
  className,
}: DetailReportHeaderProps) => {
  return (
    <Header className={className}>
      <HeaderRow>
        <HeaderCol className='Layer__hidden-lg Layer__hidden-xl'>
          <BackButton onClick={onClose} />
          <Heading size={HeadingSize.secondary}>
            {title}
          </Heading>
        </HeaderCol>
        <HeaderCol className='Layer__show-lg Layer__show-xl'>
          <Heading size={HeadingSize.secondary}>
            {title}
          </Heading>
        </HeaderCol>
        <HeaderCol className='Layer__show-lg Layer__show-xl'>
          <CloseButton onClick={onClose} />
        </HeaderCol>
      </HeaderRow>
    </Header>
  )
}