import classNames from 'classnames'

import { DateFormat } from '@utils/i18n/date/patterns'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
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
  isTablet: boolean
  showDatePicker: boolean
}

const HeaderTitle = ({ title, dateLabel, isTablet, showDatePicker }: HeaderTitleProps) => (
  <HStack justify='space-between' align='center' gap='md' fluid>
    <VStack className='Layer__ProfitAndLossDetailedChartsHeader__head'>
      <Heading level={3} size='sm'>
        {title}
      </Heading>
      <Span
        size='sm'
        variant={isTablet ? undefined : 'subtle'}
        className='Layer__ProfitAndLossDetailedChartsHeader__date'
      >
        {dateLabel}
      </Span>
    </VStack>
    {!isTablet && showDatePicker && <GlobalMonthPicker />}
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
  mode: 'desktop' | 'tablet'
  showCloseButton?: boolean
  showDatePicker?: boolean
  onClose: () => void
}

export const ProfitAndLossDetailedChartsHeader = ({
  title,
  date,
  mode,
  showCloseButton = true,
  showDatePicker = false,
  onClose,
}: ProfitAndLossDetailedChartsHeaderProps) => {
  const { formatDate } = useIntlFormatter()
  const isTablet = mode === 'tablet'

  const headerProps: HeaderTitleProps = {
    title,
    isTablet,
    showDatePicker,
    dateLabel: formatDate(date, DateFormat.MonthYear),
  }

  const closeButtonProps: CloseButtonProps = {
    variant: isTablet ? CloseButtonVariant.BackButton : CloseButtonVariant.OutlinedIconButton,
    onClose,
  }

  return (
    <header
      className={classNames(
        'Layer__ProfitAndLossDetailedChartsHeader',
        `Layer__ProfitAndLossDetailedChartsHeader--${mode}`,
      )}
    >
      {isTablet && showCloseButton && <CloseButton {...closeButtonProps} />}
      <HeaderTitle {...headerProps} />
      {!isTablet && showCloseButton && <CloseButton {...closeButtonProps} />}
    </header>
  )
}
