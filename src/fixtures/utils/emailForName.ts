const slugify = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // strip diacritics, e.g. "ö" -> "o"
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '.')
    .replace(/^\.+|\.+$/g, '')

// Derives a plausible email from an entity's own name/company, instead of
// sampling one independently, so a fixture's email actually matches its name.
export const emailForName = (individualName: string | null, companyName: string | null) => {
  const local = individualName != null ? slugify(individualName) : 'contact'
  const domain = companyName != null ? `${slugify(companyName).replace(/\./g, '')}.test` : 'example.com'

  return `${local}@${domain}`
}
