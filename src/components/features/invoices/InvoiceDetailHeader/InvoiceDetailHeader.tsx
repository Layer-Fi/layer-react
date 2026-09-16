import type { TFunction } from 'i18next'
import { ArrowRight, HandCoins, Save } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import type { Awaitable } from '@internal-types/utility/awaitable'
import { InvoiceStatus } from '@schemas/features/invoices/invoiceStatus'
import { translationKey } from '@utils/shared/i18n/translationKey'
import { useLayerContext } from '@providers/global/LayerContext/LayerContext'
import { UpsertMode } from '@hooks/utils/swr/createUpsertHook'
import { type InvoiceDetailRouteState, InvoiceDetailStep, useInvoiceDetail, useInvoiceNavigation } from '@providers/features/invoices/InvoicesRouteStore/InvoicesRouteStoreProvider'
import { Button } from '@ui/Button/Button'
import { HStack } from '@ui/Stack/Stack'
import { Heading } from '@ui/Typography/Heading'
import { InvoiceDetailHeaderMenu } from '@features/invoices/InvoiceDetailHeader/InvoiceDetailHeaderMenu'
import type { InvoiceFormState } from '@features/invoices/InvoiceForm/formUtils'
import { InvoicePdfDownloadButton } from '@features/invoices/InvoicePdfDownloadButton/InvoicePdfDownloadButton'

import './invoiceDetailHeader.scss'

enum HeaderMode {
  View = 'View',
  Edit = 'Edit',
  Preview = 'Preview',
}

const getHeaderMode = (viewState: InvoiceDetailRouteState): HeaderMode => {
  if (viewState.step === InvoiceDetailStep.Preview) {
    return HeaderMode.Preview
  }
  if (viewState.isReadOnly) {
    return HeaderMode.View
  }
  return HeaderMode.Edit
}

const HEADING_I18N: Record<HeaderMode, { withNumber: ReturnType<typeof translationKey>, noNumber: ReturnType<typeof translationKey> }> = {
  [HeaderMode.Preview]: {
    withNumber: translationKey('invoices:InvoiceDetailHeader.label.invoice_number', 'Invoice #{{invoiceNumber}}'),
    noNumber: translationKey('invoices:InvoiceDetailHeader.action.view_invoice', 'View Invoice'),
  },
  [HeaderMode.View]: {
    withNumber: translationKey('invoices:InvoiceDetailHeader.label.invoice_number', 'Invoice #{{invoiceNumber}}'),
    noNumber: translationKey('invoices:InvoiceDetailHeader.action.view_invoice', 'View Invoice'),
  },
  [HeaderMode.Edit]: {
    withNumber: translationKey('invoices:InvoiceDetailHeader.label.editing_invoice_number', 'Editing Invoice #{{invoiceNumber}}'),
    noNumber: translationKey('invoices:InvoiceDetailHeader.label.editing_invoice', 'Editing Invoice'),
  },
}

const getHeadingContent = (headerMode: HeaderMode, invoiceNumber: string | null, t: TFunction) => {
  const { i18nKey, defaultValue } = invoiceNumber
    ? HEADING_I18N[headerMode].withNumber
    : HEADING_I18N[headerMode].noNumber
  return t(i18nKey, defaultValue, invoiceNumber ? { invoiceNumber } : {})
}

export type InvoiceDetailHeaderProps = {
  onSubmitInvoiceForm: () => Awaitable<void>
  formState: InvoiceFormState
  openInvoicePaymentDrawer: () => void
}

export const InvoiceDetailHeader = ({
  onSubmitInvoiceForm,
  formState,
  openInvoicePaymentDrawer,
}: InvoiceDetailHeaderProps) => {
  const { t } = useTranslation()
  const { accountingConfiguration } = useLayerContext()
  const viewState = useInvoiceDetail()
  const { toEditInvoice } = useInvoiceNavigation()
  const enablePaymentMethodsOnFinalize = !!accountingConfiguration?.enableStripeOnboarding

  const buttonContent = enablePaymentMethodsOnFinalize
    ? (
      {
        label: t('common:label.next', 'Next'),
        icon: <ArrowRight size={14} />,
      }
    )
    : (
      {
        label: t('common:action.save_label', 'Save'),
        icon: <Save size={14} />,
      }
    )

  const formStepButton = (
    <Button isDisabled={formState.isSubmitting} onPress={() => { void onSubmitInvoiceForm() }}>
      {buttonContent.label}
      {buttonContent.icon}
    </Button>
  )

  if (viewState.mode === UpsertMode.Create) {
    return (
      <HStack justify='space-between' align='center' fluid pie='md'>
        <Heading>{t('invoices:InvoiceDetailHeader.action.create_invoice', 'Create Invoice')}</Heading>
        {formStepButton}
      </HStack>
    )
  }

  const headerMode = getHeaderMode(viewState)
  const headingContent = getHeadingContent(headerMode, viewState.invoice.invoiceNumber, t)

  const canMarkAsPaid = viewState.invoice.status === InvoiceStatus.Saved
    || viewState.invoice.status === InvoiceStatus.PartiallyPaid

  return (
    <HStack className='Layer__InvoiceDetail__Header' justify='space-between' align='center' fluid pie='md'>
      <Heading ellipsis>{headingContent}</Heading>
      {headerMode === HeaderMode.Edit && formStepButton}
      {headerMode === HeaderMode.Preview && (
        <InvoicePdfDownloadButton invoiceId={viewState.invoice.id} />
      )}
      {headerMode === HeaderMode.View && (
        <HStack gap='xs'>
          {canMarkAsPaid && (
            <Button onPress={openInvoicePaymentDrawer}>
              {t('invoices:InvoiceDetailHeader.action.mark_paid', 'Mark as paid')}
              <HandCoins size={14} />
            </Button>
          )}
          <InvoiceDetailHeaderMenu onEditInvoice={() => toEditInvoice(viewState.invoice)} />
        </HStack>
      )}
    </HStack>
  )
}
