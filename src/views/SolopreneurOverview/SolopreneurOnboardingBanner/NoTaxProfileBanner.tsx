import { Info } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { useSizeClass } from '@hooks/utils/size/useWindowSize'
import { Banner } from '@ui/Banner/Banner'
import { Button as LayerButton } from '@ui/Button/Button'

type NoTaxProfileBannerProps = {
  onSetupTaxProfile?: () => void
}

export const NoTaxProfileBanner = ({ onSetupTaxProfile }: NoTaxProfileBannerProps) => {
  const { isMobile } = useSizeClass()
  const { t } = useTranslation()
  const Icon = isMobile ? null : <Info size={16} />
  const title = t('views:SolopreneurOnboardingBanner.NoTaxProfileBanner.label.set_up_your_tax_profile', 'Set up your tax profile')
  const description = t('views:SolopreneurOnboardingBanner.NoTaxProfileBanner.label.set_up_your_tax_profile_description', 'Configuring your tax profile allows us to provide you with tax estimates and avoid any surprises come tax time.')
  const Button = onSetupTaxProfile ? <LayerButton onPress={onSetupTaxProfile} variant='outlined'>{title}</LayerButton> : null
  return <Banner title={title} description={description} slots={{ Icon, Button }} />
}
