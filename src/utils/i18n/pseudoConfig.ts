export const isPseudoEnabled = (): boolean => {
  if (typeof window === 'undefined') return false
  const params = new URLSearchParams(window.location.search)
  if (params.get('locale') === 'pseudo') return true
  return false
}

export const pseudoOptions = () => ({
  enabled: true,
  languageToPseudo: 'en-US',
  wrapped: true,
})
