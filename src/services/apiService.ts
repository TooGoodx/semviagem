// Serviço de API para o Moblix Demo - implementa as funções necessárias

export const moblixService = {
  /**
   * Verifica o status da API
   */
  async getStatus() {
    // Simulação do status da API
    return {
      status: 'online',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      services: {
        flights: 'operational',
        bookings: 'operational',
        notifications: 'operational'
      }
    };
  },

  /**
   * Obtém dados de exemplo para criação de bilhete
   */
  getBilheteExemplo() {
    return {
      RequestId: `REQ_${Date.now()}`,
      Email: 'cliente@exemplo.com',
      Passageiros: [{
        Nome: 'João',
        Sobrenome: 'Silva',
        Email: 'joao@exemplo.com',
        Cpf: '12345678901',
        Nascimento: '1990-01-01T00:00:00-03:00'
      }],
      Ida: { Token: 'token_ida_exemplo' },
      IdMeioPagamento: 4, // Transferência
      ValorTotal: 599.90,
      pagante: {
        name: 'João Silva'
      }
    };
  },

  /**
   * Simula a criação de um bilhete
   */
  async criarBilhete(bilheteData: any) {
    // Simula delay da API
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simula resposta de sucesso
    return {
      Success: true,
      Data: [{
        Id: `BIL_${Date.now()}`,
        Passageiro: [{
          Nome: bilheteData.Passageiros[0].Nome,
          Sobrenome: bilheteData.Passageiros[0].Sobrenome
        }],
        Viagem: [{
          Trecho: [{
            NumeroVoo: `AD${Math.floor(Math.random() * 9000) + 1000}`
          }],
          ValorAdulto: bilheteData.ValorTotal || 599.90
        }],
        Status: 'Confirmado',
        DataCriacao: new Date().toISOString()
      }],
      MensagemSucesso: 'Bilhete criado com sucesso!'
    };
  },

  /**
   * Simula analytics
   */
  async getAnalytics(eventData: any) {
    // Simula delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      success: true,
      eventId: `EVT_${Date.now()}`,
      eventType: eventData.eventType,
      timestamp: eventData.timestamp,
      properties: eventData.properties,
      message: 'Evento registrado com sucesso'
    };
  }
};
