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
    const char = text[matchStartIdx]
    if (char !== undefined && !skippedChars.includes(char)) positionInNormalizedText++
    matchStartIdx++
  }

  // Adjust forward to skip a leading '$' or ',' if it wasn't part of the original query
  const startChar = text[matchStartIdx]
  if (startChar !== undefined && skippedChars.includes(startChar) && query[0] !== startChar) {
    matchStartIdx++
  }

  // Advance through the original text to cover all characters that map to the original query
  let charsMatched = 0, matchEndIdx = matchStartIdx
  while (charsMatched < normalizedQuery.length && matchEndIdx < text.length) {
    const char = text[matchEndIdx]
    if (char !== undefined && !skippedChars.includes(char)) charsMatched++
    matchEndIdx++
  }

  // Optionally include a trailing '$' or ',' if it was explicitly included in the query
  const endChar = text[matchEndIdx]
  if (endChar !== undefined && skippedChars.includes(endChar) && query[query.length - 1] === endChar) {
    matchEndIdx++
  }

  return { startIdx: matchStartIdx, endIdx: matchEndIdx }
}
