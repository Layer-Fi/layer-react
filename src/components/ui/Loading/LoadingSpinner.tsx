import React from 'react'
import { LoaderCircle, type LucideProps } from 'lucide-react'

const CLASS_NAME = 'Layer__LoadingSpinner'

export function LoadingSpinner({ size }: Pick<LucideProps, 'size'>) {
  return (
    <LoaderCircle className={CLASS_NAME} size={size} />
  )
}
