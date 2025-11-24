import React, { useState } from 'react';
import AirportSearch from '../components/AirportSearch';

const TestAirportSearch: React.FC = () => {
  const [origem, setOrigem] = useState('');
  const [destino, setDestino] = useState('');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center text-gray-900 mb-8">
            🧪 Teste do Componente AirportSearch
          </h1>
          
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Teste a Busca por Países e Aeroportos
            </h2>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AirportSearch
                  label="Origem"
                  name="origem"
                  value={origem}
                  onChange={setOrigem}
                  placeholder="Digite: espanha, madrid, MAD"
                  icon="🛫"
                />
                
                <AirportSearch
                  label="Destino"
                  name="destino"
                  value={destino}
                  onChange={setDestino}
                  placeholder="Digite: para, belém, BEL"
                  icon="🛬"
                />
              </div>
              
              <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-bold text-blue-900 mb-2">Valores Selecionados:</h3>
                <p className="text-blue-800">
                  <strong>Origem:</strong> {origem || 'Nenhum selecionado'}
                </p>
                <p className="text-blue-800">
                  <strong>Destino:</strong> {destino || 'Nenhum selecionado'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              🔍 Como Testar
            </h3>
            <div className="space-y-4 text-gray-700">
              <div>
                <h4 className="font-semibold text-gray-900">Busca por País:</h4>
                <p>Digite: <code className="bg-gray-100 px-2 py-1 rounded">espanha</code> - Deve mostrar todos os aeroportos da Espanha</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Busca por Cidade:</h4>
                <p>Digite: <code className="bg-gray-100 px-2 py-1 rounded">madrid</code> - Deve mostrar o aeroporto de Madrid</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Busca por Código IATA:</h4>
                <p>Digite: <code className="bg-gray-100 px-2 py-1 rounded">MAD</code> - Deve mostrar o aeroporto com código MAD</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Para o Brasil:</h4>
                <p>Digite: <code className="bg-gray-100 px-2 py-1 rounded">para</code> ou <code className="bg-gray-100 px-2 py-1 rounded">belém</code> - Deve mostrar aeroportos do Pará</p>
              </div>
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Esta página é para testar o funcionamento do componente AirportSearch.
              <br />
              <strong>Problema:</strong> Se nada aparecer quando você digitar "espanha", há um bug no componente.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestAirportSearch;
