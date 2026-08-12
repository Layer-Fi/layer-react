import { type Meta, type StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'

import { LinkButton } from '@ui/Button/LinkButton'
import { SubmitButton } from '@ui/Button/SubmitButton'

import { Col } from '@testUtils/storybook/layout/Col'
import { Gallery } from '@testUtils/storybook/layout/Gallery'

const meta: Meta<typeof SubmitButton> = {
  title: 'UI/Button/Legacy class names (scratch)',
  component: SubmitButton,
}

export default meta

type Story = StoryObj<typeof SubmitButton>

const BANK_SUBMIT_CLASS_NAME = 'Layer__bank-transaction__submit-btn'

/**
 * The unchanged state: a `SubmitButton` rendered by a non-bank caller — a confirmation modal, a CSV
 * upload step — emits only the generic legacy names, no bank-transaction one.
 */
export const SharedSubmitButton: Story = {
  parameters: { chromatic: { viewports: [1280] } },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector(`.${BANK_SUBMIT_CLASS_NAME}`)).toBeNull()
    await expect(canvasElement.querySelector('.Layer__btn--with-primary-icon')).not.toBeNull()
  },
  render: () => (
    <Gallery gap={24}>
      <Col label='no className — generic legacy names only'>
        <SubmitButton>Save</SubmitButton>
      </Col>
      <Col label='noIcon — no --with-primary-icon'>
        <SubmitButton noIcon>Save</SubmitButton>
      </Col>
    </Gallery>
  ),
}

/**
 * The changed state: the bank-transaction name is now passed in by the feature caller, so it lands
 * on the same element it always did without every other `SubmitButton` emitting it.
 */
export const SubmitButtonWithCallerClassName: Story = {
  parameters: { chromatic: { viewports: [1280] } },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector(`.${BANK_SUBMIT_CLASS_NAME}`)).not.toBeNull()
    await expect(canvasElement.querySelector('.Layer__bank-transaction__retry-btn')).not.toBeNull()
  },
  render: () => (
    <Gallery gap={24}>
      <Col label='className from BankTransactionsSubmitButton'>
        <SubmitButton className={BANK_SUBMIT_CLASS_NAME} iconBox>Approve</SubmitButton>
      </Col>
      <Col label='error — retry name, as v0.1.122 emitted'>
        <SubmitButton
          className='Layer__bank-transaction__retry-btn'
          iconBox
          withRetry
          isError
          errorMessage='Approval failed.'
        >
          Retry
        </SubmitButton>
      </Col>
    </Gallery>
  ),
}

/** A disabled `LinkButton` now carries `Layer__btn--disabled`, matching disabled `Button`. */
export const DisabledLinkButton: StoryObj<typeof LinkButton> = {
  parameters: { chromatic: { viewports: [1280] } },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('.Layer__btn--disabled')).not.toBeNull()
  },
  render: () => (
    <Gallery gap={24}>
      <Col label='isDisabled — Layer__btn--disabled emitted'>
        <LinkButton href='https://example.com' isDisabled>Disabled link</LinkButton>
      </Col>
      <Col label='enabled — baseline, no disabled name'>
        <LinkButton href='https://example.com'>Enabled link</LinkButton>
      </Col>
    </Gallery>
  ),
}
