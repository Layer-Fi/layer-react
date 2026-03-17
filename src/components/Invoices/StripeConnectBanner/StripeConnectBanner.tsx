import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { StripeAccountStatus } from '@schemas/stripeAccountStatus'
import { useStripeAccountStatus } from '@hooks/api/businesses/[business-id]/stripe/status/useStripeAccountStatus'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'
import { Banner, type BannerVariant } from '@ui/Banner/Banner'
import { VStack } from '@ui/Stack/Stack'
import { ConnectStripeButton } from '@components/Invoices/StripeConnectBanner/ConnectStripeButton'
import { useStripeConnect } from '@components/Invoices/StripeConnectBanner/useStripeConnect'

import '@components/Invoices/StripeConnectBanner/stripeConnectBanner.scss'

export const StripeConnectBanner = () => {
  const { t } = useTranslation()
  const { accountingConfiguration } = useLayerContext()
  const { data, isLoading, isError } = useStripeAccountStatus()
  const { handleConnectStripe, isMutating, isStripeConnectError } = useStripeConnect()

  const bannerPropConfig = useMemo<Partial<Record<StripeAccountStatus, {
    variant: BannerVariant
    title: string
    description: string
  }>>>(() => ({
    [StripeAccountStatus.Pending]: {
      variant: 'default',
      title: t('stripe:state.stripe_account_review', 'Stripe account under review'),
      description: t('stripe:label.once_complete_can_accept_payments', 'Once complete, you can start accepting card and bank payments.'),
    },
    [StripeAccountStatus.NotCreated]: {
      variant: 'info',
      title: t('stripe:state.stripe_payment_not_enabled', 'Stripe payments not enabled'),
      description: t('stripe:label.set_up_stripe_account', 'Set up your Stripe account to start accepting card and bank payments for your invoices.'),
    },
    [StripeAccountStatus.Incomplete]: {
      variant: 'warning',
      title: t('stripe:state.stripe_setup_incomplete', 'Stripe setup incomplete'),
      description: t('stripe:label.finish_setting_up_stripe_account', 'Finish setting up your Stripe account to start accepting card and bank payments for your invoices.'),
    },
  }), [t])

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

  const bannerConfig = bannerPropConfig[status]

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
