export const readRequestJson = async (request: Request): Promise<unknown> => {
  return JSON.parse(await request.text()) as unknown
}
