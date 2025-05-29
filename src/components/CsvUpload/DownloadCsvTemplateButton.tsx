import { type PropsWithChildren } from 'react'
import { Button } from '../Button'
import { FileDownIcon } from 'lucide-react'
import { format } from 'date-fns'

interface DownloadCsvTemplateButtonProps<T> {
  csvProps: {
    headers: (keyof T)[]
    rows?: T[]
  }
  fileName?: string
  className?: string
}

function isDate(val: unknown): val is Date {
  return val instanceof Date
}

export const DownloadCsvTemplateButton = <T extends Record<string, any>>({ children, className, csvProps, fileName = 'template.csv' }: PropsWithChildren<DownloadCsvTemplateButtonProps<T>>) => {
  const { headers, rows = [] } = csvProps
  const handleDownload = () => {
    const csvData: string[][] = [
      headers as string[],
      ...rows.map((row: T) =>
        headers.map((header: keyof T) => {
          const value = row[header]
          if (isDate(value)) return format(value, 'MM/dd/yyyy')
          if (typeof value === 'number') return value.toString()
          return value ?? ''
        }),
      ),
    ]
    const csvContent = csvData.map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csvcharset=utf-8' })
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
    <Button className={className} rightIcon={<FileDownIcon size={12} />} onClick={handleDownload}>
      {children}
    </Button>
  )
}
