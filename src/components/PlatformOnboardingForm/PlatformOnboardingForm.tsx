import React, { useContext, useEffect, useState } from 'react'
import { PlatformOnboardingContext } from '../../contexts/PlatformOnboardingContext'
import { SubmitButton } from '../Button'
import { Input, InputGroup, Select } from '../Input'
import { ErrorText, Heading, HeadingSize, Text, TextSize } from '../Typography'
import { BaseSelectOption } from '../../types/general'
import { Layer } from '../../api/layer'
import { useLayerContext } from '../../contexts/LayerContext'
import { useEnvironment } from '../../providers/Environment/EnvironmentInputProvider'
import { useAuth } from '../../hooks/useAuth'
import { Business } from '../../types'
import { US_STATES } from '../../types/location'
import { ENTITY_TYPES } from '../../types/business'

export interface FormDataTypes {
  firstName: string
  lastName: string
  email: string
  phone_number: string
  legal_name: string
  dba?: string
  entity_type?: string
  us_state?: string
  tin: string
}

const buildDefaultValues = (business?: Business) => {
  if (!business) {
    return {} as Partial<FormDataTypes>
  }

  const data: Partial<FormDataTypes> = {}

  if (business.legal_name) {
    data.legal_name = business.legal_name
  }

  if (business.phone_number) {
    data.phone_number = business.phone_number
  }

  if (business.entity_type) {
    data.entity_type = business.entity_type
  }

  if (business.us_state) {
    data.us_state = business.us_state
  }

  if (business.tin) {
    data.tin = business.tin
  }

  return data
}

const buildSelectOptions = (strings: string[]) => strings.map(s => ({
  label: s,
  value: s,
}))

const findSelectOption = (options: BaseSelectOption[], value?: string) => {
  if (!value) {
    return undefined
  }

  return options.find(o => (o.value as string).toLowerCase() === value.toLowerCase())
}

export const PlatformOnboardingForm = () => {
  const { nextStep, formData, setFormData } = useContext(PlatformOnboardingContext)
  const { businessId, business } = useLayerContext()
  const { apiUrl } = useEnvironment()
  const { data: auth } = useAuth()

  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | undefined>()

  // Populate form with existing business data
  useEffect(() => {
    if (Object.keys(formData).length > 0) {
      return
    }

    setFormData(buildDefaultValues(business))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [business])

  const updateFormData = (
    fieldName: string,
    value: string | BaseSelectOption | undefined,
  ) => {
    setFormData(prevFormData => ({ ...prevFormData, [fieldName]: typeof value === 'object' ? value.value : value }))
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

  const entityTypes = buildSelectOptions(ENTITY_TYPES)
  const usStates = buildSelectOptions(US_STATES)

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
              placeholder='Alternative name'
              value={formData.dba}
              onChange={e =>
                updateFormData('dba', (e.target as HTMLInputElement).value)
              }
            />
          </InputGroup>
          <InputGroup name='entity_type' label='Entity type'>
            <Select
              options={entityTypes}
              value={findSelectOption(entityTypes, formData.entity_type)}
              onChange={sel => updateFormData('entity_type', sel)}
            />
          </InputGroup>
          <div className='Layer__platform__onboarding__input-group--inline'>
            <InputGroup name='us_state' label='State'>
              <Select
                options={usStates}
                value={formData.us_state && findSelectOption(usStates, formData.us_state)}
                onChange={sel => updateFormData('us_state', sel)}
              />
            </InputGroup>
            <InputGroup name='tin' label='Tax ID number (optional)'>
              <Input
                name='tin'
                value={formData.tin}
                onChange={e =>
                  updateFormData('tin', (e.target as HTMLInputElement).value)
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
