/** Starts a drag of one file of `mimeType` over `element`, for drag-state snapshots. */
export const dragFileOver = (element: HTMLElement, mimeType: string) => {
  const dataTransfer = new DataTransfer()
  dataTransfer.items.add(new File(['content'], 'office-supplies-receipt', { type: mimeType }))
  element.dispatchEvent(new DragEvent('dragenter', { bubbles: true, cancelable: true, dataTransfer }))
}
