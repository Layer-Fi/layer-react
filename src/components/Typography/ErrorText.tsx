import React from 'react'
import { TextProps, Text } from './Text'
import classNames from 'classnames'

export type ErrorTextProps = TextProps

export const ErrorText = ({ className, ...props }: ErrorTextProps) => {
  const baseClassName = classNames('Layer__text--error', className)
  return <Text {...props} className={baseClassName} />
}
