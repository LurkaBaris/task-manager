export const downloadFile = (file: Blob, name: string): void => {
  const fileUrl = URL.createObjectURL(file)
  const link = document.createElement('a')

  link.href = fileUrl
  link.download = name
  link.click()

  window.setTimeout(() => URL.revokeObjectURL(fileUrl), 0)
}
