import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

interface Booking {
  id: string;
  guestName: string;
  email: string;
  phone: string;
  hotelName: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  roomType: string;
  guests: number;
  totalPrice: number;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  createdAt: string;
}

interface Filters {
  guestName: string;
  status: string;
  dateFrom: string;
}

const BookingManagement: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  
  const [filters, setFilters] = useState<Filters>({
    guestName: '',
    status: '',
    dateFrom: ''
  });

  // Mock data - in real app, this would come from API
  const mockBookings: Booking[] = [
    {
      id: 'BK-2023-001',
      guestName: 'João Silva',
      email: 'joao@email.com',
      phone: '+55 11 99999-9999',
      hotelName: 'Hotel Copacabana',
      checkIn: '2024-01-15',
      checkOut: '2024-01-20',
      nights: 5,
      roomType: 'Deluxe Ocean View',
      guests: 2,
      totalPrice: 2500,
      status: 'confirmed',
      createdAt: '2024-01-10'
    },
    {
      id: 'BK-2023-002',
      guestName: 'Maria Santos',
      email: 'maria@email.com',
      phone: '+55 21 88888-8888',
      hotelName: 'Pousada Búzios',
      checkIn: '2024-02-01',
      checkOut: '2024-02-05',
      nights: 4,
      roomType: 'Standard',
      guests: 1,
      totalPrice: 800,
      status: 'pending',
      createdAt: '2024-01-25'
    },
    {
      id: 'BK-2023-003',
      guestName: 'Pedro Oliveira',
      email: 'pedro@email.com',
      phone: '+55 31 77777-7777',
      hotelName: 'Resort Gramado',
      checkIn: '2024-01-10',
      checkOut: '2024-01-12',
      nights: 2,
      roomType: 'Suite Master',
      guests: 4,
      totalPrice: 1200,
      status: 'completed',
      createdAt: '2024-01-05'
    }
  ];

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setBookings(mockBookings);
    } catch (err) {
      setError('Failed to load bookings. Please try again.');
      console.error('Error fetching bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesGuest = !filters.guestName || 
      booking.guestName.toLowerCase().includes(filters.guestName.toLowerCase());
    const matchesStatus = !filters.status || booking.status === filters.status;
    const matchesDate = !filters.dateFrom || booking.checkIn >= filters.dateFrom;
    
    return matchesGuest && matchesStatus && matchesDate;
  });

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getStatusClass = (status: string): string => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const viewBooking = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowBookingModal(true);
  };

  const cancelBooking = async (booking: Booking) => {
    if (window.confirm(`Are you sure you want to cancel booking ${booking.id}?`)) {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setBookings(prev => prev.map(b => 
          b.id === booking.id ? { ...b, status: 'cancelled' as const } : b
        ));
        
        toast.success('Booking cancelled successfully');
      } catch (error) {
        toast.error('Failed to cancel booking');
      }
    }
  };

  const exportBookings = () => {
    const csvData = filteredBookings.map(booking => ({
      'Booking ID': booking.id,
      'Guest Name': booking.guestName,
      'Email': booking.email,
      'Hotel': booking.hotelName,
      'Check In': booking.checkIn,
      'Check Out': booking.checkOut,
      'Nights': booking.nights,
      'Total': `$${booking.totalPrice}`,
      'Status': booking.status
    }));

    const csvContent = "data:text/csv;charset=utf-8," 
      + Object.keys(csvData[0] || {}).join(",") + "\n"
      + csvData.map(row => Object.values(row).join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "bookings.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Bookings exported successfully');
  };

  const handleFilterChange = (field: keyof Filters, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">📋 Gerenciamento de Reservas</h1>
          <p className="text-gray-600 mt-2">Visualize e gerencie suas reservas de hotel</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Search/Filter Bar */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Buscar por Hóspede</label>
              <input
                type="text"
                placeholder="Nome do hóspede"
                value={filters.guestName}
                onChange={(e) => handleFilterChange('guestName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos os Status</option>
                <option value="confirmed">Confirmada</option>
                <option value="pending">Pendente</option>
                <option value="cancelled">Cancelada</option>
                <option value="completed">Concluída</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data A Partir De</label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={fetchBookings}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? 'Carregando...' : 'Buscar'}
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Bookings List */}
        {filteredBookings.length > 0 ? (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">
                {filteredBookings.length} Reserva{filteredBookings.length !== 1 ? 's' : ''}
              </h2>
              <div className="flex space-x-2">
                <button
                  onClick={exportBookings}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  📊 Exportar CSV
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID da Reserva
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Hóspede
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Hotel
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Datas
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredBookings.map((booking) => (
                      <tr key={booking.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {booking.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{booking.guestName}</div>
                          <div className="text-sm text-gray-500">{booking.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {booking.hotelName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(booking.checkIn)} - {formatDate(booking.checkOut)}
                          <div className="text-xs text-gray-500">{booking.nights} noite{booking.nights !== 1 ? 's' : ''}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          R$ {booking.totalPrice.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusClass(booking.status)}`}>
                            {booking.status === 'confirmed' ? 'Confirmada' :
                             booking.status === 'pending' ? 'Pendente' :
                             booking.status === 'cancelled' ? 'Cancelada' : 'Concluída'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => viewBooking(booking)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Ver
                            </button>
                            {booking.status === 'confirmed' && (
                              <button
                                onClick={() => cancelBooking(booking)}
                                className="text-red-600 hover:text-red-900"
                              >
                                Cancelar
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : !loading ? (
          /* Empty State */
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📋</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma reserva encontrada</h3>
            <p className="text-gray-600">Não há reservas que correspondam aos seus critérios.</p>
          </div>
        ) : null}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}
      </div>

      {/* Booking Detail Modal */}
      {showBookingModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Detalhes da Reserva</h3>
              <button
                onClick={() => setShowBookingModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">ID da Reserva</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedBooking.id}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <span className={`inline-block mt-1 px-2 py-1 text-xs font-semibold rounded-full ${getStatusClass(selectedBooking.status)}`}>
                    {selectedBooking.status === 'confirmed' ? 'Confirmada' :
                     selectedBooking.status === 'pending' ? 'Pendente' :
                     selectedBooking.status === 'cancelled' ? 'Cancelada' : 'Concluída'}
                  </span>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium text-gray-900 mb-2">Informações do Hóspede</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nome</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedBooking.guestName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedBooking.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Telefone</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedBooking.phone}</p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium text-gray-900 mb-2">Detalhes da Reserva</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Hotel</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedBooking.hotelName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tipo de Quarto</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedBooking.roomType}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Check-in</label>
                    <p className="mt-1 text-sm text-gray-900">{formatDate(selectedBooking.checkIn)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Check-out</label>
                    <p className="mt-1 text-sm text-gray-900">{formatDate(selectedBooking.checkOut)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Noites</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedBooking.nights}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Hóspedes</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedBooking.guests}</p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-medium text-gray-900">Total:</span>
                  <span className="text-lg font-bold text-green-600">R$ {selectedBooking.totalPrice.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex space-x-3">
              <button
                onClick={() => setShowBookingModal(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400"
              >
                Fechar
              </button>
              {selectedBooking.status === 'confirmed' && (
                <button
                  onClick={() => {
                    cancelBooking(selectedBooking);
                    setShowBookingModal(false);
                  }}
                  className="flex-1 bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700"
                >
                  Cancelar Reserva
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingManagement;
