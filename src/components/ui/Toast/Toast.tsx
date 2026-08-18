import { type ToastData } from '@internal-types/shared/toastData'
import { createLegacyClassNames, type LegacyClassNameMapFor } from '@utils/shared/styles/legacyClassNames'
import { toDataProperties } from '@utils/shared/styles/toDataProperties'

import './toast.scss'

const legacyClassNames = createLegacyClassNames({
  'Layer__UI__Toast': 'Layer__toast',
  'type:default': 'Layer__toast--default',
  'type:success': 'Layer__toast--success',
  'type:error': 'Layer__toast--error',
  'state:entering': 'enter',
  'state:exiting': 'exit',
} satisfies LegacyClassNameMapFor<'Layer__UI__Toast', `type:${string}` | `state:${string}`>)

export type ToastProps = ToastData & {
  isExiting: boolean
  onDismiss?: () => void
}

export const Toast = ({
  id,
  content,
  isExiting,
  type = 'default',
  onDismiss,
}: ToastProps) => {
  return (
    <div
      id={id}
      className={legacyClassNames(
        'Layer__UI__Toast',
        `type:${type}`,
        isExiting ? 'state:exiting' : 'state:entering',
      )}
      {...toDataProperties({ type, entering: !isExiting, exiting: isExiting })}
      onClick={onDismiss}
    >
      <p>{content}</p>
    </div>
  )
}
