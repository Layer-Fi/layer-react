export type PickableValues = {
  choice: string | null
  selection: { value: string, isCreated?: boolean } | null
}

/** The option or search result picked; typed-in search text is not a pick. Selection comes first, as a choice answer posts it. */
export const getPickedValue = ({ choice, selection }: PickableValues) => {
  if (selection) return selection.isCreated ? null : selection.value
  return choice
}
