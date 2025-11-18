import type { PropsWithChildren } from 'react'
import { VStack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'

export type DataPointProps = PropsWithChildren<{
  label: string
}>

export const DataPoint = ({ label, children }: DataPointProps) => {
  return (
    <VStack gap='3xs'>
      <Span variant='subtle' size='xs'>{label}</Span>
      {children}
    </VStack>
  )
}
