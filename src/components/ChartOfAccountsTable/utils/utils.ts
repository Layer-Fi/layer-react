import type { AugmentedLedgerAccountBalance } from '@internal-types/chart_of_accounts'
import { type NestedLedgerAccountType } from '@schemas/generalLedger/ledgerAccount'
import { centsToDollars, centsToDollarsWithoutCommas } from '@models/Money'
import { convertCentsToCurrency } from '@utils/format'

const accountMatchesQuery = (account: NestedLedgerAccountType, query: string) => {
  return [
    account.name,
    account.accountType.displayName,
    account.accountNumber || '',
    account.accountSubtype?.displayName || '',
    centsToDollars(account.balance),
    centsToDollarsWithoutCommas(account.balance),
    convertCentsToCurrency(account.balance) || '']
    .some(field => field.toLowerCase().includes(query))
}

export const filterAccounts = (accounts: NestedLedgerAccountType[], query: string): AugmentedLedgerAccountBalance[] => {
  return accounts.flatMap((account) => {
    const isMatching = accountMatchesQuery(account, query)
    const matchingChildren = filterAccounts(Array.from(account.subAccounts), query)

    if (matchingChildren.length > 0) {
      return [{ ...account, subAccounts: matchingChildren, isMatching: true }]
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
