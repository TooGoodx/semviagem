import React from 'react';
import { Link } from 'react-router-dom';

const Consultoria: React.FC = () => {
  const services = [
    {
      icon: '🎯',
      title: 'Consultoria Personalizada',
      description: 'Atendimento individual com estratégias exclusivas para seu perfil',
      features: [
        'Análise completa do seu perfil',
        'Estratégias personalizadas',
        'Acompanhamento mensal',
        'Suporte via WhatsApp'
      ],
      price: 'R$ 997',
      popular: true
    },
    {
      icon: '👥',
      title: 'Consultoria em Grupo',
      description: 'Sessões em grupo com foco em estratégias gerais',
      features: [
        'Sessões semanais em grupo',
        'Material exclusivo',
        'Networking com outros viajantes',
        'Suporte por email'
      ],
      price: 'R$ 497',
      popular: false
    },
    {
      icon: '🚀',
      title: 'Consultoria VIP',
      description: 'Atendimento premium com acesso total ao especialista',
      features: [
        'Atendimento 24/7',
        'Videochamadas ilimitadas',
        'Planejamento de viagens',
        'Acesso ao grupo VIP'
      ],
      price: 'R$ 2.497',
      popular: false
    }
  ];

  const benefits = [
    {
      icon: '📈',
      title: 'Aumento de 300% no acúmulo',
      description: 'Estratégias que triplicam sua velocidade de acúmulo de milhas'
    },
    {
      icon: '✈️',
      title: 'Viagens em classe executiva',
      description: 'Aprenda a sempre viajar com conforto e elegância'
    },
    {
      icon: '💰',
      title: 'Economia de até 90%',
      description: 'Reduza drasticamente seus gastos com passagens aéreas'
    },
    {
      icon: '🌍',
      title: 'Destinos dos sonhos',
      description: 'Realize viagens que pareciam impossíveis financeiramente'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Consultoria Exclusiva em Milhas
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-4xl mx-auto">
            Transforme sua forma de viajar com estratégias personalizadas do maior especialista em milhas do Brasil
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="https://api.whatsapp.com/message/JWDP3GJGOFWAB1?autoload=1&app_absent=0" 
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg"
            >
              📱 Quero uma Consultoria
            </a>
            <Link 
              to="/fale-comigo"
              className="btn-primary bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 text-lg"
            >
              💬 Tirar Dúvidas
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Por que escolher minha consultoria?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Mais de 15 anos de experiência e 100+ milhões de milhas acumuladas
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-lg p-6 text-center transform transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">{benefit.icon}</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Escolha o Plano Ideal para Você
            </h2>
            <p className="text-xl text-gray-600">
              Diferentes opções para diferentes necessidades e orçamentos
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div key={index} className={`relative bg-white rounded-2xl shadow-lg p-8 transform transition-all duration-300 hover:-translate-y-2 hover:shadow-xl ${service.popular ? 'ring-2 ring-blue-500 scale-105' : ''}`}>
                {service.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      Mais Popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">{service.icon}</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{service.title}</h3>
                  <p className="text-gray-600 mb-4">{service.description}</p>
                  <div className="text-3xl font-bold text-blue-600">{service.price}</div>
                </div>

                <ul className="space-y-3 mb-8">
                  {service.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <span className="text-green-500 mr-3">✓</span>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <a
                  href="https://api.whatsapp.com/message/JWDP3GJGOFWAB1?autoload=1&app_absent=0"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors duration-200 text-center block ${
                    service.popular 
                      ? 'bg-blue-600 text-white hover:bg-blue-700' 
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  Escolher Plano
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Como Funciona a Consultoria
            </h2>
            <p className="text-xl text-gray-600">
              Um processo estruturado para maximizar seus resultados
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: '1', title: 'Análise Inicial', description: 'Avaliamos seu perfil e objetivos de viagem' },
              { step: '2', title: 'Estratégia Personalizada', description: 'Criamos um plano específico para você' },
              { step: '3', title: 'Implementação', description: 'Te guiamos na execução das estratégias' },
              { step: '4', title: 'Acompanhamento', description: 'Monitoramos e ajustamos conforme necessário' }
            ].map((process, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {process.step}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{process.title}</h3>
                <p className="text-gray-600">{process.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Pronto para Transformar Suas Viagens?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Junte-se aos mais de 10.000 clientes que já descobriram o poder das milhas
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="https://api.whatsapp.com/message/JWDP3GJGOFWAB1?autoload=1&app_absent=0" 
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary bg-white text-blue-600 hover:bg-gray-100 px-8 py-3"
            >
              📱 Começar Agora
            </a>
            <Link 
              to="/depoimentos"
              className="btn-primary bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3"
            >
              👥 Ver Depoimentos
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Consultoria;
