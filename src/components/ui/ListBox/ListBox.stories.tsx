import { type Meta, type StoryObj } from '@storybook/react-vite'

import {
  ListBox,
  ListBoxItem,
  ListBoxSection,
  ListBoxSectionHeader,
} from '@ui/ListBox/ListBox'

const meta: Meta<typeof ListBox> = {
  title: 'UI/ListBox',
  component: ListBox,
}

export default meta

type Story = StoryObj<typeof ListBox>

export const Playground: Story = {
  parameters: { chromatic: { disableSnapshot: true } },
  render: () => (
    <ListBox aria-label='Accounts' selectionMode='single' defaultSelectedKeys={['checking']}>
      <ListBoxItem id='checking'>Checking</ListBoxItem>
      <ListBoxItem id='savings'>Savings</ListBoxItem>
      <ListBoxItem id='credit'>Credit card</ListBoxItem>
    </ListBox>
  ),
}

const Col = ({ label, children }: { label: string, children: React.ReactNode }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: 240 }}>
    <span style={{ fontSize: 12, fontWeight: 600 }}>{label}</span>
    {children}
  </div>
)

export const AllVariants: Story = {
  parameters: { chromatic: { viewports: [1280] } },
  render: () => (
    <div style={{ display: 'flex', gap: 32, padding: 24, alignItems: 'flex-start' }}>
      <Col label='single select'>
        <ListBox aria-label='Single' selectionMode='single' defaultSelectedKeys={['savings']}>
          <ListBoxItem id='checking'>Checking</ListBoxItem>
          <ListBoxItem id='savings'>Savings</ListBoxItem>
          <ListBoxItem id='credit' isDisabled>Credit card</ListBoxItem>
        </ListBox>
      </Col>
      <Col label='multi select'>
        <ListBox aria-label='Multi' selectionMode='multiple' defaultSelectedKeys={['checking', 'credit']}>
          <ListBoxItem id='checking'>Checking</ListBoxItem>
          <ListBoxItem id='savings'>Savings</ListBoxItem>
          <ListBoxItem id='credit'>Credit card</ListBoxItem>
        </ListBox>
      </Col>
      <Col label='sections'>
        <ListBox aria-label='Sections' selectionMode='single'>
          <ListBoxSection>
            <ListBoxSectionHeader>Assets</ListBoxSectionHeader>
            <ListBoxItem id='checking'>Checking</ListBoxItem>
            <ListBoxItem id='savings'>Savings</ListBoxItem>
          </ListBoxSection>
          <ListBoxSection>
            <ListBoxSectionHeader>Liabilities</ListBoxSectionHeader>
            <ListBoxItem id='credit'>Credit card</ListBoxItem>
          </ListBoxSection>
        </ListBox>
      </Col>
    </div>
  ),
}
