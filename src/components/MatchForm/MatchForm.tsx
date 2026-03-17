import classNames from 'classnames'
import { format as formatTime, parseISO } from 'date-fns'
import { useTranslation } from 'react-i18next'

import { type BankTransaction, type SuggestedMatch } from '@internal-types/bankTransactions'
import { convertMatchDetailsToLinkingMetadata, decodeMatchDetails } from '@schemas/bankTransactions/match'
import { isTransferMatch } from '@utils/bankTransactions'
import { centsToDollars as formatMoney } from '@utils/money'
import { DATE_FORMAT } from '@utils/time/timeFormats'
import { useBankTransactionsIsCategorizationEnabledContext } from '@contexts/BankTransactionsIsCategorizationEnabledContext/BankTransactionsIsCategorizationEnabledContext'
import { useInAppLinkContext } from '@contexts/InAppLinkContext'
import { MatchBadge } from '@components/BankTransactionRow/MatchBadge'
import { ErrorText } from '@components/Typography/ErrorText'
import { Text, TextUseTooltip } from '@components/Typography/Text'

import './matchForm.scss'

export interface MatchFormProps {
  bankTransaction: BankTransaction
  selectedMatchId?: string
  setSelectedMatch: (val?: SuggestedMatch) => void
  matchFormError?: string
  readOnly?: boolean
}

export const MatchForm = ({
  bankTransaction,
  selectedMatchId,
  setSelectedMatch,
  matchFormError,
  readOnly = false,
}: MatchFormProps) => {
  const { t } = useTranslation()
  const isCategorizationEnabled = useBankTransactionsIsCategorizationEnabledContext()
  const { renderInAppLink } = useInAppLinkContext()

  const {
    suggested_matches: suggestedMatches = [],
    match,
  } = bankTransaction

  const effectiveSuggestedMatches = isCategorizationEnabled
    ? suggestedMatches
    : suggestedMatches.filter(
      ({ details: { id } }) => id === match?.details.id,
    )

  if (!isCategorizationEnabled && effectiveSuggestedMatches.length === 0) {
    return null
  }

  return (
    <div className='Layer__MatchForm__Table'>
      <div className='Layer__MatchForm__Table__header'>
        <div className='Layer__MatchForm__Table__date'>{t('common:label.date', 'Date')}</div>
        <div className='Layer__MatchForm__Table__desc'>
          {t('common:label.description', 'Description')}
        </div>
        <div className='Layer__MatchForm__Table__amount'>{t('common:label.amount', 'Amount')}</div>
        {renderInAppLink && <div className='Layer__MatchForm__Table__link'>{t('common:action.link_label', 'Link')}</div>}
        {match && <div className='Layer__MatchForm__Table__status' />}
      </div>
      {effectiveSuggestedMatches.map((suggestedMatch) => {
        const matchDetails = suggestedMatch.details ? decodeMatchDetails(suggestedMatch.details) : undefined
        const inAppLink = renderInAppLink && matchDetails ? renderInAppLink(convertMatchDetailsToLinkingMetadata(matchDetails)) : null
        return (
          <div
            key={suggestedMatch.id}
            className={classNames(
              'Layer__MatchForm__Row',
              suggestedMatch.id === selectedMatchId
                ? 'Layer__MatchForm__Row--selected'
                : '',
            )}
            onClick={() => {
              if (readOnly === true) {
                return
              }
              setSelectedMatch(suggestedMatch)
            }}
          >
            <div className='Layer__nowrap Layer__MatchForm__Table__date'>
              <span>
                {formatTime(parseISO(suggestedMatch.details.date), DATE_FORMAT)}
              </span>
            </div>
            <div className='Layer__MatchForm__Table__desc'>
              <Text
                className='Layer__MatchForm__Table__desc-tooltip'
                withDeprecatedTooltip={TextUseTooltip.whenTruncated}
                as='span'
              >
                {suggestedMatch.details.description}
              </Text>
            </div>
            <div className='Layer__MatchForm__Table__amount'>
              $
              {formatMoney(suggestedMatch.details.amount)}
            </div>
            {inAppLink && (
              <div className='Layer__MatchForm__Table__link'>
                {inAppLink}
              </div>
            )}
            {
              bankTransaction.match && (
                <div
                  className={classNames(
                    'Layer__MatchForm__Table__status',
                    { 'no-match': !bankTransaction.match },
                  )}
                >
                  {suggestedMatch.details.id === match?.details.id && (
                    <MatchBadge
                      bankTransaction={bankTransaction}
                      dateFormat={DATE_FORMAT}
                      text={isTransferMatch(bankTransaction) ? t('bankTransactions:label.transfer', 'Transfer') : t('bankTransactions:label.matched', 'Matched')}
                    />
                  )}
                </div>
              )
            }
          </div>
        )
      })}
      {matchFormError && <ErrorText>{matchFormError}</ErrorText>}
    </div>
  )
}
