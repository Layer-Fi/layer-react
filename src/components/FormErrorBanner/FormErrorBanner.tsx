import classNames from 'classnames'
import { AlertTriangle } from 'lucide-react'

import { HStack } from '@ui/Stack/Stack'
import { DataState, DataStateStatus } from '@components/DataState/DataState'
import { TextSize } from '@components/Typography/Text'

import './formErrorBanner.scss'

type FormErrorBannerProps = {
  message?: string
  className?: string
}

export const FormErrorBanner = ({ message, className }: FormErrorBannerProps) => {
  if (!message) {
    return null
  }

  return (
    <HStack className={classNames('Layer__FormErrorBanner', className)}>
      <DataState
        icon={<AlertTriangle size={16} />}
        status={DataStateStatus.failed}
        title={message}
        titleSize={TextSize.md}
        inline
      />
    </HStack>
  )
}
