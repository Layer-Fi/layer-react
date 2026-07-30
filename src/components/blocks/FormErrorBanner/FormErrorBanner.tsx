import classNames from 'classnames'
import { AlertTriangle } from 'lucide-react'

import { DataState, type DataStateProps, DataStateStatus } from '@ui/DataState/DataState'
import { HStack } from '@ui/Stack/Stack'

import './formErrorBanner.scss'

type FormErrorBannerProps = {
  message: string
  className?: string
  slotProps?: {
    Title?: {
      size?: DataStateProps['titleSize']
      ellipsis?: boolean
    }
  }
}

export const FormErrorBanner = ({ message, className, slotProps }: FormErrorBannerProps) => {
  const { size = 'md', ellipsis = true } = slotProps?.Title ?? {}

  return (
    <HStack pis='2xl' className={classNames('Layer__FormErrorBanner', className)}>
      <DataState
        icon={<AlertTriangle size={16} />}
        status={DataStateStatus.failed}
        title={message}
        titleSize={size}
        titleEllipsis={ellipsis}
        inline
      />
    </HStack>
  )
}
