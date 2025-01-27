import { TextProps, Text } from './Text'

export type ErrorTextProps = TextProps

export const ErrorText = ({ className, ...props }: ErrorTextProps) => (
  <Text {...props} status='error' className={className} />
)
