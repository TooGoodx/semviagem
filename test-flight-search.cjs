#!/usr/bin/env node
/**
 * Script de teste para busca de voos na API Moblix
 * Testa a funcionalidade de busca: CNF -> CGH em 27/11/2025
 */

const axios = require('axios');

// Configuração
const API_BASE_URL = 'https://api.moblix.com.br';
const AUTH_CREDENTIALS = {
  username: 'TooGood',
  password: '23a01acf223df93bbd08843a27d1fe7a873321ed13e4268a0a09aca9e92cc4c7'
};

// Parâmetros da busca
const SEARCH_PARAMS = {
  origem: 'CNF',
  destino: 'CGH',
  ida: '2025-11-27',
  adultos: 1,
  criancas: 0,
  bebes: 0,
  companhia: -1, // Todas as companhias
  classe: 'Y' // Econômica
};

let authToken = null;

/**
 * Realiza login na API Moblix
 */
async function login() {
  console.log('🔐 [LOGIN] Autenticando na API Moblix...');
  console.log(`📍 URL: ${API_BASE_URL}/api/Token`);

  try {
    const formData = new URLSearchParams();
    formData.append('grant_type', 'password');
    formData.append('username', AUTH_CREDENTIALS.username);
    formData.append('password', AUTH_CREDENTIALS.password);

    const response = await axios({
      method: 'post',
      url: `${API_BASE_URL}/api/Token`,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      data: formData,
      timeout: 10000
    });

    authToken = response.data.access_token;
    console.log('✅ [LOGIN] Autenticação bem-sucedida!');
    console.log(`🔑 Token: ${authToken.substring(0, 20)}...`);
    console.log(`⏰ Expira em: ${response.data.expires_in} segundos`);
    return authToken;
  } catch (error) {
    console.error('❌ [LOGIN] Erro na autenticação:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
    throw error;
  }
}

/**
 * Consulta voos na API Moblix
 */
async function buscarVoos() {
  console.log('\n🔍 [BUSCA] Consultando voos...');
  console.log('📋 Parâmetros:');
  console.log(`   Origem: ${SEARCH_PARAMS.origem}`);
  console.log(`   Destino: ${SEARCH_PARAMS.destino}`);
  console.log(`   Data: ${SEARCH_PARAMS.ida}`);
  console.log(`   Passageiros: ${SEARCH_PARAMS.adultos} adulto(s)`);
  console.log(`   Classe: ${SEARCH_PARAMS.classe}`);
  console.log(`   Companhia: ${SEARCH_PARAMS.companhia === -1 ? 'Todas' : SEARCH_PARAMS.companhia}`);

  const requestData = {
    Origem: SEARCH_PARAMS.origem,
    Destino: SEARCH_PARAMS.destino,
    Ida: SEARCH_PARAMS.ida,
    Adultos: SEARCH_PARAMS.adultos,
    Criancas: SEARCH_PARAMS.criancas,
    Bebes: SEARCH_PARAMS.bebes,
    Companhia: SEARCH_PARAMS.companhia,
    Classe: SEARCH_PARAMS.classe
  };

  console.log('\n📤 [REQUEST] Dados da requisição:', JSON.stringify(requestData, null, 2));

  try {
    const startTime = Date.now();

    const response = await axios({
      method: 'post',
      url: `${API_BASE_URL}/api/ConsultaAereo/Consultar`,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Origin': 'externo',
        'Authorization': `Bearer ${authToken}`
      },
      data: requestData,
      timeout: 60000 // 60 segundos
    });

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    console.log(`\n✅ [SUCESSO] Resposta recebida em ${duration}s`);
    console.log(`📊 Status: ${response.status} ${response.statusText}`);

    const data = response.data;

    if (data.Data && Array.isArray(data.Data)) {
      console.log(`\n🎯 [RESULTADOS] ${data.Data.length} voo(s) encontrado(s)`);
      console.log(`📈 Total de itens: ${data.TotalItens || data.Data.length}`);

      // Exibe resumo dos primeiros 5 voos
      const maxDisplay = Math.min(5, data.Data.length);
      console.log(`\n📋 Resumo dos primeiros ${maxDisplay} voo(s):\n`);

      data.Data.slice(0, maxDisplay).forEach((voo, index) => {
        console.log(`--- Voo #${index + 1} ---`);
        console.log(`✈️  Companhia: ${voo.Cia?.Nome || voo.Companhia || 'N/A'}`);
        console.log(`🛫 Partida: ${voo.HoraOrigem || voo.Saida || 'N/A'}`);
        console.log(`🛬 Chegada: ${voo.HoraDestino || voo.Chegada || 'N/A'}`);
        console.log(`⏱️  Duração: ${voo.TempoDeVoo || voo.Duracao || 'N/A'}`);
        console.log(`💰 Preço: R$ ${voo.Preco || voo.Valor || 'N/A'}`);
        console.log(`🔄 Escalas: ${voo.Escalas || 0}`);
        console.log(``);
      });

      // Estatísticas
      if (data.Data.length > 0) {
        const precos = data.Data
          .map(v => parseFloat(v.Preco || v.Valor || 0))
          .filter(p => p > 0);

        if (precos.length > 0) {
          const menorPreco = Math.min(...precos);
          const maiorPreco = Math.max(...precos);
          const precoMedio = precos.reduce((a, b) => a + b, 0) / precos.length;

          console.log(`📊 [ESTATÍSTICAS]`);
          console.log(`   Menor preço: R$ ${menorPreco.toFixed(2)}`);
          console.log(`   Maior preço: R$ ${maiorPreco.toFixed(2)}`);
          console.log(`   Preço médio: R$ ${precoMedio.toFixed(2)}`);
        }
      }

      // Salva resultado completo em arquivo
      const fs = require('fs');
      const filename = `resultado-busca-${SEARCH_PARAMS.origem}-${SEARCH_PARAMS.destino}-${SEARCH_PARAMS.ida}.json`;
      fs.writeFileSync(filename, JSON.stringify(data, null, 2));
      console.log(`\n💾 Resultado completo salvo em: ${filename}`);

    } else {
      console.log('\n⚠️  [AVISO] Nenhum voo encontrado');
      console.log('📄 Resposta completa:', JSON.stringify(data, null, 2));
    }

    return data;

  } catch (error) {
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    console.error(`\n❌ [ERRO] Falha após ${duration}s`);

    if (error.response) {
      console.error('📛 Status:', error.response.status);
      console.error('📄 Dados:', JSON.stringify(error.response.data, null, 2));
      console.error('📋 Headers:', error.response.headers);
    } else if (error.request) {
      console.error('📡 Sem resposta do servidor');
      console.error('Detalhes:', error.message);
    } else {
      console.error('⚠️  Erro:', error.message);
    }

    throw error;
  }
}

/**
 * Função principal
 */
async function main() {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║     TESTE DE BUSCA DE VOOS - API MOBLIX               ║');
  console.log('╚════════════════════════════════════════════════════════╝');
  console.log('');

  try {
    // 1. Autenticar
    await login();

    // 2. Buscar voos
    await buscarVoos();

    console.log('\n✅ [CONCLUÍDO] Teste finalizado com sucesso!');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ [FALHA] Teste finalizado com erros');
    console.error('Erro:', error.message);
    process.exit(1);
  }
}

// Executa o teste
main();
