import { type Meta, type StoryObj } from '@storybook/react-vite'
import { ChevronRight } from 'lucide-react'
import { Button as ReactAriaButton } from 'react-aria-components/Button'

import { HStack } from '@ui/Stack/Stack'
import { Tree, TreeItem, TreeItemContent } from '@ui/Tree/Tree'
import { Span } from '@ui/Typography/Text'

const Group = ({ id, label, children }: { id: string, label: string, children: React.ReactNode }) => (
  <TreeItem id={id} textValue={label}>
    <TreeItemContent>
      <HStack align='center' justify='space-between'>
        <Span size='sm' weight='bold'>{label}</Span>
        <ReactAriaButton slot='chevron' aria-label={`Toggle ${label}`}>
          <ChevronRight width={16} height={16} />
        </ReactAriaButton>
      </HStack>
    </TreeItemContent>
    {children}
  </TreeItem>
)

const Leaf = ({ id, label }: { id: string, label: string }) => (
  <TreeItem id={id} textValue={label}>
    <TreeItemContent>
      <Span size='sm'>{label}</Span>
    </TreeItemContent>
  </TreeItem>
)

const SampleTree = () => (
  <Tree
    aria-label='Accounts'
    selectionMode='single'
    defaultExpandedKeys={new Set(['assets', 'liabilities'])}
    defaultSelectedKeys={new Set(['cash'])}
  >
    <Group id='assets' label='Assets'>
      <Leaf id='cash' label='Cash' />
      <Leaf id='receivable' label='Accounts Receivable' />
    </Group>
    <Group id='liabilities' label='Liabilities'>
      <Leaf id='payable' label='Accounts Payable' />
      <Leaf id='loans' label='Loans' />
    </Group>
  </Tree>
)

const meta: Meta<typeof Tree> = {
  title: 'UI/Tree',
  component: Tree,
}

export default meta

type Story = StoryObj<typeof Tree>

export const Playground: Story = {
  parameters: { chromatic: { disableSnapshot: true } },
  render: () => (
    <div style={{ width: 320 }}>
      <SampleTree />
    </div>
  ),
}

export const AllVariants: Story = {
  parameters: { chromatic: { viewports: [1280] } },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 24, width: 320 }}>
      <Span size='sm' weight='bold'>Expanded with selection</Span>
      <SampleTree />
    </div>
  ),
}
