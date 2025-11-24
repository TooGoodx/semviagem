import React from 'react';

const FlightSearchDebug: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          ✈️ Flight Search Debug
        </h1>
        
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600">
            Esta é uma versão minimalista para debug do erro React #31.
          </p>
          <p className="text-gray-600 mt-2">
            Se você está vendo esta página, o componente básico funciona.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FlightSearchDebug;
