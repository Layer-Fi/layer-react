import { FileText } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { useSizeClass } from '@hooks/utils/size/useWindowSize'
import { Banner } from '@ui/Banner/Banner'
import { Button } from '@ui/Button/Button'
import { HStack } from '@ui/Stack/Stack'

import './taxBanner.scss'

export type TaxBannerProps = {
  onPressReviewButton: () => void
}

export const TaxBanner = ({ onPressReviewButton }: TaxBannerProps) => {
  const { isMobile } = useSizeClass()
  const { t } = useTranslation()

  const title = t('taxEstimates:label.tax_banner_title', 'Tax banner title')
  const description = t('taxEstimates:label.tax_banner_description', 'Tax banner description')
  const icon = <FileText size={16} />

  return (
    <HStack className='Layer__TaxBanner'>
      <Banner
        variant='dark'
        title={title}
        description={description}
        slots={{
          Icon: isMobile ? null : icon,
          Button: onPressReviewButton
            ? (
              <Button
                variant='solid'
                onPress={onPressReviewButton}
              >
                {t('taxEstimates:label.tax_banner_review_button', 'Review')}
              </Button>
            )
            : undefined,
        }}
      />
    </HStack>
  )
}
