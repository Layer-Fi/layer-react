import { CategoriesListMode, type Classification } from '@schemas/categorization'
import { useSizeClass } from '@hooks/utils/size/useWindowSize'
import { CategoryMobileDrawer } from '@features/categorization/CategorizationRuleForm/CategoryMobileDrawer'
import { LedgerAccountComboBox } from '@features/generalLedger/LedgerAccountComboBox/LedgerAccountComboBox'

type CategorySelectProps = {
  label: string
  value: Classification | null
  onValueChange: (value: Classification | null) => void
  showLabel?: boolean
  placeholder?: string
}

export const CategorySelect = (props: CategorySelectProps) => {
  const { isMobile } = useSizeClass()
  if (isMobile) {
    return <CategoryMobileDrawer {...props} mode={CategoriesListMode.Default} hideExclusions />
  }
  return (
    <LedgerAccountComboBox
      label={props.label}
      value={props.value}
      onValueChange={props.onValueChange}
      mode={CategoriesListMode.Default}
      hideExclusions
      showLabel={props.showLabel}
      placeholder={props.placeholder}
    />
  )
}
