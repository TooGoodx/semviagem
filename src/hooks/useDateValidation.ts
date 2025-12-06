import { useMemo } from 'react'

// Helper function to add days to a date
function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

// Helper function to check if one date is after another
function isAfter(date: Date, dateToCompare: Date): boolean {
  return date.getTime() > dateToCompare.getTime()
}

// Helper function to format date for display
function formatDate(date: Date): string {
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

// Helper function to get date difference in days
function getDaysDifference(startDate: Date, endDate: Date): number {
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

export interface DateValidationResult {
  isValid: boolean
  errorMessage?: string
  daysFromToday: number
  maxAllowedDate: Date
}

export function useDateValidation(maxSearchDays: number, planName: string = 'atual') {
  // Memoize calculated values for performance
  const dateConfig = useMemo(() => {
    const today = new Date()
    const maxAllowedDate = addDays(today, maxSearchDays)

    return {
      today,
      maxAllowedDate,
      maxSearchDays,
      planName
    }
  }, [maxSearchDays, planName])

  // Main validation function
  const validateSearchDate = (date: Date): DateValidationResult => {
    const daysFromToday = getDaysDifference(dateConfig.today, date)
    const isValid = !isAfter(date, dateConfig.maxAllowedDate)

    if (!isValid) {
      return {
        isValid: false,
        errorMessage: `Seu plano ${planName} permite buscar até ${maxSearchDays} dias no futuro (máximo: ${formatDate(dateConfig.maxAllowedDate)}). Para buscar datas mais distantes, faça upgrade para um plano superior.`,
        daysFromToday,
        maxAllowedDate: dateConfig.maxAllowedDate
      }
    }

    return {
      isValid: true,
      daysFromToday,
      maxAllowedDate: dateConfig.maxAllowedDate
    }
  }

  // Quick validation (boolean only)
  const isValidDate = (date: Date): boolean => {
    return !isAfter(date, dateConfig.maxAllowedDate)
  }

  // Get maximum allowed date
  const getMaxDate = (): Date => {
    return dateConfig.maxAllowedDate
  }

  // Get formatted maximum date string
  const getMaxDateString = (): string => {
    return formatDate(dateConfig.maxAllowedDate)
  }

  // Get maximum date for HTML input (YYYY-MM-DD format)
  const getMaxDateInput = (): string => {
    return dateConfig.maxAllowedDate.toISOString().split('T')[0]
  }

  // Get days remaining in current plan
  const getDaysRemaining = (targetDate: Date): number => {
    const daysFromToday = getDaysDifference(dateConfig.today, targetDate)
    return Math.max(0, maxSearchDays - daysFromToday)
  }

  // Check if date is within warning period (last 10% of allowed days)
  const isInWarningPeriod = (date: Date): boolean => {
    const daysFromToday = getDaysDifference(dateConfig.today, date)
    const warningThreshold = maxSearchDays * 0.9 // 90% of max days
    return daysFromToday >= warningThreshold
  }

  // Get warning message for dates near the limit
  const getWarningMessage = (date: Date): string | null => {
    if (!isInWarningPeriod(date)) return null

    const daysRemaining = getDaysRemaining(date)
    return `Atenção: Esta data está próxima ao limite do seu plano. Restam ${daysRemaining} dias disponíveis.`
  }

  // Get upgrade suggestion message
  const getUpgradeMessage = (): string => {
    return `Aumente seu limite de busca fazendo upgrade para um plano superior e pesquise até 365 dias no futuro.`
  }

  // Format date range for display
  const getDateRangeString = (): string => {
    return `${formatDate(dateConfig.today)} - ${formatDate(dateConfig.maxAllowedDate)}`
  }

  return {
    validateSearchDate,
    isValidDate,
    getMaxDate,
    getMaxDateString,
    getMaxDateInput,
    getDaysRemaining,
    isInWarningPeriod,
    getWarningMessage,
    getUpgradeMessage,
    getDateRangeString,
    config: {
      maxSearchDays,
      planName,
      today: dateConfig.today,
      maxAllowedDate: dateConfig.maxAllowedDate
    }
  }
}

// Hook for range date validation (departure + return)
export function useDateRangeValidation(maxSearchDays: number, planName: string = 'atual') {
  const dateValidation = useDateValidation(maxSearchDays, planName)

  const validateDateRange = (departureDate: Date, returnDate?: Date) => {
    const departureValidation = dateValidation.validateSearchDate(departureDate)

    if (!departureValidation.isValid) {
      return {
        isValid: false,
        error: 'departure',
        message: departureValidation.errorMessage
      }
    }

    if (returnDate) {
      const returnValidation = dateValidation.validateSearchDate(returnDate)

      if (!returnValidation.isValid) {
        return {
          isValid: false,
          error: 'return',
          message: returnValidation.errorMessage
        }
      }

      // Check if return date is after departure date
      if (isAfter(departureDate, returnDate)) {
        return {
          isValid: false,
          error: 'order',
          message: 'A data de volta deve ser posterior à data de ida.'
        }
      }
    }

    return {
      isValid: true,
      message: 'Datas válidas para seu plano.'
    }
  }

  return {
    ...dateValidation,
    validateDateRange
  }
}
