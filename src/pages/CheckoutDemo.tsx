import React from 'react';
import StripeCheckout from '../components/StripeCheckout';

const CheckoutDemo: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Sem Viagem Premium
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Acesso completo à plataforma de busca de voos
            </p>
            
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-md p-4">
              <h3 className="text-lg font-medium text-blue-800 mb-3">
                Recursos Inclusos:
              </h3>
              <ul className="text-sm text-blue-700 space-y-2 text-left">
                <li>• Busca avançada de voos</li>
                <li>• Alertas de preços</li>
                <li>• Comparação de tarifas</li>
                <li>• Suporte prioritário</li>
                <li>• Acesso a ofertas exclusivas</li>
              </ul>
            </div>
            
            <div className="mt-6">
              <StripeCheckout className="w-full text-lg py-4">
                Assinar Agora - R$ 29,90/mês
              </StripeCheckout>
            </div>
            
            <p className="mt-4 text-xs text-gray-500">
              Pagamento seguro processado pelo Stripe
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutDemo;
