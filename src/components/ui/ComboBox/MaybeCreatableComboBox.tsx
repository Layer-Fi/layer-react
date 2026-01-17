import { ComboBox } from '@ui/ComboBox/ComboBox'
import { type AllowedCreatableProps, CreatableComboBox } from '@ui/ComboBox/CreatableComboBox'
import type { ComboBoxOption, SingleSelectComboBoxProps } from '@ui/ComboBox/types'

type MaybeCreatableComboBoxProps<T extends ComboBoxOption> = SingleSelectComboBoxProps<T> & (
  | ({ isCreatable: true } & AllowedCreatableProps<T>)
  | ({ isCreatable?: false })
)

export function MaybeCreatableComboBox<T extends ComboBoxOption>(
  props: MaybeCreatableComboBoxProps<T>,
) {
  if (props.isCreatable) {
    return <CreatableComboBox {...props} />
  }

  return <ComboBox {...props} />
}
