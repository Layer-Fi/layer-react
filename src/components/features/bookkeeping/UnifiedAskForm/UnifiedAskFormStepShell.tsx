import { Fragment, type ReactNode } from 'react'

import { VStack } from '@ui/Stack/Stack'
import { P } from '@ui/Typography/Text'

type UnifiedAskFormStepShellProps = {
  prompt?: string | null
  children: ReactNode
}

/** A form step's prompt above its fields. */
export const UnifiedAskFormStepShell = ({ prompt, children }: UnifiedAskFormStepShellProps) => (
  <VStack gap='xs'>
    {prompt
      ? (
        <P size='sm'>
          {prompt.split('\n').map((line, index) => (
            <Fragment key={index}>
              {index > 0 ? <br /> : null}
              {line}
            </Fragment>
          ))}
        </P>
      )
      : null}
    {children}
  </VStack>
)
