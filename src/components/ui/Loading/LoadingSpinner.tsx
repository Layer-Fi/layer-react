import { LoaderCircle, type LucideProps } from 'lucide-react'
import './loadingSpinner.scss'

const CLASS_NAME = 'Layer__LoadingSpinner'

export function LoadingSpinner({ size }: Pick<LucideProps, 'size'>) {
  return (
    <LoaderCircle className={CLASS_NAME} size={size} />
  )
}
