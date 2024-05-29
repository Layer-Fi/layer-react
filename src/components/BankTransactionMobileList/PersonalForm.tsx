import React from 'react'
import { Button } from '../Button'

interface PersonalFormProps {}

export const PersonalForm = ({}: PersonalFormProps) => {
  return (
    <div className='Layer__bank-transaction-mobile-list-item__personal-form'>
      <Button onClick={() => console.log('Categorize as personal')}>
        Categorize as Personal
      </Button>
    </div>
  )
}
