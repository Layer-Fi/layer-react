import { type Meta, type StoryObj } from '@storybook/react-vite'

import { Span } from '@ui/Typography/Text'
import { type SearchComboBoxSelection } from '@blocks/Form/FormSearchComboBoxField'
import { useAppForm } from '@blocks/Form/useForm'
import { ChoiceStep } from '@blocks/FormSteps/ChoiceStep'
import { FormRowSheet } from '@blocks/FormSteps/FormRowSheet'
import { TextStep } from '@blocks/FormSteps/TextStep'
import { UploadStep } from '@blocks/FormSteps/UploadStep'

import { Col } from '@testUtils/storybook/layout/Col'
import { Gallery } from '@testUtils/storybook/layout/Gallery'

type ChoiceValues = { choice: string | null, selection: SearchComboBoxSelection | null }

const EMPTY_CHOICE: ChoiceValues = { choice: null, selection: null }

const OPTIONS = [
  { value: 'meals', label: 'Meals' },
  { value: 'travel', label: 'Travel' },
  { value: 'supplies', label: 'Office supplies' },
]

const SEARCH = {
  options: [{ value: 'vendor-1', label: 'Acme Supplies' }],
  isLoading: false,
  onSearchQueryChange: () => {},
  placeholder: 'Search vendors…',
}

const ROWS = [
  { id: 'row-1', label: 'Oct 2 · Corner Cafe', isComplete: true },
  { id: 'row-2', label: 'Oct 4 · City Taxi', isComplete: false },
  { id: 'row-3', label: 'Oct 9 · Paper Co', isComplete: false },
]

const upload = (files: ReadonlyArray<File>) => Promise.resolve(files.map(({ name }) => ({ id: name, name })))

const FormStepsGallery = () => {
  const form = useAppForm({
    defaultValues: {
      choice: { choice: 'travel', selection: null } satisfies ChoiceValues,
      search: EMPTY_CHOICE,
      both: { choice: null, selection: { value: 'vendor-1', label: 'Acme Supplies' } } satisfies ChoiceValues,
      followUp: { choice: 'meals', selection: null } satisfies ChoiceValues,
      text: { text: '' },
      note: { text: 'Lunch with a client' },
      files: { files: [{ id: 'receipt', name: 'receipt.pdf' }] },
      rows: ROWS.map(() => EMPTY_CHOICE),
    },
  })

  return (
    <Gallery direction='row' wrap gap={32}>
      <Col label='choice' inlineSize={320}>
        <ChoiceStep form={form} fields='choice' label='Category' prompt='What was this for?' options={OPTIONS} />
      </Col>
      <Col label='search' inlineSize={320}>
        <ChoiceStep form={form} fields='search' label='Vendor' prompt='Who did you pay?' options={[]} search={SEARCH} />
      </Col>
      <Col label='chips and search' inlineSize={320}>
        <ChoiceStep form={form} fields='both' label='Vendor' prompt='Who did you pay?' options={OPTIONS} search={SEARCH} />
      </Col>
      <Col label='with follow-up' inlineSize={320}>
        <ChoiceStep
          form={form}
          fields='followUp'
          label='Category'
          prompt='What was this for?'
          options={OPTIONS}
          renderFollowUp={() => <TextStep form={form} fields='note' label='Note' prompt='Who was there?' />}
        />
      </Col>
      <Col label='text' inlineSize={320}>
        <TextStep form={form} fields='text' label='Note' prompt='Anything else?' placeholder='Answer in your own words' multiline />
      </Col>
      <Col label='upload' inlineSize={320}>
        <UploadStep form={form} fields='files' label='Receipts' prompt='Upload the receipt' accept={['pdf']} multiple upload={upload} />
      </Col>
      <Col label='row sheet' inlineSize={480}>
        <FormRowSheet
          prompt='Categorize each transaction'
          countLabel='1 of 3 categorized'
          rows={ROWS.map(({ id, label, isComplete }) => ({
            id,
            summary: <Span size='sm'>{label}</Span>,
            answerLabel: isComplete ? 'Meals' : null,
            isComplete,
          }))}
          renderEditor={rowId => (
            <ChoiceStep form={form} fields={`rows[${ROWS.findIndex(({ id }) => id === rowId)}]`} label='Category' options={OPTIONS} size='sm' />
          )}
        />
      </Col>
    </Gallery>
  )
}

const meta: Meta<typeof FormStepsGallery> = {
  title: 'Blocks/FormSteps',
  component: FormStepsGallery,
}

export default meta

type Story = StoryObj<typeof FormStepsGallery>

export const AllVariants: Story = {
  parameters: { chromatic: { viewports: [1280] } },
  render: () => <FormStepsGallery />,
}
