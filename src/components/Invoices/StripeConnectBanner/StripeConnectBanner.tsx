import classNames from 'classnames'
import { AlertTriangle, ExternalLink, Info, RotateCcw } from 'lucide-react'

import { StripeAccountStatus } from '@schemas/stripeAccountStatus'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'
import { Button } from '@ui/Button/Button'
import { Text, TextSize } from '@components/Typography/Text'
import { useStripeAccountStatus } from '@features/invoices/api/useStripeAccountStatus'
import { useStripeConnectAccountLink } from '@features/invoices/api/useStripeConnectAccountLink'

import './stripeConnectBanner.scss'

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
        <div className={classNames('Layer__StripeConnectBanner', 'Layer__StripeConnectBanner--pending')}>
          <Info size={20} className='Layer__StripeConnectBanner__icon' />
          <div className='Layer__StripeConnectBanner__content'>
            <Text size={TextSize.lg} className='Layer__StripeConnectBanner__description'>
              Stripe is reviewing your account submission - once complete, you can start accepting card and bank payments.
            </Text>
          </div>
        </div>
      </div>
    )
  }

  if (status === StripeAccountStatus.NotCreated) {
    return (
      <div className='Layer__StripeConnectBanner__wrapper'>
        <div className='Layer__StripeConnectBanner'>
          <Info size={20} className='Layer__StripeConnectBanner__icon' />
          <div className='Layer__StripeConnectBanner__content'>
            <Text size={TextSize.lg} className='Layer__StripeConnectBanner__description'>
              Stripe payments not enabled - set up your Stripe account to start accepting card and bank payments for your invoices.
            </Text>
          </div>
          <Button
            variant='solid'
            onPress={() => void handleConnectStripe()}
            isDisabled={isMutating}
            isPending={isMutating}
          >
            {isConnectError ? 'Retry' : 'Connect Stripe'}
            {isConnectError ? <RotateCcw size={16} /> : <ExternalLink size={16} />}
          </Button>
        </div>
      </div>
    )
  }

  if (status === StripeAccountStatus.Incomplete) {
    return (
      <div className='Layer__StripeConnectBanner__wrapper'>
        <div className={classNames('Layer__StripeConnectBanner', 'Layer__StripeConnectBanner--incomplete')}>
          <AlertTriangle size={20} className='Layer__StripeConnectBanner__icon' />
          <div className='Layer__StripeConnectBanner__content'>
            <Text size={TextSize.lg} className='Layer__StripeConnectBanner__description'>
              Stripe setup incomplete - finish setting up your Stripe account to start accepting card and bank payments for your invoices.
            </Text>
          </div>
          <Button
            variant='solid'
            onPress={() => void handleConnectStripe()}
            isDisabled={isMutating}
            isPending={isMutating}
          >
            {isConnectError ? 'Retry' : 'Connect Stripe'}
            {isConnectError ? <RotateCcw size={16} /> : <ExternalLink size={16} />}
          </Button>
        </div>
      </div>
    )
  }

  return null
}
