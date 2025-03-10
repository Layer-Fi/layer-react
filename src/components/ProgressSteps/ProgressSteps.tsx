import classNames from 'classnames'
import { Text, TextSize } from '../Typography'
import Check from '../../icons/Check'

export type ProgressStepsProps = {
  steps: string[]
  currentStep: number
}

export const ProgressSteps = ({ steps, currentStep }: ProgressStepsProps) => {
  return (
    <div className='Layer__progress-steps'>
      {steps.map((step, index) => {
        const stepClass = classNames(
          'Layer__progress-steps--step',
          {
            'Layer__progress-steps--step-active':
              index <= currentStep,
          },
          {
            'Layer__progress-steps--step-complete':
              currentStep > index,
          },
        )

        const lineClass = classNames(
          'Layer__progress-steps--step-line',
          {
            'Layer__progress-steps--step-line-filled':
              currentStep > index,
          },
        )

        return (
          <div
            key={index}
            className='Layer__progress-steps--step-wrapper'
          >
            <div className={stepClass}>
              <div className='Layer__progress-steps--circle'>
                {index < currentStep && <Check size={10} />}
              </div>
              <div className='Layer__progress-steps--label'>
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
