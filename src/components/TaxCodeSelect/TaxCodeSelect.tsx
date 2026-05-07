import { TaxCodeComboBox } from '@components/TaxCodeSelect/TaxCodeComboBox'
import { TaxCodeMobileDrawer } from '@components/TaxCodeSelect/TaxCodeMobileDrawer'
import { type TaxCodeSelectCommonProps } from '@components/TaxCodeSelect/types'

type TaxCodeSelectProps = TaxCodeSelectCommonProps & {
  isMobile?: boolean
  inputId?: string
}

export const TaxCodeSelect = ({
  isMobile = false,
  inputId,
  className,
  options,
  selectedValue,
  onSelectedValueChange,
  isDisabled = false,
}: TaxCodeSelectProps) => {
  const sharedProps = {
    className,
    options,
    selectedValue,
    onSelectedValueChange,
    isDisabled,
  }

  if (isMobile) {
    return <TaxCodeMobileDrawer {...sharedProps} />
  }

  return <TaxCodeComboBox inputId={inputId} {...sharedProps} />
}
