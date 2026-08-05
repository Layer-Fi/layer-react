import { type Meta, type StoryObj } from '@storybook/react-vite'

import { Button } from '@ui/Button/Button'
import { HStack, VStack } from '@ui/Stack/Stack'
import { Heading } from '@ui/Typography/Heading'
import { Span } from '@ui/Typography/Text'
import { Container } from '@blocks/Layout/Container/Container'
import { DeprecatedHeader } from '@blocks/Layout/DeprecatedHeader/DeprecatedHeader'
import { Header } from '@blocks/Layout/Header/Header'
import { HeaderCol } from '@blocks/Layout/Header/HeaderCol'
import { HeaderRow } from '@blocks/Layout/Header/HeaderRow'
import { Panel } from '@blocks/Layout/View/Panel/Panel'
import { View } from '@blocks/Layout/View/View'

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
        <Container name='story-container'><Body /></Container>
      </Section>
      <Section title='elevated'>
        <Container name='story-container' elevated><Body /></Container>
      </Section>
      <Section title='plain'>
        <Container name='story-container' variant='plain'><Body /></Container>
      </Section>
      <Section title='asWidget'>
        <Container name='story-container' asWidget><Body /></Container>
      </Section>
      <Section title='with a deprecated header'>
        <Container name='story-container'>
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
      <Section title='single row'>
        <Container name='story-container'>
          <Header asHeader>
            <HeaderRow>
              <HeaderCol><Heading level={2} size='md'>Title</Heading></HeaderCol>
              <HeaderCol><Button>Action</Button></HeaderCol>
            </HeaderRow>
          </Header>
        </Container>
      </Section>

      <Section title='sticky and rounded, two rows, second scrollable'>
        <Container name='story-container'>
          <Header asHeader sticky rounded>
            <HeaderRow>
              <HeaderCol><Heading level={2} size='md'>Journal</Heading></HeaderCol>
              <HeaderCol>
                <HStack gap='xs'>
                  <Button variant='outlined'>Download</Button>
                  <Button>Add entry</Button>
                </HStack>
              </HeaderCol>
            </HeaderRow>
            <HeaderRow scrollable>
              <HeaderCol><Button variant='ghost'>Date range</Button></HeaderCol>
              <HeaderCol><Button variant='ghost'>Search</Button></HeaderCol>
            </HeaderRow>
          </Header>
        </Container>
      </Section>

      <Section title='fluid column'>
        <Container name='story-container'>
          <Header asHeader>
            <HeaderRow>
              <HeaderCol fluid>
                <Heading level={2} size='md'>Fills the row</Heading>
                <Button>Action</Button>
              </HeaderCol>
            </HeaderRow>
          </Header>
        </Container>
      </Section>

      <Section title='stacked direction'>
        <Container name='story-container'>
          <Header asHeader>
            <HeaderRow direction='col'>
              <HeaderCol><Heading level={2} size='md'>Stacked</Heading></HeaderCol>
              <HeaderCol><Button>Action</Button></HeaderCol>
            </HeaderRow>
          </Header>
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
        <View title='Balance sheet' type='panel'><Body /></View>
      </Section>
      <Section title='with sidebar'>
        <View title='Bookkeeping' withSidebar sidebar={<Sidebar />}><Body /></View>
      </Section>
    </Gallery>
  ),
}

export const Panels: Story = {
  render: () => (
    <Gallery>
      <Section title='no sidebar'>
        <Container name='story-container'>
          <Panel><Body /></Panel>
        </Container>
      </Section>
      <Section title='sidebar closed'>
        <Container name='story-container'>
          <Panel sidebar={<Sidebar />}><Body /></Panel>
        </Container>
      </Section>
      <Section title='sidebar open'>
        <Container name='story-container'>
          <Panel sidebarIsOpen sidebar={<Sidebar />}><Body /></Panel>
        </Container>
      </Section>
      <Section title='sidebar open, defaultSidebarHeight'>
        <Container name='story-container'>
          <Panel sidebarIsOpen defaultSidebarHeight sidebar={<Sidebar />}><Body /></Panel>
        </Container>
      </Section>
      <Section title='with a header'>
        <Container name='story-container'>
          <Panel
            sidebarIsOpen
            sidebar={<Sidebar />}
            header={(
              <Header asHeader sticky rounded>
                <HeaderRow>
                  <HeaderCol><Heading level={2} size='md'>Chart of accounts</Heading></HeaderCol>
                  <HeaderCol><Button>Add account</Button></HeaderCol>
                </HeaderRow>
              </Header>
            )}
          >
            <Body />
          </Panel>
        </Container>
      </Section>
    </Gallery>
  ),
}
