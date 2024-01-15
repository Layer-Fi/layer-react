import React from 'react'
import { RadioButtonGroup } from './'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

it('renders a list of buttons (label/value pairs) that can be clicked', async () => {
  const user = userEvent.setup()
  const onChange = jest.fn()
  render(
    <RadioButtonGroup
      name='testgroup'
      buttons={[
        { label: 'First One', value: 'one' },
        { label: 'Second', value: 'two' },
      ]}
      onChange={onChange}
    />,
  )
  const secondButton = await screen.findByText('Second')

  await user.click(secondButton)

  expect(onChange).toHaveBeenCalledWith(
    expect.objectContaining({
      target: expect.objectContaining({ value: 'two' }),
    }),
  )
})
