export const readRequestJson = async (request: Request): Promise<unknown> => {
  return JSON.parse(await request.text()) as unknown
}

export const readRequestFiles = async (request: Request, field = 'file'): Promise<File[]> => {
  const formData = await request.formData()

  return formData.getAll(field).filter((entry): entry is File => typeof entry !== 'string')
}
