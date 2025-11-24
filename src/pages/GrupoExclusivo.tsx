import React from 'react';

const GrupoExclusivo: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Grupo Exclusivo</h1>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <p className="text-gray-600 mb-4">
              Bem-vindo ao nosso Grupo Exclusivo! Aqui você encontrará conteúdo premium e benefícios especiais.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Benefícios Exclusivos</h3>
                <ul className="text-blue-700 space-y-1">
                  <li>• Alertas premium de ofertas</li>
                  <li>• Consultoria personalizada</li>
                  <li>• Acesso antecipado a promoções</li>
                  <li>• Suporte prioritário</li>
                </ul>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-green-900 mb-2">Recursos Disponíveis</h3>
                <ul className="text-green-700 space-y-1">
                  <li>• Treinamentos exclusivos</li>
                  <li>• Webinars ao vivo</li>
                  <li>• Comunidade privada</li>
                  <li>• Ferramentas avançadas</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GrupoExclusivo;
