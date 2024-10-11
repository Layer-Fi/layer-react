import React from 'react'
import { Text } from '../Typography'
import { TextProps } from '../Typography/Text'
import classNames from 'classnames'

export type StaticValueProps = TextProps

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
