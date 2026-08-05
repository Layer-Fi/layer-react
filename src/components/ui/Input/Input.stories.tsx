import { type Meta, type StoryObj } from '@storybook/react-vite'
import { CircleHelp, type LucideIcon, X } from 'lucide-react'

import { Button } from '@ui/Button/Button'
import { Input } from '@ui/Input/Input'
import { InputGroup } from '@ui/Input/InputGroup'
import { HStack } from '@ui/Stack/Stack'

import { Gallery } from '@testUtils/storybook/layout/Gallery'
import { Row } from '@testUtils/storybook/layout/Row'

type Cell = {
  label: string
  group?: {
    leadingText?: string
    isDisabled?: boolean
    isInvalid?: boolean
  }
  input?: {
    defaultValue?: string
    placeholder?: string
    readOnly?: boolean
    disabled?: boolean
  }
  actions?: { label: string, Icon: LucideIcon }[]
}

const CLEAR = { label: 'Clear', Icon: X }
const HELP = { label: 'Help', Icon: CircleHelp }

const CELLS: Cell[] = [
  { label: 'default', input: { placeholder: 'Placeholder' } },
  { label: 'value', input: { defaultValue: 'Typed value' } },
  { label: 'disabled', group: { isDisabled: true }, input: { placeholder: 'Disabled', disabled: true } },
  { label: 'readonly', input: { defaultValue: 'Read only', readOnly: true } },
  { label: 'invalid', group: { isInvalid: true }, input: { defaultValue: 'Not a number' } },
  { label: 'leading text', group: { leadingText: 'Total' }, input: { defaultValue: '1,234.56' } },
  { label: 'one action', input: { defaultValue: 'Typed value' }, actions: [CLEAR] },
  { label: 'two actions', input: { defaultValue: 'Typed value' }, actions: [CLEAR, HELP] },
  {
    label: 'leading text, two actions',
    group: { leadingText: 'Total' },
    input: { defaultValue: '1,234.56' },
    actions: [CLEAR, HELP],
  },
]

const toActionCount = (actions: Cell['actions']) =>
  actions?.length === 2 ? 2 : actions?.length === 1 ? 1 : undefined

const meta: Meta<typeof Input> = {
  title: 'UI/Input',
  component: Input,
  args: {
    placeholder: 'Placeholder',
    inset: true,
  },
  argTypes: {
    inset: { control: 'boolean' },
    placement: { control: 'select', options: [undefined, 'first'] },
    disabled: { control: 'boolean' },
  },
}

export default meta

type Story = StoryObj<typeof Input>

export const AllVariants: Story = {
  parameters: { chromatic: { viewports: [1280] } },
  render: () => (
    <Gallery gap={16} inlineSize={420}>
      {CELLS.map(({ label, group, input, actions }) => (
        <Row key={label} label={label}>
          <InputGroup slot='input' actionCount={toActionCount(actions)} {...group}>
            <Input inset {...input} />
            {actions?.map(({ label: actionLabel, Icon }) => (
              <HStack key={actionLabel}>
                <Button icon inset variant='ghost' aria-label={actionLabel}>
                  <Icon size={16} />
                </Button>
              </HStack>
            ))}
          </InputGroup>
        </Row>
      ))}
    </Gallery>
  ),
}
