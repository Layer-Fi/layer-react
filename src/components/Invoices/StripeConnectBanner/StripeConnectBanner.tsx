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
      title: t('invoices:stripeAccountUnderReview', 'Stripe account under review'),
      description: t('invoices:onceCompleteYouCanStartAcceptingCardAndBankPayments', 'Once complete, you can start accepting card and bank payments.'),
    },
    [StripeAccountStatus.NotCreated]: {
      variant: 'info',
      title: t('invoices:stripePaymentsNotEnabled', 'Stripe payments not enabled'),
      description: t('invoices:setUpYourStripeAccountToStartAcceptingCardAndBankPaymentsForYourInvoices', 'Set up your Stripe account to start accepting card and bank payments for your invoices.'),
    },
    [StripeAccountStatus.Incomplete]: {
      variant: 'warning',
      title: t('invoices:stripeSetupIncomplete', 'Stripe setup incomplete'),
      description: t('invoices:finishSettingUpYourStripeAccountToStartAcceptingCardAndBankPaymentsForYourInvoices', 'Finish setting up your Stripe account to start accepting card and bank payments for your invoices.'),
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
