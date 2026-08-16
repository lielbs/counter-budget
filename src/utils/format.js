export const currencySymbols = { ILS: '₪', USD: '$', EUR: '€' }

export const formatMoney = (value, currency = 'ILS') =>
  new Intl.NumberFormat('he-IL', { style: 'currency', currency, maximumFractionDigits: 0 }).format(Number(value) || 0)

export const formatMonth = (month) => {
  const [year, number] = month.split('-').map(Number)
  return new Intl.DateTimeFormat('he-IL', { month: 'long', year: 'numeric' }).format(new Date(year, number - 1, 1))
}

export const formatDate = (date) => new Intl.DateTimeFormat('he-IL', { day: 'numeric', month: 'short' }).format(new Date(`${date}T12:00:00`))

export const shiftMonth = (month, delta) => {
  const [year, number] = month.split('-').map(Number)
  const date = new Date(year, number - 1 + delta, 1)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

export const uid = () => crypto.randomUUID()
