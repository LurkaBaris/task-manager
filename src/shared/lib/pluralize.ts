const russianPluralRules = new Intl.PluralRules('ru-RU')

export const pluralize = (value: number, forms: readonly [string, string, string]): string => {
  const category = russianPluralRules.select(Math.abs(value))

  if (category === 'one') {
    return forms[0]
  }

  if (category === 'few') {
    return forms[1]
  }

  return forms[2]
}
