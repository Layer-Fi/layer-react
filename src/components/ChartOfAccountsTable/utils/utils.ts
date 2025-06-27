import { centsToDollars, centsToDollarsWithoutCommas } from '../../../models/Money'
import type { AugmentedLedgerAccountBalance, LedgerAccountBalance } from '../../../types/chart_of_accounts'
import { convertCentsToCurrency } from '../../../utils/format'
import { LedgerAccountSubtypeOrderEnum, LedgerAccountTypeOrderEnum } from './types'

const compareByEnum = (
  a: string | undefined,
  b: string | undefined,
  enumMap: Record<string, number>,
): number => {
  const aVal = a !== undefined ? enumMap[a] : undefined
  const bVal = b !== undefined ? enumMap[b] : undefined

  if (aVal !== undefined && bVal !== undefined) return aVal - bVal
  if (aVal === undefined && bVal !== undefined) return 1
  if (aVal !== undefined && bVal === undefined) return -1
  return 0
}

const compareAccounts = (a: LedgerAccountBalance, b: LedgerAccountBalance): number => {
  const typeComparison = compareByEnum(
    a.account_type.value,
    b.account_type.value,
    LedgerAccountTypeOrderEnum as unknown as Record<string, number>,
  )
  if (typeComparison !== 0) return typeComparison

  const subtypeComparison = compareByEnum(
    a.account_subtype?.value,
    b.account_subtype?.value,
    LedgerAccountSubtypeOrderEnum as unknown as Record<string, number>,
  )
  if (subtypeComparison !== 0) return subtypeComparison

  const subtypeNameCompare = (a.account_subtype?.display_name ?? '')
    .localeCompare(b.account_subtype?.display_name ?? '')
  if (subtypeNameCompare !== 0) return subtypeNameCompare

  return a.name.localeCompare(b.name)
}

export const sortAccountsRecursive = (accounts: LedgerAccountBalance[]): LedgerAccountBalance[] => {
  return accounts
    .map(account => ({
      ...account,
      sub_accounts: account.sub_accounts
        ? sortAccountsRecursive(account.sub_accounts)
        : [],
    }))
    .sort(compareAccounts)
}

const accountMatchesQuery = (account: LedgerAccountBalance, query: string) => {
  return [
    account.name,
    account.account_type.display_name,
    account.account_subtype?.display_name || '',
    centsToDollars(account.balance),
    centsToDollarsWithoutCommas(account.balance),
    convertCentsToCurrency(account.balance) || '']
    .some(field => field.toLowerCase().includes(query))
}

export const filterAccounts = (accounts: LedgerAccountBalance[], query: string): AugmentedLedgerAccountBalance[] => {
  return accounts.flatMap((account) => {
    const isMatching = accountMatchesQuery(account, query)
    const matchingChildren = filterAccounts(account.sub_accounts, query)

    if (matchingChildren.length > 0) {
      return [{ ...account, sub_accounts: matchingChildren, isMatching: true }]
    }

    if (isMatching) {
      return [{ ...account, isMatching: true }]
    }

    return []
  })
}

const skippedChars = ['$', ',']
export const getMatchedTextIndices = (
  {
    text,
    query,
    isMatching,
  }: {
    text: string
    query: string
    isMatching?: boolean
  },
): { startIdx: number, endIdx: number } | null => {
  if (!query || !isMatching) return null

  const normalize = (s: string) => s.replace(/[$,]/g, '').toLowerCase()
  const normalizedText = normalize(text)
  const normalizedQuery = normalize(query)
  const normalizedMatchStartIdx = normalizedText.indexOf(normalizedQuery)
  if (normalizedMatchStartIdx === -1) return null

  // Locate the starting index in the original text that corresponds to the beginning of the normalized match
  let positionInNormalizedText = 0, matchStartIdx = 0
  while (positionInNormalizedText < normalizedMatchStartIdx && matchStartIdx < text.length) {
    if (!skippedChars.includes(text[matchStartIdx])) positionInNormalizedText++
    matchStartIdx++
  }

  // Adjust forward to skip a leading '$' or ',' if it wasn't part of the original query
  if (skippedChars.includes(text[matchStartIdx]) && query[0] !== text[matchStartIdx]) {
    matchStartIdx++
  }

  // Advance through the original text to cover all characters that map to the original query
  let charsMatched = 0, matchEndIdx = matchStartIdx
  while (charsMatched < normalizedQuery.length && matchEndIdx < text.length) {
    if (!skippedChars.includes(text[matchEndIdx])) charsMatched++
    matchEndIdx++
  }

  // Optionally include a trailing '$' or ',' if it was explicitly included in the query
  if (skippedChars.includes(text[matchEndIdx]) && query[query.length - 1] === text[matchEndIdx]) {
    matchEndIdx++
  }

  return { startIdx: matchStartIdx, endIdx: matchEndIdx }
}
