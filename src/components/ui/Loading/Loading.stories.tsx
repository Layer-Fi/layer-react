import { type Meta, type StoryObj } from '@storybook/react-vite'

import { ElevatedLoadingSpinner, ElevatedLoadingSpinnerContainer } from '@ui/Loading/ElevatedLoadingSpinner'
import { LoadingSpinner } from '@ui/Loading/LoadingSpinner'
import { HStack, VStack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'

import { Col, Frame, Gallery, Section } from '@testUtils/storybook/layout/gallery'

const SIZES = [16, 24, 48]

const meta: Meta<typeof LoadingSpinner> = {
  title: 'UI/Loading',
  component: LoadingSpinner,
  args: {
    size: 24,
  },
  argTypes: {
    size: { control: { type: 'range', min: 12, max: 64, step: 4 } },
  },
}

export default meta

type Story = StoryObj<typeof LoadingSpinner>

const Content = () => (
  <VStack gap='xs' pi='sm' pb='sm'>
    {['Staples', 'Blue Bottle Coffee', 'Figma'].map(merchant => (
      <HStack key={merchant} fluid justify='space-between' gap='sm'>
        <Span size='sm'>{merchant}</Span>
        <Span size='sm' weight='bold' numeric='tabular-nums'>-$42.00</Span>
      </HStack>
    ))}
  </VStack>
)

export const AllVariants: Story = {
  parameters: { chromatic: { viewports: [1280] } },
  render: () => (
    <Gallery gap={40}>
      <Section title='Sizes'>
        <Gallery direction='row' gap={32} padding={0}>
          {SIZES.map(size => (
            <Col key={size} label={`${size}px`} align='center'>
              <LoadingSpinner size={size} />
            </Col>
          ))}
        </Gallery>
      </Section>
      <Section title='Elevated over content'>
        <Gallery direction='row' gap={32} padding={0}>
          <Col label='resting' inlineSize={280}>
            <Frame padding={0}>
              <ElevatedLoadingSpinnerContainer>
                <Content />
              </ElevatedLoadingSpinnerContainer>
            </Frame>
          </Col>
          <Col label='loading' inlineSize={280}>
            <Frame padding={0}>
              <ElevatedLoadingSpinnerContainer>
                <ElevatedLoadingSpinner />
                <Content />
              </ElevatedLoadingSpinnerContainer>
            </Frame>
          </Col>
        </Gallery>
      </Section>
    </Gallery>
  ),
}
