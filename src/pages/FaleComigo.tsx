import React, { useState } from 'react';
import toast from 'react-hot-toast';

interface ContactForm {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

const FaleComigo: React.FC = () => {
  const [form, setForm] = useState<ContactForm>({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Simular envio do formulário
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success('Mensagem enviada com sucesso! Retornaremos em breve.');
      setForm({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
    } catch (error) {
      toast.error('Erro ao enviar mensagem. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const contactMethods = [
    {
      icon: '📱',
      title: 'WhatsApp',
      description: 'Fale comigo diretamente',
      link: 'https://api.whatsapp.com/message/JWDP3GJGOFWAB1?autoload=1&app_absent=0',
      color: 'bg-green-500'
    },
    {
      icon: '📸',
      title: 'Instagram',
      description: '@juliomartins__',
      link: 'https://www.instagram.com/juliomartins__/',
      color: 'bg-pink-500'
    },
    {
      icon: '🎥',
      title: 'YouTube',
      description: 'Canal Júlio Martins',
      link: 'https://www.youtube.com/@juliomartinsmilhas',
      color: 'bg-red-500'
    },
    {
      icon: '✈️',
      title: 'Consultoria',
      description: 'Atendimento exclusivo',
      link: 'https://juliomartins.my.canva.site/simple-dark-fashion-bio-link-website-black-and-white-in-modern-style',
      color: 'bg-blue-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Fale Comigo
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Tem alguma dúvida sobre milhas e viagens? Entre em contato! Estou aqui para ajudar você a realizar seus sonhos de viagem.
          </p>
        </div>

        {/* Contact Methods */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {contactMethods.map((method, index) => (
            <a
              key={index}
              href={method.link}
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-white rounded-2xl shadow-lg p-6 text-center transform transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
            >
              <div className={`w-16 h-16 ${method.color} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <span className="text-2xl">{method.icon}</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{method.title}</h3>
              <p className="text-gray-600">{method.description}</p>
            </a>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Envie uma mensagem
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Nome completo *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={form.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Seu nome"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={form.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="seu@email.com"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Telefone
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={form.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="(11) 99999-9999"
                  />
                </div>
                
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                    Assunto *
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    required
                    value={form.subject}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Selecione um assunto</option>
                    <option value="consultoria">Consultoria em Milhas</option>
                    <option value="treinamento">Treinamentos</option>
                    <option value="grupo">Grupo Exclusivo</option>
                    <option value="duvida">Dúvida Geral</option>
                    <option value="parceria">Parceria</option>
                    <option value="outro">Outro</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Mensagem *
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={5}
                  value={form.message}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Descreva sua dúvida ou solicitation..."
                ></textarea>
              </div>
              
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Enviando...
                  </span>
                ) : (
                  '📤 Enviar Mensagem'
                )}
              </button>
            </form>
          </div>

          {/* Contact Info */}
          <div className="space-y-8">
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
              <h2 className="text-2xl font-bold mb-6">Informações de Contato</h2>
              
              <div className="space-y-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mr-4">
                    <span className="text-2xl">📧</span>
                  </div>
                  <div>
                    <p className="font-semibold">Email</p>
                    <p className="text-blue-100">contato@juliomartins.com</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mr-4">
                    <span className="text-2xl">📱</span>
                  </div>
                  <div>
                    <p className="font-semibold">WhatsApp</p>
                    <p className="text-blue-100">Atendimento personalizado</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mr-4">
                    <span className="text-2xl">⏰</span>
                  </div>
                  <div>
                    <p className="font-semibold">Horário de Atendimento</p>
                    <p className="text-blue-100">Segunda a Sexta, 9h às 18h</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Por que falar comigo?</h3>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <span className="text-green-500 text-xl mr-3">✓</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">Experiência Comprovada</h4>
                    <p className="text-gray-600 text-sm">Mais de 15 anos no mercado de milhas</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <span className="text-green-500 text-xl mr-3">✓</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">Estratégias Exclusivas</h4>
                    <p className="text-gray-600 text-sm">Métodos únicos para maximizar suas milhas</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <span className="text-green-500 text-xl mr-3">✓</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">Suporte Personalizado</h4>
                    <p className="text-gray-600 text-sm">Atendimento individual para suas necessidades</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FaleComigo;
