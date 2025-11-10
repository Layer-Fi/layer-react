import {
  GridList,
} from 'react-aria-components'
import { ErrorText } from '@components/Typography/ErrorText'
import { MatchFormProps } from '@components/MatchForm/MatchForm'
import { useInAppLinkContext } from '@contexts/InAppLinkContext'
import { convertMatchDetailsToLinkingMetadata, decodeMatchDetails } from '@schemas/bankTransactions/match'
import { MatchFormMobileItem } from './MatchFormMobileItem'
import './matchFormMobile.scss'

export const MatchFormMobile = ({
  bankTransaction,
  selectedMatchId,
  setSelectedMatch,
  matchFormError,
  readOnly,
}: MatchFormProps) => {
  const { renderInAppLink } = useInAppLinkContext()
  const suggestedMatches = bankTransaction.suggested_matches

  return (
    <GridList
      aria-label='Select a match'
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
        const matchDetails = match.details ? decodeMatchDetails(match.details) : undefined
        const inAppLink = renderInAppLink && matchDetails ? renderInAppLink(convertMatchDetailsToLinkingMetadata(matchDetails)) : null

        return (
          <MatchFormMobileItem
            key={match.id}
            match={match}
            bankTransaction={bankTransaction}
            inAppLink={inAppLink}
          />
        )
      })}

      {matchFormError && <ErrorText>{matchFormError}</ErrorText>}

    </GridList>
  )
}
