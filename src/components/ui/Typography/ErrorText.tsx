import { type PropsWithChildren } from 'react'

import { P, type TextStyleProps } from '@ui/Typography/Text'

export type ErrorTextProps = PropsWithChildren<Omit<TextStyleProps, 'className' | 'status'>>

export const ErrorText = (props: ErrorTextProps) => <P {...props} status='error' />
