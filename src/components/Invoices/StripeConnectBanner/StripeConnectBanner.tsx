import { AlertTriangle, ExternalLink, Info, RotateCcw } from 'lucide-react'

import { StripeAccountStatus } from '@schemas/stripeAccountStatus'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'
import { Banner } from '@ui/Banner/Banner'
import { Button } from '@ui/Button/Button'
import { useStripeAccountStatus } from '@features/invoices/api/useStripeAccountStatus'
import { useStripeConnectAccountLink } from '@features/invoices/api/useStripeConnectAccountLink'

import './stripeConnectBanner.scss'

const ConnectStripeButton = ({
  isError,
  isMutating,
  onPress,
}: {
  isError: boolean
  isMutating: boolean
  onPress: () => void
}) => (
  <Button
    variant='solid'
    onPress={onPress}
    isDisabled={isMutating}
    isPending={isMutating}
  >
    {isError ? 'Retry' : 'Connect Stripe'}
    {isError ? <RotateCcw size={16} /> : <ExternalLink size={16} />}
  </Button>
)

export const StripeConnectBanner = () => {
  const { addToast } = useLayerContext()
  const { data, isLoading, isError } = useStripeAccountStatus()
  const { trigger, isMutating, isError: isConnectError } = useStripeConnectAccountLink()

  const handleConnectStripe = async () => {
    try {
      const result = await trigger()
      if (result?.connectAccountUrl) {
        window.location.assign(result.connectAccountUrl)
      }
      else {
        addToast({ content: 'Stripe has sent a misconfigured connect account onboarding link. Please try again.', type: 'error' })
      }
    }
    catch {
      addToast({ content: 'Unable to connect to Stripe. Please try again.', type: 'error' })
    }
  }

  if (isLoading || isError) {
    return null
  }

  const status = data?.accountStatus

  if (status === StripeAccountStatus.Active) {
    return null
  }

  if (status === StripeAccountStatus.Pending) {
    return (
      <div className='Layer__StripeConnectBanner__wrapper'>
        <Banner
          variant='default'
          icon={<Info size={20} />}
          title='Stripe account under review'
          description='Once complete, you can start accepting card and bank payments.'
        />
      </div>
    )
  }

  if (status === StripeAccountStatus.NotCreated) {
    return (
      <div className='Layer__StripeConnectBanner__wrapper'>
        <Banner
          variant='info'
          icon={<Info size={20} />}
          title='Stripe payments not enabled'
          description='Set up your Stripe account to start accepting card and bank payments for your invoices.'
          action={(
            <ConnectStripeButton
              isError={isConnectError}
              isMutating={isMutating}
              onPress={() => void handleConnectStripe()}
            />
          )}
        />
      </div>
    )
  }

  if (status === StripeAccountStatus.Incomplete) {
    return (
      <div className='Layer__StripeConnectBanner__wrapper'>
        <Banner
          variant='warning'
          icon={<AlertTriangle size={20} />}
          title='Stripe setup incomplete'
          description='Finish setting up your Stripe account to start accepting card and bank payments for your invoices.'
          action={(
            <ConnectStripeButton
              isError={isConnectError}
              isMutating={isMutating}
              onPress={() => void handleConnectStripe()}
            />
          )}
        />
      </div>
    )
  }

  return null
}
