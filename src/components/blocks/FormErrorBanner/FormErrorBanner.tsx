import classNames from 'classnames'
import { AlertTriangle } from 'lucide-react'

import { DataState, type DataStateProps, DataStateStatus } from '@ui/DataState/DataState'
import { HStack } from '@ui/Stack/Stack'

import './formErrorBanner.scss'

type FormErrorBannerProps = {
  message: string
  className?: string
  slotProps?: DataStateProps['slotProps']
}

export const FormErrorBanner = ({ message, className, slotProps }: FormErrorBannerProps) => {
  return (
    <HStack pis='2xl' className={classNames('Layer__FormErrorBanner', className)}>
      <DataState
        icon={<AlertTriangle size={16} />}
        status={DataStateStatus.failed}
        title={message}
        slotProps={{ Title: { size: 'md', ellipsis: true, ...slotProps?.Title } }}
        inline
      />
    </HStack>
  )
}
