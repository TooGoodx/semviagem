import React from 'react';
import { XCircleIcon } from '@heroicons/react/24/solid';

const Cancel: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            <XCircleIcon className="mx-auto h-16 w-16 text-red-500" />
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Pagamento Cancelado
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Sua transação foi cancelada. Nenhuma cobrança foi realizada.
            </p>
            <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <XCircleIcon className="h-5 w-5 text-yellow-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Transação Cancelada
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>
                      Você pode tentar novamente a qualquer momento. Se precisar de ajuda, entre em contato conosco.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6 space-y-3">
              <button
                onClick={() => window.history.back()}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Tentar Novamente
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Voltar ao Início
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cancel;
