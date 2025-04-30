import { useForm, FormValidateOrFn, FormAsyncValidateOrFn } from '@tanstack/react-form'
import { CloseButton, RetryButton, SubmitButton } from '../../Button'
import { Header, HeaderCol, HeaderRow } from '../../Header'
import { Heading, HeadingSize } from '../../Typography'
import { useBankTransactionsPanelContext } from '../BankTransactionsPanel'
import { useCreateCategory } from './useCreateCategory'
import { InputGroup } from '../../Input/InputGroup'
import { Input } from '../../Input/Input'
import { Textarea } from '../../Textarea'
import { CategoryOption, CategorySelect } from '../../CategorySelect/CategorySelect'
import { BankTransaction } from '../../../types/bank_transactions'
import { VStack } from '../../ui/Stack/Stack'

export interface CategoryFormFields {
  // parentCategory?: CategoryOption
  parentCategory?: unknown
  name?: string
  description?: string
}

export const CategoryForm = () => {
  const { closeCategoryForm } = useBankTransactionsPanelContext()
  const { trigger: createCategory, isMutating, apiError } = useCreateCategory({
    onSuccess: () => {
      closeCategoryForm()
    },
  })

  const form = useForm<
    CategoryFormFields,
    FormValidateOrFn<CategoryFormFields>,
    FormValidateOrFn<CategoryFormFields>,
    FormAsyncValidateOrFn<CategoryFormFields>,
    FormValidateOrFn<CategoryFormFields>,
    FormAsyncValidateOrFn<CategoryFormFields>,
    FormValidateOrFn<CategoryFormFields>,
    FormAsyncValidateOrFn<CategoryFormFields>,
    FormAsyncValidateOrFn<CategoryFormFields>,
    FormAsyncValidateOrFn<CategoryFormFields>> ({
    defaultValues: {
      parentCategory: undefined,
      name: undefined,
      description: undefined,
    },
    onSubmit: async ({ value }) => {
      if (value.name !== undefined && form.state.isDirty) {
        await createCategory()
        form.reset(value)
      }
    },
  })

  return (
    <>
      <Header className='Layer__chart-of-accounts__sidebar__header'>
        <HeaderRow>
          <HeaderCol>
            <Heading size={HeadingSize.secondary} className='title'>
              Add new category
            </Heading>
          </HeaderCol>
          <HeaderCol className='actions'>
            {apiError && (
              <RetryButton
                type='submit'
                processing={isMutating}
                error='Check connection and retry in few seconds.'
                disabled={isMutating}
              >
                Retry
              </RetryButton>
            )}
            {!apiError && (
              <SubmitButton
                type='button'
                noIcon={true}
                active={true}
                disabled={isMutating}
                onClick={() => void form.handleSubmit()}
              >
                Save
              </SubmitButton>
            )}

            {!apiError && (
              <SubmitButton
                type='button'
                noIcon={true}
                active={true}
                disabled={isMutating}
                onClick={() => void form.handleSubmit()}
              >
                Save & assign
              </SubmitButton>
            )}

            <CloseButton onClick={closeCategoryForm} />
          </HeaderCol>
        </HeaderRow>
      </Header>
      <VStack pie='md' pis='md'>
        {/** @TODO - resolve TS issue */}
        <form.Field name='parentCategory'>
          {field => (
            <>
              <InputGroup name='parentCategory' label='Parent'>
                <CategorySelect
                  value={field.state.value as CategoryOption | undefined}
                  onChange={value => field.handleChange(value as unknown)}
                  bankTransaction={{} as BankTransaction}
                  showTooltips={true}
                />
              </InputGroup>
            </>
          )}
        </form.Field>
        <form.Field name='name'>
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
                />
              </InputGroup>
            </>
          )}
        </form.Field>
        <form.Field name='description'>
          {field => (
            <>
              <InputGroup name='description' label='Description'>
                <Textarea
                  name='Description'
                  value={field.state.value}
                  onChange={e =>
                    field.handleChange((e.target as HTMLInputElement).value)}
                  isInvalid={field.state.meta.errors.length > 0}
                  errorMessage={field.state.meta.errors.join(', ')}
                />
              </InputGroup>
            </>
          )}
        </form.Field>
      </VStack>
    </>
  )
}
