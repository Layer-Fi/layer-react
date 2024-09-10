import React, { useContext, useState } from 'react'
import { PlatformOnboardingContext } from '../../contexts/PlatformOnboardingContext'
import { SubmitButton } from '../Button'
import { Input, InputGroup, Select } from '../Input'
import { Heading, HeadingSize, Text, TextSize } from '../Typography'

export const PlatformOnboardingForm = () => {
  const { formData, updateFormData, nextStep } = useContext(
    PlatformOnboardingContext,
  )

  return (
    <div className='Layer__platform__onboarding__form-wrapper'>
      <div className='Layer__platform__onboarding__header'>
        <Heading size={HeadingSize.secondary}>
          We’ll use this information to contact you whenever we have questions
          on your books.
        </Heading>
      </div>
      <form
        className='Layer__platform__onboarding__form'
        onSubmit={e => {
          e.preventDefault()
          nextStep()
        }}
      >
        <Text as='p' size={TextSize.sm}>
          Contact information
        </Text>
        <div className='Layer__platform__onboarding__form--inputs'>
          <div className='Layer__platform__onboarding__input-group--inline'>
            <InputGroup name='firstName' label='First name'>
              <Input
                name='firstName'
                placeholder='John'
                value={formData.name}
                onChange={e =>
                  updateFormData(
                    'firstName',
                    (e.target as HTMLInputElement).value,
                  )
                }
              />
            </InputGroup>
            <InputGroup name='lastName' label='Last name'>
              <Input
                name='lastName'
                placeholder='Doe'
                value={formData.name}
                onChange={e =>
                  updateFormData(
                    'lastName',
                    (e.target as HTMLInputElement).value,
                  )
                }
              />
            </InputGroup>
          </div>
          <InputGroup
            name='email'
            label='What’s the email you want to use for bookkeeping communication?'
          >
            <Input
              name='email'
              placeholder='john@company.com'
              value={formData.name}
              onChange={e =>
                updateFormData('email', (e.target as HTMLInputElement).value)
              }
            />
          </InputGroup>
          <InputGroup
            name='phone'
            label='What’s the phone number you want to use for bookkeeping communication?'
          >
            <Input
              name='phone'
              placeholder='1-212-456-7890'
              value={formData.name}
              onChange={e =>
                updateFormData('email', (e.target as HTMLInputElement).value)
              }
            />
          </InputGroup>
        </div>
        <Text as='p' size={TextSize.sm}>
          Business information
        </Text>
        <div className='Layer__platform__onboarding__form--inputs'>
          <InputGroup name='company' label='Company'>
            <Input
              name='company'
              placeholder='Company'
              value={formData.name}
              onChange={e =>
                updateFormData(
                  'firstName',
                  (e.target as HTMLInputElement).value,
                )
              }
            />
          </InputGroup>
          <InputGroup name='dba' label='DBA (optional)'>
            <Input
              name='email'
              placeholder='john@company.com'
              value={formData.name}
              onChange={e =>
                updateFormData('email', (e.target as HTMLInputElement).value)
              }
            />
          </InputGroup>
          <InputGroup name='entity' label='Entity type'>
            <Select
              value={formData.entity}
              onChange={sel => updateFormData('entity', sel)}
            />
          </InputGroup>
          <div className='Layer__platform__onboarding__input-group--inline'>
            <InputGroup name='state' label='State'>
              <Select
                value={formData.state}
                onChange={sel => updateFormData('state', sel)}
              />
            </InputGroup>
            <InputGroup name='taxId' label='Tax ID number (optional)'>
              <Input
                name='taxId'
                value={formData.name}
                onChange={e =>
                  updateFormData('taxId', (e.target as HTMLInputElement).value)
                }
              />
            </InputGroup>
          </div>
        </div>
        <SubmitButton type='submit' noIcon={true} active={true}>
          Save
        </SubmitButton>
      </form>
    </div>
  )
}
