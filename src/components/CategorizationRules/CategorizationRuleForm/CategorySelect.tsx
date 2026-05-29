import { CategoriesListMode, type Classification } from '@schemas/categorization'
import { useSizeClass } from '@hooks/utils/size/useWindowSize'
import { CategoryMobileDrawer } from '@components/CategorizationRules/CategorizationRuleForm/CategoryMobileDrawer'
import { LedgerAccountCombobox } from '@components/LedgerAccountCombobox/LedgerAccountCombobox'

type CategorySelectProps = {
  label: string
  value: Classification | null
  onValueChange: (value: Classification | null) => void
  showLabel?: boolean
}

export const CategorySelect = (props: CategorySelectProps) => {
  const { isMobile } = useSizeClass()
  if (isMobile) {
    return <CategoryMobileDrawer {...props} />
  }
  return (
    <LedgerAccountCombobox
      label={props.label}
      value={props.value}
      onValueChange={props.onValueChange}
      mode={CategoriesListMode.All}
      showLabel={props.showLabel}
    />
  )
}
