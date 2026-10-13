export const notEmpty = (value?: string | null): value is string => {
  if (!value) {
    return false
  }

  return value.trim().length > 0
}
