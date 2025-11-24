import React from 'react';

interface Flight {
  segments: any[];
  price: number;
  priceWithTax: number;
  totalPrice: number;
  isMiles: boolean;
  airline: string;
  numeroVoo: string;
}

interface SelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  flight: Flight | null;
  title?: string;
  confirmLabel?: string;
}

const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
const formatMiles = (value: number) => `${value.toLocaleString('pt-BR')} milhas`;
const formatTime = (dateString?: string) => {
  if (!dateString) return '--:--';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return '--:--';
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
};

const SelectionModal: React.FC<SelectionModalProps> = ({ isOpen, onClose, onConfirm, flight, title, confirmLabel }) => {
  if (!isOpen || !flight) return null;

  const first = flight.segments?.[0] || {};
  const last = flight.segments?.[flight.segments?.length - 1] || {};
  const dep = first.departure || first.origem;
  const arr = last.arrival || last.destino;
  const depTime = formatTime(first.departureDate);
  const arrTime = formatTime(last.arrivalDate);
  const price = flight.priceWithTax || flight.price || flight.totalPrice || 0;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">{title || 'Confirmar seleção'}</h2>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gray-200 rounded-lg mr-4 flex items-center justify-center">
                  <img 
                    src={`https://logo.clearbit.com/${flight.airline?.toLowerCase()}.com`}
                    alt={flight.airline || 'Companhia'}
                    className="w-8 h-8 object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.nextElementSibling!.textContent = flight.airline?.charAt(0) || 'C';
                    }}
                  />
                  <span className="text-sm font-semibold text-gray-600">{flight.airline?.charAt(0) || 'C'}</span>
                </div>
                <div>
                  <div className="text-sm text-gray-600">{dep} → {arr}</div>
                  <div className="text-lg font-semibold text-gray-900">{depTime} • {arrTime}</div>
                  <div className="text-xs text-gray-500 mt-1">Operado por {flight.airline || 'Companhia'}</div>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-lg font-bold ${flight.isMiles ? 'text-blue-700' : 'text-green-700'}`}>
                  {flight.isMiles ? formatMiles(price) : formatCurrency(price)}
                </div>
                <div className={`text-xs mt-1 inline-block px-2 py-1 rounded-full ${flight.isMiles ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                  {flight.isMiles ? 'Milhas' : 'Dinheiro'}
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 px-4 py-3 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">Cancelar</button>
            <button onClick={onConfirm} className="flex-1 px-4 py-3 rounded-lg bg-green-600 text-white hover:bg-green-700">{confirmLabel || 'Escolher'}</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectionModal;
