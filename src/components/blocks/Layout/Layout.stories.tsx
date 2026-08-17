import { type Meta, type StoryObj } from '@storybook/react-vite'

import { Button } from '@ui/Button/Button'
import { HStack, VStack } from '@ui/Stack/Stack'
import { Heading } from '@ui/Typography/Heading'
import { Span } from '@ui/Typography/Text'
import { Container } from '@blocks/Layout/Container/Container'
import { DeprecatedHeader } from '@blocks/Layout/DeprecatedHeader/DeprecatedHeader'
import { Panel } from '@blocks/Layout/View/Panel/Panel'
import { View } from '@blocks/Layout/View/View'
import { ViewHeader } from '@blocks/Layout/View/ViewHeader/ViewHeader'

import { Gallery } from '@testUtils/storybook/layout/Gallery'
import { Section } from '@testUtils/storybook/layout/Section'

/*
 * The layout primitives fill their parent and have no intrinsic size, so these galleries
 * are the visual-regression baseline for the layout overhaul: every variant of every
 * primitive in one render, captured at all three size classes.
 */

const meta: Meta = {
  title: 'Blocks/Layout',
}

export default meta

type Story = StoryObj

const Body = ({ label = 'Body content' }: { label?: string }) => (
  <VStack gap='xs'>
    <Span>{label}</Span>
    <Span size='sm' variant='subtle'>
      Filler so the surface has something to lay out.
    </Span>
  </VStack>
)

const Sidebar = () => (
  <VStack gap='sm' pi='md' pb='md'>
    <Heading level={3} size='sm'>Sidebar</Heading>
    <Span size='sm' variant='subtle'>Detail for the selected row.</Span>
  </VStack>
)

export const Containers: Story = {
  render: () => (
    <Gallery>
      <Section title='default'>
        <Container className='Layer__story-container'><Body /></Container>
      </Section>
      <Section title='elevated'>
        <Container className='Layer__story-container' elevated><Body /></Container>
      </Section>
      <Section title='plain'>
        <Container className='Layer__story-container' variant='plain'><Body /></Container>
      </Section>
      <Section title='asWidget'>
        <Container className='Layer__story-container' asWidget><Body /></Container>
      </Section>
      <Section title='with a deprecated header'>
        <Container className='Layer__story-container'>
          <DeprecatedHeader>
            <Heading level={2} size='md'>Legacy header</Heading>
            <Button>Action</Button>
          </DeprecatedHeader>
          <Body />
        </Container>
      </Section>
    </Gallery>
  ),
}

export const Headers: Story = {
  render: () => (
    <Gallery>
      <Section title='view surface, title only'>
        <ViewHeader title='Reports' />
      </Section>

      <Section title='view surface, title and actions'>
        <ViewHeader title='Reports' slots={{ Actions: <Button>Export</Button> }} />
      </Section>

      <Section title='view surface, fluid title'>
        <ViewHeader
          fluid
          slots={{
            Title: (
              <HStack justify='space-between' fluid>
                <Button variant='ghost'>Date range</Button>
                <Button variant='outlined'>Download</Button>
              </HStack>
            ),
          }}
        />
      </Section>

      <Section title='panel surface, title and actions'>
        <Container className='Layer__story-container'>
          <ViewHeader
            surface='panel'
            asHeader
            title='Chart of accounts'
            slots={{ Actions: <Button>Add account</Button> }}
          />
        </Container>
      </Section>

      <Section title='panel surface, sticky and rounded, with filters'>
        <Container className='Layer__story-container'>
          <ViewHeader
            surface='panel'
            asHeader
            sticky
            rounded
            title='Journal'
            slots={{
              Actions: (
                <>
                  <Button variant='outlined'>Download</Button>
                  <Button>Add entry</Button>
                </>
              ),
              Filters: <Button variant='ghost'>Date range</Button>,
              FilterActions: <Button variant='ghost'>Search</Button>,
            }}
          />
        </Container>
      </Section>
    </Gallery>
  ),
}

export const Views: Story = {
  render: () => (
    <Gallery>
      <Section title='default, with a title'>
        <View title='Reports'><Body /></View>
      </Section>
      <Section title='with header actions'>
        <View title='Reports' header={<Button>Export</Button>}><Body /></View>
      </Section>
      <Section title='no header'>
        <View showHeader={false}><Body /></View>
      </Section>
      <Section title='panel type'>
        <View title='Balance sheet' layout='panel'><Body /></View>
      </Section>
      <Section title='with sidebar'>
        <View title='Bookkeeping' withSidebar sidebar={<Sidebar />}><Body /></View>
      </Section>
      <Section title='with a plain sidebar'>
        <View title='Bookkeeping' withSidebar sidebarVariant='plain' sidebar={<Sidebar />}>
          <Body />
        </View>
      </Section>
      <Section title='no body padding'>
        <View title='Reports' padding='none'><Body /></View>
      </Section>
    </Gallery>
  ),
}

export const Panels: Story = {
  render: () => (
    <Gallery>
      <Section title='no sidebar'>
        <Container className='Layer__story-container'>
          <Panel><Body /></Panel>
        </Container>
      </Section>
      <Section title='sidebar closed'>
        <Container className='Layer__story-container'>
          <Panel sidebar={<Sidebar />}><Body /></Panel>
        </Container>
      </Section>
      <Section title='sidebar open'>
        <Container className='Layer__story-container'>
          <Panel sidebarIsOpen sidebar={<Sidebar />}><Body /></Panel>
        </Container>
      </Section>
      <Section title='sidebar open, fullWidthSidebar'>
        <Container className='Layer__story-container'>
          <Panel sidebarIsOpen fullWidthSidebar sidebar={<Sidebar />}><Body /></Panel>
        </Container>
      </Section>
      <Section title='sidebar closed, fullWidthSidebar'>
        <Container className='Layer__story-container'>
          <Panel fullWidthSidebar sidebar={<Sidebar />}><Body /></Panel>
        </Container>
      </Section>
      <Section title='with a header'>
        <Container className='Layer__story-container'>
          <Panel
            sidebarIsOpen
            sidebar={<Sidebar />}
            header={(
              <ViewHeader
                surface='panel'
                asHeader
                sticky
                rounded
                title='Chart of accounts'
                slots={{ Actions: <Button>Add account</Button> }}
              />
            )}
          >
            <Body />
          </Panel>
        </Container>
      </Section>
    </Gallery>
  ),
}
