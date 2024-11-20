import React, { useContext, useState } from 'react'
import { PlatformOnboardingContext } from '../../contexts/PlatformOnboardingContext'
import { SubmitButton } from '../Button'
import { Input, InputGroup, Select } from '../Input'
import { ErrorText, Heading, HeadingSize, Text, TextSize } from '../Typography'
import { BaseSelectOption } from '../../types/general'
import { Layer } from '../../api/layer'
import { useLayerContext } from '../../contexts/LayerContext'
import { useEnvironment } from '../../providers/Environment/EnvironmentInputProvider'
import { useAuth } from '../../hooks/useAuth'

interface FormDataTypes {
  firstName: string
  lastName: string
  email: string
  phone_number: string
  legal_name: string
  dba?: string
  country: string
  entity?: BaseSelectOption
  state?: BaseSelectOption
  taxId: string
}

export const PlatformOnboardingForm = () => {
  const { nextStep } = useContext(PlatformOnboardingContext)
  const { businessId } = useLayerContext()
  const { apiUrl } = useEnvironment()
  const { data: auth } = useAuth()

  const [formData, setFormData] = useState<Partial<FormDataTypes>>({})
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | undefined>()

  const updateFormData = (
    fieldName: string,
    value: string | BaseSelectOption | undefined,
  ) => {
    setFormData(prevFormData => ({ ...prevFormData, [fieldName]: value }))
  }

  const submitForm = async() => {
    try {
      setSending(true)
      setError(undefined)
      await Layer.updateBusiness(apiUrl, auth?.access_token, {
        params: { businessId },
        body: formData,
      })
      nextStep()
    } catch (err) {
      console.error(err)
      setError('Submit failed. Please, try again!')
    } finally {
      setSending(false)
    }
  }

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
          submitForm()
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
                value={formData.firstName}
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
                value={formData.lastName}
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
              value={formData.email}
              onChange={e =>
                updateFormData('email', (e.target as HTMLInputElement).value)
              }
            />
          </InputGroup>
          <InputGroup
            name='phone_number'
            label='What’s the phone number you want to use for bookkeeping communication?'
          >
            <Input
              name='phone_number'
              placeholder='1-212-456-7890'
              value={formData.phone_number}
              onChange={e =>
                updateFormData('phone_number', (e.target as HTMLInputElement).value)
              }
            />
          </InputGroup>
        </div>
        <Text as='p' size={TextSize.sm}>
          Business information
        </Text>
        <div className='Layer__platform__onboarding__form--inputs'>
          <InputGroup name='legal_name' label='Company'>
            <Input
              name='legal_name'
              placeholder='Company'
              value={formData.legal_name}
              onChange={e =>
                updateFormData(
                  'legal_name',
                  (e.target as HTMLInputElement).value,
                )
              }
            />
          </InputGroup>
          <InputGroup name='dba' label='DBA (optional)'>
            <Input
              name='dba'
              placeholder='01/02/2000'
              value={formData.email}
              onChange={e =>
                updateFormData('dba', (e.target as HTMLInputElement).value)
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
                value={formData.taxId}
                onChange={e =>
                  updateFormData('taxId', (e.target as HTMLInputElement).value)
                }
              />
            </InputGroup>
          </div>
        </div>
        <SubmitButton disabled={sending} type='submit' noIcon={true} active={true}>
          Save
        </SubmitButton>
        {error && (
          <ErrorText className='Layer__mt-md' size={TextSize.sm}>{error}</ErrorText>
        )}
      </form>
    </div>
  )
}
