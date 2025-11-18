import { Text, TextSize, TextWeight } from '@components/Typography/Text'
import { ReactNode } from 'react'
import { VStack } from '@ui/Stack/Stack'

type FormSectionProps = {
  title?: string
  children: ReactNode | ReactNode[]
}

export const FormSection = ({ children, title }: FormSectionProps) => {
  return (
    <VStack className='Layer__form-section' gap='sm'>
      {title && (
        <Text
          className='Layer__form-section__title'
          size={TextSize.sm}
          weight={TextWeight.bold}
        >
          {title}
        </Text>
      )}
      {children}
    </VStack>
  )
}
