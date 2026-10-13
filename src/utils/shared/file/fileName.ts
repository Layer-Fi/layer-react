export const getFileExtension = (fileName: string) => {
  const dotIndex = fileName.lastIndexOf('.')
  return dotIndex > 0 ? fileName.slice(dotIndex + 1).toLowerCase() : ''
}

export const splitFileName = (fileName: string) => {
  const dotIndex = fileName.lastIndexOf('.')
  if (dotIndex <= 0) return { stem: fileName, extension: '' }

  return { stem: fileName.slice(0, dotIndex), extension: fileName.slice(dotIndex) }
}
