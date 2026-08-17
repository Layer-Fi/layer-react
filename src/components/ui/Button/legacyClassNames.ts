import { createLegacyClassNames, type LegacyClassNameMapFor } from '@utils/shared/styles/legacyClassNames'
import type { ButtonVariant } from '@ui/Button/Button'

const legacyClassNames = createLegacyClassNames({
  'Layer__UI__Button': 'Layer__btn',
  'variant:solid': 'Layer__btn--primary',
  'variant:branded': 'Layer__btn--primary',
  'variant:outlined': 'Layer__btn--secondary',
  'variant:ghost': 'Layer__btn--tertiary',
  'variant:text': ['Layer__btn--tertiary', 'Layer__text-btn'],
  'state:icon': ['Layer__btn--icon-only', 'Layer__icon-btn'],
  'state:fullWidth': 'Layer__btn--full-width',
  'state:tooltip': 'Layer__btn--with-tooltip',
  'state:disabled': 'Layer__btn--disabled',
  'state:processing': 'Layer__btn--processing',
  'state:asLink': 'Layer__btn--as-link',
  'state:back': 'Layer__back-btn',
} satisfies LegacyClassNameMapFor<'Layer__UI__Button', `variant:${ButtonVariant}` | `state:${string}`>)

/** `BackButton` and `CloseButton` both shipped under this name. */
export const LEGACY_BACK_BUTTON_CLASS_NAME = legacyClassNames('state:back')

type LegacyButtonState = {
  variant: ButtonVariant
  asLink?: boolean
  icon?: boolean
  fullWidth?: boolean
  hasTooltip?: boolean
  isDisabled?: boolean
  isPending?: boolean
}

export function legacyButtonClassNames({
  variant,
  asLink,
  icon,
  fullWidth,
  hasTooltip,
  isDisabled,
  isPending,
}: LegacyButtonState) {
  return legacyClassNames(
    'Layer__UI__Button',
    `variant:${variant}`,
    asLink && 'state:asLink',
    icon && 'state:icon',
    fullWidth && 'state:fullWidth',
    hasTooltip && 'state:tooltip',
    isDisabled && 'state:disabled',
    isPending && 'state:processing',
  )
}
