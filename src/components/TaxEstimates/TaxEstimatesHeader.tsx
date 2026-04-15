import { useSizeClass } from '@hooks/utils/size/useWindowSize'
import { type Spacing } from '@ui/sharedUITypes'
import { HStack, Stack } from '@ui/Stack/Stack'
import { ResponsiveDetailHeader } from '@components/ResponsiveDetailView/ResponsiveDetailHeader'
import { FullYearProjectionComboBox } from '@components/TaxEstimates/FullYearProjectionComboBox/FullYearProjectionComboBox'

import './taxEstimatesHeader.scss'

type TaxEstimatesHeaderProps = {
  title: string
  description: string
}

export const TaxEstimatesHeader = ({ title, description }: TaxEstimatesHeaderProps) => {
  const { isMobile } = useSizeClass()

  const commonProps = {
    gap: 'md' as Spacing,
    justify: 'space-between' as const,
    align: 'start' as const,
    fluid: true,
    className: 'Layer__TaxEstimatesHeader',
    direction: 'row' as const,
  }

  const dynamicProps = isMobile
    ? {
      ...commonProps,
      direction: 'column' as const,
    }
    : commonProps

  return (
    <Stack {...dynamicProps}>
      <ResponsiveDetailHeader title={title} description={description} />
      <HStack justify='end' className='Layer__TaxEstimatesHeader__ComboBoxContainer'>
        <FullYearProjectionComboBox />
      </HStack>
    </Stack>
  )
}
