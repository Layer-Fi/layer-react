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
import { US_STATES } from '../../types/location'
import { ENTITY_TYPES } from '../../types/business'
import { buildDefaultValues, buildSelectOptions, findSelectOption, formatPhoneNumber, validateFormFields } from './utils'
import { FormDataTypes } from './types'

export const PlatformOnboardingForm = () => {
  const { nextStep, formData, setFormData } = useContext(PlatformOnboardingContext)
  const { businessId, business } = useLayerContext()
  const { apiUrl } = useEnvironment()
  const { data: auth } = useAuth()
  
  const [formErrors, setFormErrors] = useState<Record<string, string>>({ 'aaa': 'asx'})
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
    if (formErrors[fieldName]) {
      clearError(fieldName)
    }
    setFormData((prevFormData: Partial<FormDataTypes>) => 
      ({ ...prevFormData, [fieldName]: typeof value === 'object' ? value.value : value })
    )
  }

  const clearError = (key: string) => {
    const newErrors = { ...formErrors }
    delete newErrors[key]
    setFormErrors(newErrors)
  }

  const validate = () => {
    const newErrors = validateFormFields(formData)

    setFormErrors(newErrors)

    return Object.keys(newErrors).length === 0
  }

  const submitForm = async() => {
    try {
      if (!validate()) {
        setError('Please correct the errors above.')
        return
      }
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
            <InputGroup name='first_name' label='First name'>
              <Input
                name='first_name'
                placeholder='John'
                value={formData.first_name}
                onChange={e =>
                  updateFormData(
                    'first_name',
                    (e.target as HTMLInputElement).value,
                  )
                }
                isInvalid={Boolean(formErrors.first_name)}
                errorMessage={formErrors.first_name}
              />
            </InputGroup>
            <InputGroup name='last_name' label='Last name'>
              <Input
                name='last_name'
                placeholder='Doe'
                value={formData.last_name}
                onChange={e =>
                  updateFormData(
                    'last_name',
                    (e.target as HTMLInputElement).value,
                  )
                }
                isInvalid={Boolean(formErrors.last_name)}
                errorMessage={formErrors.last_name}
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
              isInvalid={Boolean(formErrors.email)}
              errorMessage={formErrors.email}
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
                updateFormData('phone_number', formatPhoneNumber((e.target as HTMLInputElement).value))
              }
              isInvalid={Boolean(formErrors.phone_number)}
              errorMessage={formErrors.phone_number}
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
              isInvalid={Boolean(formErrors.legal_name)}
              errorMessage={formErrors.legal_name}
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
              isInvalid={Boolean(formErrors.dba)}
              errorMessage={formErrors.dba}
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
                isInvalid={Boolean(formErrors.tin)}
                errorMessage={formErrors.tin}
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
