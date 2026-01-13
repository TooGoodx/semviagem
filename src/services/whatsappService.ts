/**
 * WhatsApp Service - Sprint 3
 * Handles WhatsApp notifications for price alerts
 */

export interface WhatsAppMessage {
  to: string
  message: string
  type: 'price_alert' | 'welcome' | 'confirmation' | 'alert_created'
  alertData?: {
    route: string
    oldPrice?: number
    newPrice?: number
    currency?: 'BRL' | 'MILES'
  }
}

export interface WhatsAppSendResult {
  success: boolean
  messageId?: string
  error?: string
}

export class WhatsAppService {
  // Netlify function endpoint for sending WhatsApp messages
  private static readonly WEBHOOK_URL = '/.netlify/functions/send-whatsapp'

  /**
   * Send a price alert notification
   */
  static async sendPriceAlert(
    whatsappNumber: string,
    route: string,
    oldPrice: number,
    newPrice: number,
    currency: 'BRL' | 'MILES'
  ): Promise<WhatsAppSendResult> {
    const message = this.generatePriceAlertMessage(route, oldPrice, newPrice, currency)
    return this.sendMessage(whatsappNumber, message, 'price_alert', {
      route,
      oldPrice,
      newPrice,
      currency
    })
  }

  /**
   * Send welcome message when user enables WhatsApp notifications
   */
  static async sendWelcomeMessage(
    whatsappNumber: string,
    userName: string
  ): Promise<WhatsAppSendResult> {
    const message = `Ola ${userName}! Bem-vindo aos Alertas Inteligentes da TripJunto!

Agora voce recebera notificacoes exclusivas quando:
- Houver voos com suas milhas
- Os precos cairem abaixo do valor definido

Seus alertas estao ativos e voce sera notificado aqui no WhatsApp.

Para gerenciar seus alertas: https://tripjunto.com/profile`

    return this.sendMessage(whatsappNumber, message, 'welcome')
  }

  /**
   * Send confirmation when alert is created
   */
  static async sendAlertCreatedMessage(
    whatsappNumber: string,
    alertName: string,
    origins: string[],
    destinations: string[]
  ): Promise<WhatsAppSendResult> {
    const originStr = origins.join(', ')
    const destStr = destinations.join(', ')

    const message = `ALERTA CRIADO - TripJunto

Seu alerta "${alertName}" foi ativado!

Rotas monitoradas:
De: ${originStr}
Para: ${destStr}

Voce sera notificado assim que encontrarmos ofertas que correspondam aos seus criterios.

Gerencie seus alertas: https://tripjunto.com/profile`

    return this.sendMessage(whatsappNumber, message, 'alert_created', {
      route: `${originStr} -> ${destStr}`
    })
  }

  /**
   * Generate price alert message
   */
  private static generatePriceAlertMessage(
    route: string,
    oldPrice: number,
    newPrice: number,
    currency: 'BRL' | 'MILES'
  ): string {
    const savings = oldPrice - newPrice
    const currencyPrefix = currency === 'BRL' ? 'R$ ' : ''
    const currencySuffix = currency === 'MILES' ? ' milhas' : ''

    const formatPrice = (price: number) =>
      `${currencyPrefix}${price.toLocaleString('pt-BR')}${currencySuffix}`

    return `ALERTA DE PRECO - TripJunto

${route}
Preco caiu!

Antes: ${formatPrice(oldPrice)}
Agora: ${formatPrice(newPrice)}
Economia: ${formatPrice(savings)}

Ver voo: https://tripjunto.com
Compre logo, pois os precos podem subir!`
  }

  /**
   * Format WhatsApp number to international format
   */
  static formatWhatsAppNumber(phone: string): string {
    // Remove all non-numeric characters
    let cleaned = phone.replace(/\D/g, '')

    // If doesn't start with country code, assume Brazil (+55)
    if (!cleaned.startsWith('55') && cleaned.length <= 11) {
      cleaned = '55' + cleaned
    }

    // Ensure it starts with +
    return '+' + cleaned
  }

  /**
   * Validate WhatsApp number format
   */
  static isValidWhatsAppNumber(phone: string): boolean {
    const cleaned = phone.replace(/\D/g, '')
    // Brazilian numbers: 55 + DDD (2 digits) + number (8-9 digits) = 12-13 digits
    // International: varies, but generally 10-15 digits total
    return cleaned.length >= 10 && cleaned.length <= 15
  }

  /**
   * Send message via webhook
   */
  private static async sendMessage(
    whatsappNumber: string,
    message: string,
    type: WhatsAppMessage['type'],
    alertData?: WhatsAppMessage['alertData']
  ): Promise<WhatsAppSendResult> {
    try {
      // Format number
      const formattedNumber = this.formatWhatsAppNumber(whatsappNumber)

      // Validate number
      if (!this.isValidWhatsAppNumber(formattedNumber)) {
        console.error('Invalid WhatsApp number:', whatsappNumber)
        return {
          success: false,
          error: 'Invalid WhatsApp number format'
        }
      }

      console.log(`Sending WhatsApp ${type} to ${formattedNumber}`)

      const response = await fetch(this.WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: formattedNumber,
          message,
          type,
          alertData
        } as WhatsAppMessage)
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('WhatsApp API error:', response.status, errorText)
        return {
          success: false,
          error: `API error: ${response.status}`
        }
      }

      const result = await response.json()
      console.log('WhatsApp message sent:', result)

      return {
        success: true,
        messageId: result.messageId
      }
    } catch (error) {
      console.error('WhatsApp send error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Test WhatsApp configuration (dry run)
   */
  static async testConfiguration(whatsappNumber: string): Promise<WhatsAppSendResult> {
    const formattedNumber = this.formatWhatsAppNumber(whatsappNumber)

    if (!this.isValidWhatsAppNumber(formattedNumber)) {
      return {
        success: false,
        error: 'Invalid WhatsApp number format'
      }
    }

    // In development, just validate the format
    if (import.meta.env.DEV) {
      console.log('WhatsApp test (dev mode):', {
        originalNumber: whatsappNumber,
        formattedNumber,
        isValid: true
      })
      return {
        success: true,
        messageId: 'dev-test-' + Date.now()
      }
    }

    // In production, could send a test message
    return this.sendMessage(
      whatsappNumber,
      'TripJunto: Teste de configuracao do WhatsApp. Suas notificacoes estao funcionando!',
      'confirmation'
    )
  }
}

// Export singleton-style functions for convenience
export const sendPriceAlert = WhatsAppService.sendPriceAlert.bind(WhatsAppService)
export const sendWelcomeMessage = WhatsAppService.sendWelcomeMessage.bind(WhatsAppService)
export const sendAlertCreatedMessage = WhatsAppService.sendAlertCreatedMessage.bind(WhatsAppService)
export const formatWhatsAppNumber = WhatsAppService.formatWhatsAppNumber.bind(WhatsAppService)
export const isValidWhatsAppNumber = WhatsAppService.isValidWhatsAppNumber.bind(WhatsAppService)
export const testWhatsAppConfiguration = WhatsAppService.testConfiguration.bind(WhatsAppService)
