import { Text, TextSize } from '../Typography'
import Check from '../../icons/Check'
import { toDataProperties } from '../../utils/styleUtils/toDataProperties'

export type ProgressStepsProps = {
  steps: string[]
  currentStep: number
}

export const ProgressSteps = ({ steps, currentStep }: ProgressStepsProps) => {
  return (
    <div className='Layer__progress-steps'>
      {steps.map((step, index) => {
        const dataProperties = toDataProperties({ active: index <= currentStep, complete: currentStep > index })

        return (
          <div
            key={index}
            className='Layer__progress-steps--step-wrapper'
          >
            <div className='Layer__progress-steps--step' {...dataProperties}>
              {index < steps.length - 1 && <div className='Layer__progress-steps--step-line' />}
              <div className='Layer__progress-steps--circle'>
                {index < currentStep && <Check size={10} />}
              </div>
              <div className='Layer__progress-steps--label'>
                <Text size={TextSize.sm}>{step}</Text>
              </div>
            </div>
          </div>
        )
      })}
    </div>

  )
}
