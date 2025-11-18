import classNames from 'classnames'

import { Text, type TextProps } from '@components/Typography/Text'

export type StaticValueProps = TextProps

/**
 * Use in places where you want to show a static value instead of (disabled) input.
 * Usually it can be used on a summary view after submitting the form,
 * where showing disable input doesn't look right.
 */
export const StaticValue = (props: StaticValueProps) => {
  return (
    <Text
      className={classNames(
        'Layer__input--static-value',
        props.className ?? '',
      )}
      {...props}
    />
  )
}
