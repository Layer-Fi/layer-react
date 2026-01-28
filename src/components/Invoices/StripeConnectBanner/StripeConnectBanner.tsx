import { StripeAccountStatus } from '@schemas/stripeAccountStatus'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'
import { Banner, type BannerVariant } from '@ui/Banner/Banner'
import { VStack } from '@ui/Stack/Stack'
import { ConnectStripeButton } from '@components/Invoices/StripeConnectBanner/ConnectStripeButton'
import { useStripeConnect } from '@components/Invoices/StripeConnectBanner/useStripeConnect'
import { useStripeAccountStatus } from '@features/invoices/api/useStripeAccountStatus'

import '@components/Invoices/StripeConnectBanner/stripeConnectBanner.scss'

const BANNER_PROP_CONFIG: Partial<Record<StripeAccountStatus, {
  variant: BannerVariant
  title: string
  description: string
}>> = {
  [StripeAccountStatus.Pending]: {
    variant: 'default',
    title: 'Stripe account under review',
    description: 'Once complete, you can start accepting card and bank payments.',
  },
  [StripeAccountStatus.NotCreated]: {
    variant: 'info',
    title: 'Stripe payments not enabled',
    description: 'Set up your Stripe account to start accepting card and bank payments for your invoices.',
  },
  [StripeAccountStatus.Incomplete]: {
    variant: 'warning',
    title: 'Stripe setup incomplete',
    description: 'Finish setting up your Stripe account to start accepting card and bank payments for your invoices.',
  },
}

export const StripeConnectBanner = () => {
  const { accountingConfiguration } = useLayerContext()
  const { data, isLoading, isError } = useStripeAccountStatus()
  const { handleConnectStripe, isMutating, isStripeConnectError } = useStripeConnect()

  if (!accountingConfiguration?.enableStripeOnboarding) {
    return null
  }

  if (isLoading || isError) {
    return null
  }

  const status = data?.accountStatus

  if (!status || status === StripeAccountStatus.Active) {
    return null
  }

  const bannerConfig = BANNER_PROP_CONFIG[status]

  if (!bannerConfig) {
    return null
  }

  const showButton = status === StripeAccountStatus.NotCreated || status === StripeAccountStatus.Incomplete

  return (
    <VStack pi='lg' pbe='md' className='Layer__StripeConnectBanner__wrapper'>
      <Banner
        {...bannerConfig}
        slots={showButton
          ? {
            Button: (
              <ConnectStripeButton
                isError={isStripeConnectError}
                isMutating={isMutating}
                onClick={() => void handleConnectStripe()}
              />
            ),
          }
          : undefined}
      />
    </VStack>
  )
}
