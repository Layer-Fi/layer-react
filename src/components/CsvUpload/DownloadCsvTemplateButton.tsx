import { type PropsWithChildren } from 'react'
import { DeprecatedButton, ButtonVariant } from '../Button'
import { FileDownIcon } from 'lucide-react'

interface DownloadCsvTemplateButtonProps<T> {
  csvProps: {
    headers: { [K in keyof T]: string }
    rows?: T[]
  }
  fileName?: string
  className?: string
}

export const DownloadCsvTemplateButton = <T extends { [K in keyof T]: string | number | null | undefined }>({ children, className, csvProps, fileName = 'template.csv' }: PropsWithChildren<DownloadCsvTemplateButtonProps<T>>) => {
  const { headers, rows = [] } = csvProps
  const handleDownload = () => {
    const csvData: (string | undefined)[][] = [
      Object.values(headers),
      ...rows.map((row: T) =>
        (Object.keys(headers) as (keyof T)[])
          .map(header => row[header] ? String(row[header]) : ''),
      ),
    ]
    const csvContent = csvData.map(row => row.map(value => value ? `"${value.replace(/"/g, '""')}"` : '').join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', fileName)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <DeprecatedButton
      className={className}
      variant={ButtonVariant.secondary}
      rightIcon={<FileDownIcon size={12} />}
      onClick={handleDownload}
      tooltip='Need help? Download an example CSV'
    >
      {children}
    </DeprecatedButton>
  )
}
