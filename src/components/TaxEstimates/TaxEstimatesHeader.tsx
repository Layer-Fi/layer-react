import { HStack } from '@ui/Stack/Stack'
import { ResponsiveDetailHeader } from '@components/ResponsiveDetailView/ResponsiveDetailHeader'
import { FullYearProjectionComboBox } from '@components/TaxEstimates/FullYearProjectionComboBox/FullYearProjectionComboBox'

import './taxEstimatesHeader.scss'

type TaxEstimatesHeaderProps = {
  title: string
  description: string
  isMobile: boolean
}

export const TaxEstimatesHeader = ({ title, description, isMobile }: TaxEstimatesHeaderProps) => (
  <HStack gap='md' justify='space-between' align='center' fluid pie={isMobile ? undefined : 'lg'} className='Layer__TaxEstimatesHeader'>
    <ResponsiveDetailHeader title={title} description={description} />
    <HStack justify='end' className='Layer__TaxEstimatesHeader__ComboBoxContainer'>
      <FullYearProjectionComboBox />
    </HStack>
  </HStack>
)
