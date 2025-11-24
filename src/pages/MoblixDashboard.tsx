import React, { useState, useEffect } from 'react';
import moblixService from '../services/moblixService';

interface DashboardData {
  totalBalance: number;
  availableMiles: number;
  totalTransactions: number;
  activeClients: number;
  balanceTrend: number;
  milesTrend: number;
  transactionsTrend: number;
  clientsTrend: number;
}

interface LoyaltyProgram {
  id: number;
  name: string;
  miles: string;
  icon: string;
  trend: number;
}

interface Transaction {
  id: number;
  date: Date;
  description: string;
  program: string;
  type: string;
  amount: number;
  status: string;
}

interface MonthlyBalance {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
    tension: number;
    fill: boolean;
  }>;
}

const MoblixDashboard: React.FC = () => {
  const [authStatus, setAuthStatus] = useState('Carregando...');
  const [isLoading, setIsLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    totalBalance: 0,
    availableMiles: 0,
    totalTransactions: 0,
    activeClients: 0,
    balanceTrend: 0,
    milesTrend: 0,
    transactionsTrend: 0,
    clientsTrend: 0
  });

  // Dados para o gráfico de saldo mensal
  const [monthlyBalance, setMonthlyBalance] = useState<MonthlyBalance>({
    labels: [],
    datasets: [
      {
        label: 'Saldo (R$)',
        data: [],
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.3,
        fill: true
      }
    ]
  });

  // Programas de fidelidade
  const [loyaltyPrograms] = useState<LoyaltyProgram[]>([
    { id: 1, name: 'LATAM Fidelidade', miles: '25,000', icon: '✈️', trend: 5.2 },
    { id: 2, name: 'Smiles', miles: '18,500', icon: '😊', trend: 12.7 },
    { id: 3, name: 'TudoAzul', miles: '32,100', icon: '🔵', trend: -2.3 },
    { id: 4, name: 'Azul Fidelidade', miles: '14,200', icon: '🔷', trend: 8.9 }
  ]);

  // Transações recentes
  const [recentTransactions] = useState<Transaction[]>([
    { 
      id: 1, 
      date: new Date(), 
      description: 'Compra de milhas', 
      program: 'Smiles', 
      type: 'Crédito', 
      amount: 5000, 
      status: 'Concluído' 
    },
    { 
      id: 2, 
      date: new Date(Date.now() - 86400000), 
      description: 'Transferência para cliente', 
      program: 'TudoAzul', 
      type: 'Débito', 
      amount: -2000, 
      status: 'Concluído' 
    },
    { 
      id: 3, 
      date: new Date(Date.now() - 172800000), 
      description: 'Resgate de prêmio', 
      program: 'LATAM Fidelidade', 
      type: 'Débito', 
      amount: -4500, 
      status: 'Pendente' 
    },
    { 
      id: 4, 
      date: new Date(Date.now() - 259200000), 
      description: 'Bônus de fidelidade', 
      program: 'Azul Fidelidade', 
      type: 'Crédito', 
      amount: 1000, 
      status: 'Concluído' 
    },
    { 
      id: 5, 
      date: new Date(Date.now() - 345600000), 
      description: 'Compra de milhas', 
      program: 'Smiles', 
      type: 'Crédito', 
      amount: 3000, 
      status: 'Concluído' 
    }
  ]);

  // Estados dos modais
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [showReportsModal, setShowReportsModal] = useState(false);

  // Funções para abrir/fechar modais
  const openTransferModal = () => setShowTransferModal(true);
  const closeTransferModal = () => setShowTransferModal(false);
  const openBuyModal = () => setShowBuyModal(true);
  const closeBuyModal = () => setShowBuyModal(false);
  const openRedeemModal = () => setShowRedeemModal(true);
  const closeRedeemModal = () => setShowRedeemModal(false);
  const openReportsModal = () => setShowReportsModal(true);
  const closeReportsModal = () => setShowReportsModal(false);

  // Funções para lidar com as ações dos modais
  const handleTransfer = async (transferData: any) => {
    try {
      // Implementar lógica de transferência
      console.log('Transferindo:', transferData);
      closeTransferModal();
      await refreshData();
    } catch (error) {
      console.error('Erro ao transferir:', error);
    }
  };

  const handleBuy = async (buyData: any) => {
    try {
      // Implementar lógica de compra
      console.log('Comprando:', buyData);
      closeBuyModal();
      await refreshData();
    } catch (error) {
      console.error('Erro ao comprar:', error);
    }
  };

  const handleRedeem = async (redeemData: any) => {
    try {
      // Implementar lógica de resgate
      console.log('Resgatando:', redeemData);
      closeRedeemModal();
      await refreshData();
    } catch (error) {
      console.error('Erro ao resgatar:', error);
    }
  };

  // Funções auxiliares
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('pt-BR').format(value);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const getTypeBadgeClass = (type: string) => {
    const classes: Record<string, string> = {
      'Crédito': 'bg-green-100 text-green-800',
      'Débito': 'bg-red-100 text-red-800',
      'Bônus': 'bg-yellow-100 text-yellow-800',
      'Taxa': 'bg-gray-100 text-gray-800'
    };
    return classes[type] || 'bg-gray-100 text-gray-800';
  };

  const getStatusBadgeClass = (status: string) => {
    const classes: Record<string, string> = {
      'Concluído': 'bg-green-100 text-green-800',
      'Pendente': 'bg-yellow-100 text-yellow-800',
      'Cancelado': 'bg-red-100 text-red-800',
      'Processando': 'bg-blue-100 text-blue-800'
    };
    return classes[status] || 'bg-gray-100 text-gray-800';
  };

  // Função para carregar dados da API
  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      setAuthStatus('Autenticado');
      
      // Simulando chamadas à API
      // Na implementação real, substitua por chamadas reais à API Moblix
      setTimeout(() => {
        setDashboardData({
          totalBalance: 12500.75,
          availableMiles: 85600,
          totalTransactions: 42,
          activeClients: 18,
          balanceTrend: 7.5,
          milesTrend: 12.3,
          transactionsTrend: 15.8,
          clientsTrend: 5.2
        });

        // Dados simulados para o gráfico de saldo mensal
        const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        const currentMonth = new Date().getMonth();
        const labels = [];
        const data = [];
        
        for (let i = 5; i >= 0; i--) {
          const monthIndex = (currentMonth - i + 12) % 12;
          labels.push(months[monthIndex]);
          data.push(Math.floor(Math.random() * 10000) + 5000);
        }
        
        setMonthlyBalance({
          labels,
          datasets: [{
            label: 'Saldo (R$)',
            data,
            borderColor: '#3B82F6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            tension: 0.3,
            fill: true
          }]
        });

        setIsLoading(false);
      }, 1000);
      
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
      setAuthStatus('Erro de autenticação');
      setIsLoading(false);
    }
  };

  // Função para atualizar os dados
  const refreshData = async () => {
    await loadDashboardData();
  };

  // Carrega os dados ao montar o componente
  useEffect(() => {
    loadDashboardData();
  }, []);

  // Componente DashboardCard
  const DashboardCard: React.FC<{
    title: string;
    value: string;
    icon: string;
    trend?: number;
    trendLabel?: string;
  }> = ({ title, value, icon, trend, trendLabel }) => (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <span className="text-2xl">{icon}</span>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">
                {title}
              </dt>
              <dd>
                <div className="text-lg font-medium text-gray-900">
                  {value}
                </div>
              </dd>
            </dl>
          </div>
        </div>
      </div>
      {trend && (
        <div className="bg-gray-50 px-5 py-3">
          <div className="text-sm">
            <span className={`font-medium ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend >= 0 ? '+' : ''}{trend}%
            </span>
            <span className="text-gray-500"> {trendLabel}</span>
          </div>
        </div>
      )}
    </div>
  );

  // Componente ActionCard
  const ActionCard: React.FC<{
    title: string;
    description: string;
    icon: string;
    buttonText: string;
    onClick: () => void;
  }> = ({ title, description, icon, buttonText, onClick }) => (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-6">
        <div className="flex items-center mb-4">
          <span className="text-2xl mr-3">{icon}</span>
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        </div>
        <p className="text-sm text-gray-600 mb-4">{description}</p>
        <button
          onClick={onClick}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          {buttonText}
        </button>
      </div>
    </div>
  );

  return (
    <div className="moblix-dashboard min-h-screen bg-gray-50 p-6">
      {/* Cabeçalho */}
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Painel Moblix</h1>
            <p className="text-gray-600">Gerencie suas operações de milhas e fidelidade</p>
          </div>
          <div className="flex items-center space-x-4">
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              {authStatus}
            </span>
            <button 
              onClick={refreshData}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
              disabled={isLoading}
            >
              {isLoading && (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {isLoading ? 'Atualizando...' : 'Atualizar Dados'}
            </button>
          </div>
        </div>

        {/* Cartões de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <DashboardCard 
            title="Saldo Total" 
            value={formatCurrency(dashboardData.totalBalance || 0)}
            icon="💳" 
            trend={dashboardData.balanceTrend}
            trendLabel="em relação ao mês passado"
          />
          <DashboardCard 
            title="Milhas Disponíveis" 
            value={formatNumber(dashboardData.availableMiles || 0)}
            icon="✈️"
            trend={dashboardData.milesTrend}
            trendLabel="últimos 30 dias"
          />
          <DashboardCard 
            title="Transações" 
            value={String(dashboardData.totalTransactions || 0)}
            icon="🔄"
            trend={dashboardData.transactionsTrend}
            trendLabel="este mês"
          />
          <DashboardCard 
            title="Clientes Ativos" 
            value={String(dashboardData.activeClients || 0)}
            icon="👥"
            trend={dashboardData.clientsTrend}
            trendLabel="último mês"
          />
        </div>

        {/* Gráficos e Tabelas */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Gráfico de Saldo Mensal */}
          <div className="bg-white p-6 rounded-lg shadow-sm lg:col-span-2">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Saldo Mensal</h3>
            <div className="h-64">
              {monthlyBalance.labels.length > 0 ? (
                <div className="h-full flex items-center justify-center text-gray-500">
                  Gráfico de saldo mensal (implementar com Chart.js)
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  Nenhum dado disponível
                </div>
              )}
            </div>
          </div>

          {/* Programas de Fidelidade */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Programas de Fidelidade</h3>
            <div className="space-y-4">
              {loyaltyPrograms.map((program) => (
                <div key={program.id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                      <span className="text-lg">{program.icon}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{program.name}</p>
                      <p className="text-sm text-gray-500">{program.miles} milhas</p>
                    </div>
                  </div>
                  <span className={`text-sm font-medium ${program.trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {program.trend >= 0 ? '+' : ''}{program.trend}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Últimas Transações */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Últimas Transações</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descrição</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(transaction.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{transaction.description}</div>
                      <div className="text-sm text-gray-500">{transaction.program}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getTypeBadgeClass(transaction.type)}`}>
                        {transaction.type}
                      </span>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${transaction.amount >= 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}`}>
                      {transaction.amount >= 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(transaction.status)}`}>
                        {transaction.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {recentTransactions.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                      Nenhuma transação encontrada
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="bg-gray-50 px-6 py-3 flex items-center justify-between border-t border-gray-200">
            <div className="flex-1 flex justify-between sm:hidden">
              <a href="#" className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"> Anterior </a>
              <a href="#" className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"> Próximo </a>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Mostrando <span className="font-medium">1</span> a <span className="font-medium">10</span> de <span className="font-medium">20</span> resultados
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <a href="#" className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                    <span className="sr-only">Anterior</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </a>
                  <a href="#" aria-current="page" className="z-10 bg-blue-50 border-blue-500 text-blue-600 relative inline-flex items-center px-4 py-2 border text-sm font-medium"> 1 </a>
                  <a href="#" className="bg-white border-gray-300 text-gray-500 hover:bg-gray-50 relative inline-flex items-center px-4 py-2 border text-sm font-medium"> 2 </a>
                  <a href="#" className="bg-white border-gray-300 text-gray-500 hover:bg-gray-50 relative inline-flex items-center px-4 py-2 border text-sm font-medium"> 3 </a>
                  <a href="#" className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                    <span className="sr-only">Próximo</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </a>
                </nav>
              </div>
            </div>
          </div>
        </div>

        {/* Seção de Ações Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <ActionCard 
            title="Transferir Milhas"
            description="Transfira milhas entre contas"
            icon="🔄"
            buttonText="Transferir"
            onClick={openTransferModal}
          />
          <ActionCard 
            title="Comprar Milhas"
            description="Adquira mais milhas"
            icon="🛒"
            buttonText="Comprar"
            onClick={openBuyModal}
          />
          <ActionCard 
            title="Resgatar Prêmios"
            description="Troque suas milhas por prêmios"
            icon="🎁"
            buttonText="Resgatar"
            onClick={openRedeemModal}
          />
          <ActionCard 
            title="Relatórios"
            description="Acesse relatórios detalhados"
            icon="📊"
            buttonText="Visualizar"
            onClick={openReportsModal}
          />
        </div>
      </div>

      {/* Modais - Implementação básica */}
      {showTransferModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg">
            <h3 className="text-lg font-medium mb-4">Transferir Milhas</h3>
            <p className="text-gray-600 mb-4">Modal de transferência de milhas</p>
            <button onClick={closeTransferModal} className="bg-gray-500 text-white px-4 py-2 rounded">
              Fechar
            </button>
          </div>
        </div>
      )}

      {showBuyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg">
            <h3 className="text-lg font-medium mb-4">Comprar Milhas</h3>
            <p className="text-gray-600 mb-4">Modal de compra de milhas</p>
            <button onClick={closeBuyModal} className="bg-gray-500 text-white px-4 py-2 rounded">
              Fechar
            </button>
          </div>
        </div>
      )}

      {showRedeemModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg">
            <h3 className="text-lg font-medium mb-4">Resgatar Prêmios</h3>
            <p className="text-gray-600 mb-4">Modal de resgate de prêmios</p>
            <button onClick={closeRedeemModal} className="bg-gray-500 text-white px-4 py-2 rounded">
              Fechar
            </button>
          </div>
        </div>
      )}

      {showReportsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg">
            <h3 className="text-lg font-medium mb-4">Relatórios</h3>
            <p className="text-gray-600 mb-4">Modal de relatórios</p>
            <button onClick={closeReportsModal} className="bg-gray-500 text-white px-4 py-2 rounded">
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MoblixDashboard;
