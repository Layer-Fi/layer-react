import { type ComponentPropsWithoutRef, forwardRef } from 'react'
import { useTranslation } from 'react-i18next'

import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { Span, type TextStyleProps } from '@ui/Typography/Text'

type DurationSpanProps = {
  durationMinutes: number
  zeroValueDisplay?: 'lessThanOneMinute' | 'zeroMinutes'
} & TextStyleProps & Pick<ComponentPropsWithoutRef<'span'>, 'slot'>

const DurationSpan = forwardRef<HTMLSpanElement, DurationSpanProps>(
  ({ durationMinutes, className, zeroValueDisplay = 'lessThanOneMinute', ...restProps }, ref) => {
    const { t } = useTranslation()
    const { formatMinutesAsDuration } = useIntlFormatter()
    const formattedDuration = durationMinutes !== 0
      ? formatMinutesAsDuration(durationMinutes)
      : zeroValueDisplay === 'zeroMinutes'
        ? t('timeTracking:label.zero_minutes', '0 min')
        : t('timeTracking:label.less_than_one_minute', '< 1 min')

    return (
      <Span {...restProps} className={className} ref={ref}>
        {formattedDuration}
      </Span>
    )
  },
)
DurationSpan.displayName = 'DurationSpan'

export { DurationSpan }
