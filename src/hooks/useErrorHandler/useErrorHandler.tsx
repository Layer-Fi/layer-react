export const useErrorHandler = (callback?: (error: Error) => void) => {
  const onError = (error: Error) => {
    if (callback) {
      callback(error)
    }
  }

  return { onError }
}
