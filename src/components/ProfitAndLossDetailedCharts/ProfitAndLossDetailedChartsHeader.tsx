import { DateFormat } from '@utils/i18n/date/patterns'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { useSizeClass } from '@hooks/utils/size/useWindowSize'
import { BackButton } from '@ui/Button/BackButton'
import { CloseButton as UICloseButton } from '@ui/Button/CloseButton'
import { HStack, VStack } from '@ui/Stack/Stack'
import { Heading } from '@ui/Typography/Heading'
import { Span } from '@ui/Typography/Text'
import { GlobalMonthPicker } from '@components/GlobalMonthPicker/GlobalMonthPicker'

import './profitAndLossDetailedChartsHeader.scss'

type HeaderTitleProps = {
  title: string
  dateLabel: string
  showDatePicker: boolean
  isMobile: boolean
}

const HeaderTitle = ({ isMobile, title, dateLabel, showDatePicker }: HeaderTitleProps) => (
  <HStack justify='space-between' align='center' gap='md' fluid>
    <VStack className='Layer__ProfitAndLossDetailedChartsHeader__head'>
      <Heading level={3} size='sm'>
        {title}
      </Heading>
      {!showDatePicker && (
        <Span size='sm' variant='subtle'>
          {dateLabel}
        </Span>
      )}

    </VStack>
    {showDatePicker && <GlobalMonthPicker truncateMonth={isMobile} />}
  </HStack>
)

enum CloseButtonVariant {
  OutlinedIconButton = 'OutlinedIconButton',
  BackButton = 'BackButton',
}

type CloseButtonProps = {
  variant: CloseButtonVariant
  onClose: () => void
}
const CloseButton = ({ variant, onClose }: CloseButtonProps) => {
  if (variant === CloseButtonVariant.BackButton) {
    return <BackButton onPress={onClose} />
  }

  return <UICloseButton onPress={onClose} />
}

type ProfitAndLossDetailedChartsHeaderProps = {
  title: string
  date: Date
  showCloseButton?: boolean
  showDatePicker?: boolean
  onClose: () => void
}

export const ProfitAndLossDetailedChartsHeader = ({
  title,
  date,
  showCloseButton = true,
  showDatePicker = false,
  onClose,
}: ProfitAndLossDetailedChartsHeaderProps) => {
  const { isDesktop, isMobile } = useSizeClass()
  const { formatDate } = useIntlFormatter()

  const headerProps: HeaderTitleProps = {
    title,
    isMobile,
    showDatePicker,
    dateLabel: formatDate(date, DateFormat.MonthYear),
  }

  const closeButtonProps: CloseButtonProps = {
    variant: isDesktop ? CloseButtonVariant.OutlinedIconButton : CloseButtonVariant.BackButton,
    onClose,
  }

  return (
    <header className='Layer__ProfitAndLossDetailedChartsHeader'>
      {!isDesktop && showCloseButton && <CloseButton {...closeButtonProps} />}
      <HeaderTitle {...headerProps} />
      {isDesktop && showCloseButton && <CloseButton {...closeButtonProps} />}
    </header>
  )
}
