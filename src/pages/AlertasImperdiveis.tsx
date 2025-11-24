import React from 'react';

const AlertasImperdiveis: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-700 via-primary-800 to-secondary-700">
      <header className="bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center">
          <h1 className="text-4xl font-bold text-white">
            🚀 Alertas Imperdíveis
          </h1>
          <p className="text-blue-200 text-lg mt-1">
            Fique por dentro das melhores promoções!
          </p>
        </div>
      </header>

      <main className="py-12">
        <div className="max-w-5xl mx-auto bg-white/10 backdrop-blur rounded-xl shadow-xl p-8">
          <h2 className="text-3xl font-bold text-white mb-6">Seja o primeiro a saber!</h2>
          <p className="text-lg text-blue-100 mb-4">Cadastre-se para receber alertas exclusivos sobre promoções e ofertas especiais de passagens aéreas.</p>
          <form className="space-y-4">
            <input type="email" className="px-4 py-3 w-full text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none" placeholder="Digite seu e-mail" />
            <button type="submit" className="w-full inline-flex items-center justify-center px-6 py-3 text-base font-medium rounded-xl shadow-md text-white bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 transition-all duration-300 transform hover:scale-105">
              Inscreva-se
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default AlertasImperdiveis;
