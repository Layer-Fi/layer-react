import { StripeAccountStatus } from '@schemas/stripeAccountStatus'
import { Banner } from '@ui/Banner/Banner'
import { VStack } from '@ui/Stack/Stack'
import { ConnectStripeButton } from '@components/Invoices/StripeConnectBanner/ConnectStripeButton'
import { useStripeConnect } from '@components/Invoices/StripeConnectBanner/useStripeConnect'
import { useStripeAccountStatus } from '@features/invoices/api/useStripeAccountStatus'

import '@components/Invoices/StripeConnectBanner/stripeConnectBanner.scss'

function getBannerProps(
  status: StripeAccountStatus | undefined,
  isStripeConnectError: boolean,
  isMutating: boolean,
  handleConnectStripe: () => Promise<void>,
) {
  switch (status) {
    case StripeAccountStatus.Pending:
      return {
        variant: 'default' as const,
        title: 'Stripe account under review',
        description: 'Once complete, you can start accepting card and bank payments.',
      }
    case StripeAccountStatus.NotCreated:
      return {
        variant: 'info' as const,
        title: 'Stripe payments not enabled',
        description: 'Set up your Stripe account to start accepting card and bank payments for your invoices.',
        slots: {
          Button: (
            <ConnectStripeButton
              isError={isStripeConnectError}
              isMutating={isMutating}
              onClick={() => void handleConnectStripe()}
            />
          ),
        },
      }
    case StripeAccountStatus.Incomplete:
      return {
        variant: 'warning' as const,
        title: 'Stripe setup incomplete',
        description: 'Finish setting up your Stripe account to start accepting card and bank payments for your invoices.',
        slots: {
          Button: (
            <ConnectStripeButton
              isError={isStripeConnectError}
              isMutating={isMutating}
              onClick={() => void handleConnectStripe()}
            />
          ),
        },
      }
    default:
      return null
  }
}

export const StripeConnectBanner = () => {
  const { data, isLoading, isError } = useStripeAccountStatus()
  const { handleConnectStripe, isMutating, isStripeConnectError } = useStripeConnect()

  if (isLoading || isError) {
    return null
  }

  const status = data?.accountStatus

  if (status === StripeAccountStatus.Active) {
    return null
  }

  const bannerProps = getBannerProps(status, isStripeConnectError, isMutating, handleConnectStripe)

  if (!bannerProps) {
    return null
  }

  return (
    <VStack pi='lg' pbe='md' className='Layer__StripeConnectBanner__wrapper'>
      <Banner {...bannerProps} />
    </VStack>
  )
}
