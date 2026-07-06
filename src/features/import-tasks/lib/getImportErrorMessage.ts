import { ZodError } from 'zod'

export const getImportErrorMessage = (error: unknown): string => {
  if (error instanceof SyntaxError) {
    return 'Файл должен быть корректным JSON'
  }

  if (!(error instanceof ZodError)) {
    return 'Попробуйте еще раз'
  }

  const rootIssue = error.issues.find((issue) => issue.path.length === 0)

  if (rootIssue?.code === 'invalid_type') {
    return 'Файл должен быть JSON-объектом формата экспорта'
  }

  const firstIssue = error.issues[0]

  return firstIssue?.message ?? 'Файл не соответствует формату выгрузки'
}
