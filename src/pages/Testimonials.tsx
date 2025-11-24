import React from 'react';

const Testimonials: React.FC = () => {
  const testimonials = [
    {
      id: 1,
      name: 'Maria Silva',
      role: 'Empresária',
      content: 'Graças ao Júlio, já viajei para 15 países em classe executiva gastando apenas as milhas que acumulei. Transformou completamente minha forma de viajar!',
      rating: 5,
      image: '👩‍💼'
    },
    {
      id: 2,
      name: 'Carlos Santos',
      role: 'Médico',
      content: 'As estratégias do Júlio são incríveis! Consegui levar minha família toda para a Europa em primeira classe usando milhas.',
      rating: 5,
      image: '👨‍⚕️'
    },
    {
      id: 3,
      name: 'Ana Costa',
      role: 'Advogada',
      content: 'Já economizei mais de R$ 50.000 em passagens seguindo as orientações do Júlio. Recomendo para todos!',
      rating: 5,
      image: '👩‍💼'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            O que dizem nossos clientes
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Mais de 10.000 pessoas já transformaram suas viagens com nossas estratégias exclusivas
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="bg-white rounded-2xl shadow-lg p-8 transform transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-2xl mr-4">
                  {testimonial.image}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{testimonial.name}</h3>
                  <p className="text-gray-600">{testimonial.role}</p>
                </div>
              </div>
              
              <div className="flex mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <span key={i} className="text-yellow-400 text-xl">⭐</span>
                ))}
              </div>
              
              <p className="text-gray-700 leading-relaxed italic">
                "{testimonial.content}"
              </p>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">
            Pronto para sua próxima aventura?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Junte-se aos milhares de viajantes que já descobriram o poder das milhas
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="https://www.instagram.com/juliomartins__/" 
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary bg-white text-blue-600 hover:bg-gray-100 px-8 py-3"
            >
              📱 Siga no Instagram
            </a>
            <a 
              href="https://juliomartins.my.canva.site/simple-dark-fashion-bio-link-website-black-and-white-in-modern-style" 
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3"
            >
              ✈️ Consultoria Exclusiva
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Testimonials;
