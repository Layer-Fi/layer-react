import { MONTH_DAY_FORMAT } from '../../config/general'
import CheckIcon from '../../icons/Check'
import { centsToDollars as formatMoney } from '../../models/Money'
import { Text, ErrorText, TextSize } from '../Typography'
import { MatchFormProps } from './MatchForm'
import classNames from 'classnames'
import { parseISO, format as formatTime } from 'date-fns'
import { useMatchDetailsLinkContext } from '../../contexts/MatchDetailsContext'
import { HStack } from '../ui/Stack/Stack'

export const MatchFormMobile = ({
  classNamePrefix,
  bankTransaction,
  selectedMatchId,
  setSelectedMatchId,
  matchFormError,
  readOnly,
}: MatchFormProps) => {
  const { convertToInAppLink } = useMatchDetailsLinkContext()
  return (
    <div className={`${classNamePrefix}__match-list`}>
      {bankTransaction.suggested_matches?.map((match, idx) => {
        const inAppLink = convertToInAppLink ? convertToInAppLink(match.details) : null
        return (
          <div
            key={idx}
            className={classNames(
              `${classNamePrefix}__match-item`,
              match.id === selectedMatchId
                ? `${classNamePrefix}__match-item--selected`
                : '',
            )}
            onClick={() => {
              if (readOnly) {
                return
              }

              if (selectedMatchId === match.id) {
                setSelectedMatchId(undefined)
                return
              }
              setSelectedMatchId(match.id)
            }}
          >
            <div className={`${classNamePrefix}__match-item__col-details`}>
              <div className={`${classNamePrefix}__match-item__heading`}>
                <Text
                  className={`${classNamePrefix}__match-item__name`}
                  as='span'
                >
                  {match.details.description}
                </Text>
                <Text
                  className={`${classNamePrefix}__match-item__amount`}
                  as='span'
                >
                  $
                  {formatMoney(match.details.amount)}
                </Text>
              </div>
              <div className={`${classNamePrefix}__match-item__details`}>
                <HStack>
                  {inAppLink}
                </HStack>
                <Text
                  className={`${classNamePrefix}__match-item__date`}
                  size={TextSize.sm}
                  as='span'
                >
                  {formatTime(parseISO(match.details.date), MONTH_DAY_FORMAT)}
                </Text>
              </div>
            </div>

            <div className={`${classNamePrefix}__match-item__col-status`}>
              {selectedMatchId && selectedMatchId === match.id
                ? (
                  <CheckIcon
                    size={16}
                    className={`${classNamePrefix}__match-item__selected-icon`}
                  />
                )
                : null}
            </div>
          </div>
        )
      })}
      {matchFormError && <ErrorText>{matchFormError}</ErrorText>}
    </div>
  )
}
