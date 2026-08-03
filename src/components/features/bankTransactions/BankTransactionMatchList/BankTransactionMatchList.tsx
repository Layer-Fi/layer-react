import { GridList } from 'react-aria-components/GridList'
import { useTranslation } from 'react-i18next'

import { type BankTransaction, type SuggestedMatch } from '@internal-types/bankTransactions'
import { convertMatchDetailsToLinkingMetadata } from '@schemas/bankTransactions/match'
import { useInAppLinkContext } from '@contexts/InAppLinkContext'
import { ErrorText } from '@ui/Typography/ErrorText'
import { BankTransactionMatchListItem } from '@features/bankTransactions/BankTransactionMatchList/BankTransactionMatchListItem'

import './bankTransactionMatchList.scss'

export interface BankTransactionMatchListProps {
  bankTransaction: BankTransaction
  selectedMatchId?: string
  setSelectedMatch: (val?: SuggestedMatch) => void
  matchFormError?: string
  readOnly?: boolean
}

export const BankTransactionMatchList = ({
  bankTransaction,
  selectedMatchId,
  setSelectedMatch,
  matchFormError,
  readOnly,
}: BankTransactionMatchListProps) => {
  const { t } = useTranslation()
  const { renderInAppLink } = useInAppLinkContext()
  const suggestedMatches = bankTransaction.suggestedMatches

  return (
    <GridList
      aria-label={t('bankTransactions:action.select_a_match', 'Select a match')}
      selectionMode='single'
      selectedKeys={selectedMatchId ? new Set([selectedMatchId]) : new Set()}
      onSelectionChange={(keys) => {
        if (readOnly) return

        const selectedKey = [...keys][0]
        const selectedMatch = suggestedMatches?.find(m => m.id === selectedKey)
        if (selectedMatch) {
          setSelectedMatch(selectedMatch)
        }
      }}
      className='Layer__MatchFormMobile'
    >
      {suggestedMatches?.map((match) => {
        const matchDetails = match.details
        const inAppLink = renderInAppLink && matchDetails
          ? renderInAppLink(convertMatchDetailsToLinkingMetadata(matchDetails))
          : null

        return (
          <BankTransactionMatchListItem
            key={match.id}
            match={match}
            bankTransaction={bankTransaction}
            inAppLink={inAppLink}
          />
        )
      })}
      {matchFormError && <ErrorText size='sm' align='center' pb='sm'>{matchFormError}</ErrorText>}
    </GridList>
  )
}
