import classNames from 'classnames'
import { FileText } from 'lucide-react'
import type { ReactNode } from 'react'

import { Button } from '@ui/Button/Button'
import { HStack, VStack } from '@ui/Stack/Stack'
import { Heading } from '@ui/Typography/Heading'
import { Span } from '@ui/Typography/Text'

import './taxBanner.scss'

export const TaxBannerReviewTypes = {
  UncategorizedTransactions: 'UNCATEGORIZED_TRANSACTIONS',
} as const

export type UncategorizedTransactionsTaxBannerReviewPayload = {
  type: typeof TaxBannerReviewTypes.UncategorizedTransactions
  count: number
  amount: number
}

export type TaxBannerReviewPayload = UncategorizedTransactionsTaxBannerReviewPayload

type TaxBannerAction = {
  label: ReactNode
  onPress: (payload: TaxBannerReviewPayload) => void
  payload: TaxBannerReviewPayload
  isDisabled?: boolean
  isPending?: boolean
}

export type TaxBannerProps = {
  title: ReactNode
  description?: ReactNode
  action?: TaxBannerAction
  icon?: ReactNode
  className?: string
}

export const TaxBanner = ({
  title,
  description,
  action,
  icon = <FileText size={16} />,
  className,
}: TaxBannerProps) => {
  return (
    <HStack
      gap='md'
      align='center'
      justify='space-between'
      className={classNames('Layer__TaxBanner', className)}
    >
      <HStack gap='md' align='center' className='Layer__TaxBanner__Body'>
        <HStack align='center' justify='center' className='Layer__TaxBanner__Icon'>
          {icon}
        </HStack>
        <VStack gap='4xs' className='Layer__TaxBanner__Content'>
          <Heading level={3} size='sm' className='Layer__TaxBanner__Title'>
            {title}
          </Heading>
          {description && (
            <Span size='sm' variant='white' className='Layer__TaxBanner__Description'>
              {description}
            </Span>
          )}
        </VStack>
      </HStack>
      {action && (
        <Button
          variant='solid'
          onPress={() => action.onPress(action.payload)}
          isDisabled={action.isDisabled}
          isPending={action.isPending}
        >
          {action.label}
        </Button>
      )}
    </HStack>
  )
}
