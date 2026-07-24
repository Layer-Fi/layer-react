import classNames from 'classnames'
import { AlertTriangle } from 'lucide-react'

import { DataState, DataStateStatus } from '@ui/DataState/DataState'
import { HStack } from '@ui/Stack/Stack'

import './formErrorBanner.scss'

type FormErrorBannerProps = {
  message: string
  className?: string
}

export const FormErrorBanner = ({ message, className }: FormErrorBannerProps) => {
  return (
    <HStack pis='2xl' className={classNames('Layer__FormErrorBanner', className)}>
      <DataState
        icon={<AlertTriangle size={16} />}
        status={DataStateStatus.failed}
        title={message}
        titleSize='md'
        inline
      />
    </HStack>
  )
}
