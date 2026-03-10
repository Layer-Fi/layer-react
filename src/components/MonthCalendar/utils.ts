import i18next from 'i18next'
export const MONTHS = [
  i18next.t('january', 'January'),
  i18next.t('february', 'February'),
  i18next.t('march', 'March'),
  i18next.t('april', 'April'),
  i18next.t('may', 'May'),
  i18next.t('june', 'June'),
  i18next.t('july', 'July'),
  i18next.t('august', 'August'),
  i18next.t('september', 'September'),
  i18next.t('october', 'October'),
  i18next.t('november', 'November'),
  i18next.t('december', 'December'),
  'December',
].map((label, i) => ({ key: i + 1, label, abbreviation: label.slice(0, 3) }))
