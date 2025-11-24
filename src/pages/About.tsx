import React from 'react';

const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Sobre Júlio Martins</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Conheça mais sobre o maior especialista em milhas e viagens do Brasil
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Júlio Martins</h2>
              <p className="text-lg text-gray-600 mb-6">
                Especialista em milhas e viagens há mais de 15 anos, com mais de 100 milhões de milhas acumuladas 
                e viagens para mais de 70 países.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">✈️</span>
                  <span className="text-gray-700">Mais de 70 países visitados</span>
                </div>
                <div className="flex items-center">
                  <span className="text-2xl mr-3">💎</span>
                  <span className="text-gray-700">100+ milhões de milhas acumuladas</span>
                </div>
                <div className="flex items-center">
                  <span className="text-2xl mr-3">👥</span>
                  <span className="text-gray-700">10.000+ membros orientados</span>
                </div>
                <div className="flex items-center">
                  <span className="text-2xl mr-3">🏆</span>
                  <span className="text-gray-700">15 anos de experiência</span>
                </div>
              </div>
            </div>

            <div className="text-center">
              <div className="w-48 h-48 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-6xl">👨‍💼</span>
              </div>
            </div>
          </div>

          <div className="mt-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Minha História</h3>
            <div className="prose prose-lg max-w-none text-gray-600">
              <p>
                Desde 2008, dedico-me a transformar sonhos em viagens, ajudando milhares de pessoas a 
                aproveitarem ao máximo o universo das milhas e dos cartões de crédito.
              </p>
              <p>
                Através de estratégias exclusivas e um acompanhamento personalizado, já orientei mais de 
                10.000 pessoas a conquistarem suas viagens dos sonhos, sempre em classe executiva e primeira classe.
              </p>
              <p>
                Hoje, compartilho todo esse conhecimento através de consultorias, treinamentos e conteúdos 
                exclusivos para uma comunidade cada vez maior de viajantes apaixonados.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
