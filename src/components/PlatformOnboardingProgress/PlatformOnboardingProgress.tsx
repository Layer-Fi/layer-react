import React from 'react'
import Check from '../../icons/Check'
import { Text, TextSize } from '../Typography'
import classNames from 'classnames'

interface PlatformOnboardingProgressProps {
  currentStep: number
  steps: string[]
}

export const PlatformOnboardingProgress = ({
  currentStep,
  steps,
}: PlatformOnboardingProgressProps) => {
  return (
    <div className='Layer__platform__onboarding__progress'>
      {steps.map((step, index) => {
        const stepClass = classNames(
          'Layer__platform__onboarding__progress--step',
          {
            'Layer__platform__onboarding__progress--step-active':
              index <= currentStep,
          },
          {
            'Layer__platform__onboarding__progress--step-complete':
              currentStep > index,
          },
        )

        const lineClass = classNames(
          'Layer__platform__onboarding__progress--step-line',
          {
            'Layer__platform__onboarding__progress--step-line-filled':
              currentStep > index,
          },
        )

        return (
          <div
            key={index}
            className='Layer__platform__onboarding__progress--step-wrapper'
          >
            <div className={stepClass}>
              <div className='Layer__platform__onboarding__progress--circle'>
                {index < currentStep && <Check size={10} />}
              </div>
              <div className='Layer__platform__onboarding__progress--label'>
                <Text size={TextSize.sm}>{step}</Text>
              </div>
            </div>
            {index < steps.length - 1 && <div className={lineClass} />}
          </div>
        )
      })}
    </div>
  )
}
