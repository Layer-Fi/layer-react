import { useForm } from '@tanstack/react-form'
import { Button, ButtonVariant, CloseButton, RetryButton, SubmitButton } from '../../Button'
import { Header, HeaderCol, HeaderRow } from '../../Header'
import { ErrorText, Heading, HeadingSize } from '../../Typography'
import { useBankTransactionsPanelContext } from '../BankTransactionsPanel'
import { InputGroup } from '../../Input/InputGroup'
import { Input } from '../../Input/Input'
import { CategoryOption, CategorySelect } from '../../CategorySelect/CategorySelect'
import { BankTransaction } from '../../../types/bank_transactions'
import { HStack, VStack } from '../../ui/Stack/Stack'
import { useCreateChildAccount } from '../../../hooks/useChartOfAccounts'
import { FormSection } from '../../Input/FormSection'

export type CategoryFormFields = {
  parentCategory?: unknown
  name?: string
}

/* @TODO - having TS issue - replace this with regular CategoryOption after rebase */
type CategoryOptionTemp = {
  payload: {
    id: string
  }
}

export const CategoryForm = () => {
  const { closeCategoryForm } = useBankTransactionsPanelContext()
  const { trigger: createChildAccount, isMutating, error } = useCreateChildAccount()

  const form = useForm({
    defaultValues: {
      parentCategory: undefined as CategoryOptionTemp | undefined,
      name: '',
    },
    onSubmit: async ({ value }) => {
      try {
        if (value.name !== undefined && form.state.isDirty && (value.parentCategory as CategoryOption).payload.id) {
          await createChildAccount({ name: value.name, accountId: (value.parentCategory as CategoryOption).payload.id })
          form.reset(value)
          closeCategoryForm()
        }
      }
      catch {
        console.error('Submit error')
      }
    },
  })

  return (
    <form onSubmit={(e) => {
      e.preventDefault()
      e.stopPropagation()
      void form.handleSubmit()
    }}
    >
      <Header className='Layer__chart-of-accounts__sidebar__header'>
        <HeaderRow>
          <HeaderCol>
            <Heading size={HeadingSize.secondary} className='title'>
              Add new category
            </Heading>
          </HeaderCol>
          <HeaderCol className='actions'>
            {error && (
              <RetryButton
                type='submit'
                processing={isMutating}
                error='Check connection and retry in few seconds.'
                disabled={isMutating}
              >
                Retry
              </RetryButton>
            )}
            {!error && (
              <SubmitButton
                type='submit'
                noIcon={true}
                active={true}
                disabled={isMutating}
              >
                Save
              </SubmitButton>
            )}

            <CloseButton type='button' onClick={closeCategoryForm} />
          </HeaderCol>
        </HeaderRow>
      </Header>
      <VStack pbe='sm' pbs='sm' pie='md' pis='md' fluid>
        <FormSection>
          {/** @TODO - resolve TS issue */}
          <form.Field
            name='parentCategory'
            validators={{
              onSubmit: ({ value }) => value ? undefined : 'Parent category is required',
            }}
          >
            {field => (
              <>
                <InputGroup name='parentCategory' label='Parent'>
                  {/* @TODO - replace with new CategorySelect and add invalid state */}
                  <CategorySelect
                    value={field.state.value as CategoryOption | undefined}
                    onChange={value => field.handleChange(value)}
                    bankTransaction={{} as BankTransaction}
                    showTooltips={true}
                  />
                  {field.state.meta.errors.length > 0 && (
                    <ErrorText>{field.state.meta.errors.join(', ')}</ErrorText>
                  )}
                </InputGroup>
              </>
            )}
          </form.Field>

          <form.Field
            name='name'
            validators={{
              onSubmit: ({ value }) => value ? undefined : 'Name is required',
            }}
          >
            {field => (
              <>
                <InputGroup name='name' label='Name'>
                  <Input
                    name='name'
                    placeholder='Enter name...'
                    value={field.state.value}
                    onChange={e =>
                      field.handleChange((e.target as HTMLInputElement).value)}
                    isInvalid={field.state.meta.errors.length > 0}
                    errorMessage={field.state.meta.errors.join(', ')}
                    fluid
                  />
                  {field.state.meta.errors.length > 0 && (
                    <ErrorText>{field.state.meta.errors.join(', ')}</ErrorText>
                  )}
                </InputGroup>
              </>
            )}
          </form.Field>
        </FormSection>
        <HStack pbe='sm' pbs='md' justify='space-between' className='Layer__create-category__bottom-actions'>
          <Button
            type='button'
            onClick={closeCategoryForm}
            variant={ButtonVariant.secondary}
            disabled={isMutating}
          >
            Cancel
          </Button>
          {error && (
            <RetryButton
              type='submit'
              processing={isMutating}
              error='Check connection and retry in few seconds.'
              disabled={isMutating}
            >
              Retry
            </RetryButton>
          )}
          {!error && (
            <SubmitButton
              type='submit'
              noIcon={true}
              active={true}
              disabled={isMutating}
            >
              Save
            </SubmitButton>
          )}
        </HStack>
      </VStack>
    </form>
  )
}
