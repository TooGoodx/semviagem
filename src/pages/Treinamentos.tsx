import React from 'react';

const Treinamentos: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-800 via-primary-900 to-secondary-800">
      <header className="bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center">
          <h1 className="text-4xl font-bold text-white">
            🎓 Treinamentos
          </h1>
          <p className="text-blue-200 text-lg mt-1">
            Aprenda tudo sobre milhas e viagens!
          </p>
        </div>
      </header>

      <main className="py-12">
        <div className="max-w-5xl mx-auto bg-white/10 backdrop-blur rounded-xl shadow-xl p-8">
          <h2 className="text-3xl font-bold text-white mb-6">Cursos Disponíveis</h2>
          <p className="text-lg text-blue-100 mb-6">
            Escolha um treinamento e transforme suas viagens.
          </p>
          <ul className="space-y-4">
            <li className="flex items-center justify-between px-4 py-5 bg-white/20 rounded-lg">
              <div className="flex items-center">
                <span className="text-orange-400 text-2xl mr-4">⚡</span>
                <h3 className="text-xl font-bold text-white">Milhas Básico</h3>
              </div>
              <button className="ml-6 px-4 py-2 text-base font-medium rounded-lg shadow-md text-white bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 transition-all duration-300 transform hover:scale-105">
                Saber mais
              </button>
            </li>
            <li className="flex items-center justify-between px-4 py-5 bg-white/20 rounded-lg">
              <div className="flex items-center">
                <span className="text-orange-400 text-2xl mr-4">⚡</span>
                <h3 className="text-xl font-bold text-white">Milhas Avançado</h3>
              </div>
              <button className="ml-6 px-4 py-2 text-base font-medium rounded-lg shadow-md text-white bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 transition-all duration-300 transform hover:scale-105">
                Saber mais
              </button>
            </li>
            <li className="flex items-center justify-between px-4 py-5 bg-white/20 rounded-lg">
              <div className="flex items-center">
                <span className="text-orange-400 text-2xl mr-4">⚡</span>
                <h3 className="text-xl font-bold text-white">Viagens Econômicas</h3>
              </div>
              <button className="ml-6 px-4 py-2 text-base font-medium rounded-lg shadow-md text-white bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 transition-all duration-300 transform hover:scale-105">
                Saber mais
              </button>
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
};

export default Treinamentos;
