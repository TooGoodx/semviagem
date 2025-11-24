import React, { useEffect } from 'react';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

const Success: React.FC = () => {
  useEffect(() => {
    // Track successful payment
    console.log('Payment successful - redirect from Stripe');
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            <CheckCircleIcon className="mx-auto h-16 w-16 text-green-500" />
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Pagamento Realizado!
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Seu pagamento foi processado com sucesso.
            </p>
            <div className="mt-6 bg-green-50 border border-green-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <CheckCircleIcon className="h-5 w-5 text-green-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">
                    Transação Confirmada
                  </h3>
                  <div className="mt-2 text-sm text-green-700">
                    <p>
                      Você receberá um email de confirmação em breve com os detalhes da sua compra.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6">
              <button
                onClick={() => window.location.href = '/dashboard'}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Acessar Área Premium
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Success;
