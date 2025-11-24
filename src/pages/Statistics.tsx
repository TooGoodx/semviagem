import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const Statistics: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Sample data
  const monthlyData = [
    { month: 'Jan', users: 1200, revenue: 45000, flights: 3200 },
    { month: 'Fev', users: 1900, revenue: 58000, flights: 4100 },
    { month: 'Mar', users: 2800, revenue: 72000, flights: 5600 },
    { month: 'Abr', users: 3900, revenue: 89000, flights: 7200 },
    { month: 'Mai', users: 4800, revenue: 94000, flights: 8100 },
    { month: 'Jun', users: 5200, revenue: 112000, flights: 9300 },
  ];

  const trafficSources = [
    { name: 'Google', value: 45, color: '#4285F4' },
    { name: 'Facebook', value: 25, color: '#1877F2' },
    { name: 'Direto', value: 20, color: '#FF6B6B' },
    { name: 'Outros', value: 10, color: '#95A5A6' },
  ];

  const topDestinations = [
    { city: 'São Paulo', bookings: 2450, revenue: 89000 },
    { city: 'Rio de Janeiro', bookings: 1890, revenue: 67000 },
    { city: 'Brasília', bookings: 1340, revenue: 45000 },
    { city: 'Salvador', bookings: 980, revenue: 32000 },
    { city: 'Fortaleza', bookings: 750, revenue: 28000 },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent border-solid rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700">Carregando Estatísticas...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">📊 Estatísticas e Analytics</h1>
          <p className="mt-2 text-gray-600">Acompanhe o desempenho da sua plataforma de viagens</p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow mb-8">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {[
              { id: 'overview', name: 'Visão Geral', icon: '📈' },
              { id: 'users', name: 'Usuários', icon: '👥' },
              { id: 'revenue', name: 'Receita', icon: '💰' },
              { id: 'flights', name: 'Voos', icon: '✈️' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.icon} {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500">Usuários Ativos</p>
                    <p className="text-2xl font-bold text-gray-900">5,247</p>
                    <div className="flex items-center mt-2">
                      <span className="text-green-500 text-sm font-medium">+12%</span>
                      <span className="text-gray-500 text-sm ml-2">vs mês anterior</span>
                    </div>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <span className="text-2xl">👥</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500">Receita Total</p>
                    <p className="text-2xl font-bold text-gray-900">R$ 112.5K</p>
                    <div className="flex items-center mt-2">
                      <span className="text-green-500 text-sm font-medium">+18%</span>
                      <span className="text-gray-500 text-sm ml-2">vs mês anterior</span>
                    </div>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <span className="text-2xl">💰</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500">Voos Reservados</p>
                    <p className="text-2xl font-bold text-gray-900">9,347</p>
                    <div className="flex items-center mt-2">
                      <span className="text-green-500 text-sm font-medium">+15%</span>
                      <span className="text-gray-500 text-sm ml-2">vs mês anterior</span>
                    </div>
                  </div>
                  <div className="p-3 bg-yellow-100 rounded-full">
                    <span className="text-2xl">✈️</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500">Taxa de Conversão</p>
                    <p className="text-2xl font-bold text-gray-900">3.2%</p>
                    <div className="flex items-center mt-2">
                      <span className="text-green-500 text-sm font-medium">+0.5%</span>
                      <span className="text-gray-500 text-sm ml-2">vs mês anterior</span>
                    </div>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-full">
                    <span className="text-2xl">📊</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Crescimento Mensal</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="users" stroke="#3B82F6" strokeWidth={2} />
                    <Line type="monotone" dataKey="flights" stroke="#10B981" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Fontes de Tráfego</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={trafficSources}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({name, value}) => `${name}: ${value}%`}
                    >
                      {trafficSources.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Top Destinations */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Top Destinos</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cidade
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Reservas
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Receita
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {topDestinations.map((destination, index) => (
                      <tr key={destination.city}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="text-lg mr-3">
                              {index === 0 && '🥇'}
                              {index === 1 && '🥈'}
                              {index === 2 && '🥉'}
                              {index > 2 && '🏢'}
                            </span>
                            <div className="text-sm font-medium text-gray-900">
                              {destination.city}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {destination.bookings.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          R$ {destination.revenue.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Other tabs content */}
        {activeTab !== 'overview' && (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              Dados de {activeTab === 'users' ? 'Usuários' : activeTab === 'revenue' ? 'Receita' : 'Voos'}
            </h3>
            <p className="text-gray-600">
              Estatísticas detalhadas para {activeTab === 'users' ? 'usuários' : activeTab === 'revenue' ? 'receita' : 'voos'} em breve.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Statistics;
