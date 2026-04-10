import { useCallback, useMemo } from 'react'
import { getYear } from 'date-fns'
import { Menu as MenuIcon, UserRoundPen } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { convertDateToZonedDateTime } from '@utils/time/timeUtils'
import { useBusinessActivationDate } from '@hooks/features/business/useBusinessActivationDate'
import { TaxEstimatesRoute, useTaxEstimatesNavigation, useTaxEstimatesYear } from '@providers/TaxEstimatesRouteStore/TaxEstimatesRouteStoreProvider'
import { Button } from '@ui/Button/Button'
import { DropdownMenu, MenuItem, MenuList } from '@ui/DropdownMenu/DropdownMenu'
import { HStack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'
import { YearPicker } from '@components/YearPicker/YearPicker'

const TAX_ESTIMATES_MIN_YEAR = 2024

export const TaxEstimatesViewHeader = () => {
  const { t } = useTranslation()
  const navigate = useTaxEstimatesNavigation()
  const { year, setYear } = useTaxEstimatesYear()
  const activationDate = useBusinessActivationDate()

  const minDateZdt = useMemo(() => {
    const activationYear = activationDate ? getYear(activationDate) : TAX_ESTIMATES_MIN_YEAR
    const effectiveMinYear = Math.max(activationYear, TAX_ESTIMATES_MIN_YEAR)
    return convertDateToZonedDateTime(new Date(effectiveMinYear, 0, 1))
  }, [activationDate])

  const maxDateZdt = useMemo(() => convertDateToZonedDateTime(new Date()), [])

  const Trigger = useCallback(() => {
    return (
      <Button icon variant='outlined'>
        <MenuIcon size={14} />
      </Button>
    )
  }, [])

  return (
    <HStack gap='xs'>
      <YearPicker
        year={year}
        onChange={setYear}
        minDate={minDateZdt}
        maxDate={maxDateZdt}
      />
      <DropdownMenu
        ariaLabel={t('taxEstimates:label.additional_actions', 'Additional actions')}
        slots={{ Trigger }}
        slotProps={{ Dialog: { width: 160 } }}
      >
        <MenuList>
          <MenuItem key={TaxEstimatesRoute.Profile} onClick={() => navigate(TaxEstimatesRoute.Profile)}>
            <UserRoundPen size={20} strokeWidth={1.25} />
            <Span size='sm'>{t('taxEstimates:action.update_tax_profile', 'Update tax profile')}</Span>
          </MenuItem>
        </MenuList>
      </DropdownMenu>
    </HStack>
  )
}
