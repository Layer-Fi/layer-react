export const notEmpty = (value?: string | null) => {
  if (!value) {
    return false
  }

  return value.trim().length > 0
}

export const validateEmailFormat = (email?: string, required = false) => {
  if (!email) {
    return !required
  }

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}
