import { TextProps, Text } from '@components/Typography/Text'

export type ErrorTextProps = TextProps

export const ErrorText = ({ className, ...props }: ErrorTextProps) => (
  <Text {...props} status='error' className={className} />
)
