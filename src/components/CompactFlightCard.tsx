import React from 'react';
import { getAirlineLogo } from '../utils/airlineLogos';

interface CompactFlightCardProps {
  flight: any;
  onChangeClick?: () => void;
  fromLabel?: string;
  toLabel?: string;
}

/**
 * Formata hora no formato HH:MM a partir de string ISO ou Date
 */
const formatTime = (dateStr: string | Date): string => {
  try {
    const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '--:--';
  }
};

/**
 * Formata valor monetário em BRL
 */
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  }).format(value);
};

/**
 * Formata milhas com separador de milhares
 */
const formatMiles = (miles: number): string => {
  return new Intl.NumberFormat('pt-BR').format(Math.round(miles));
};

/**
 * Calcula duração entre dois horários
 */
const getDuration = (start: string | Date, end: string | Date): string => {
  try {
    const startDate = typeof start === 'string' ? new Date(start) : start;
    const endDate = typeof end === 'string' ? new Date(end) : end;
    const diff = endDate.getTime() - startDate.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  } catch {
    return '--h --m';
  }
};

/**
 * Extrai horário de um segmento de voo
 */
const extractTimeFromSegment = (segment: any, type: 'departure' | 'arrival'): string => {
  if (!segment) return '--:--';

  if (type === 'departure') {
    return formatTime(segment.departureTime || segment.dataHoraSaida || segment.departure_time || '');
  } else {
    return formatTime(segment.arrivalTime || segment.dataHoraChegada || segment.arrival_time || '');
  }
};

const CompactFlightCard: React.FC<CompactFlightCardProps> = ({
  flight,
  onChangeClick,
  fromLabel = 'IDA',
  toLabel = 'VOLTA',
}) => {
  if (!flight) return null;

  // Extrai dados do voo
  const segments = flight.segments || flight.trechos || [];
  const firstSegment = segments[0];
  const lastSegment = segments[segments.length - 1];

  const departureTime = firstSegment ? extractTimeFromSegment(firstSegment, 'departure') : '--:--';
  const arrivalTime = lastSegment ? extractTimeFromSegment(lastSegment, 'arrival') : '--:--';

  const originIATA = firstSegment?.origin || firstSegment?.origem || flight.origin || '???';
  const destinationIATA = lastSegment?.destination || lastSegment?.destino || flight.destination || '???';

  const duration = firstSegment && lastSegment
    ? getDuration(
        firstSegment.departureTime || firstSegment.dataHoraSaida || '',
        lastSegment.arrivalTime || lastSegment.dataHoraChegada || ''
      )
    : '--h --m';

  const connections = segments.length > 1 ? segments.length - 1 : 0;
  const connectionsText = connections === 0
    ? 'Direto'
    : connections === 1
      ? '1 conexão'
      : `${connections} conexões`;

  const airline = flight.airline || flight.cia || flight.companhia || flight.Cia?.Nome || 'Companhia';
  const airlineLogo = getAirlineLogo(airline);

  const price = flight.priceWithTax || flight.totalPrice || flight.price || flight.preco || 0;
  const miles = flight.miles || flight.milhas || (price * 100); // Fallback: 100 milhas por R$1

  return (
    <div className="bg-gradient-to-r from-green-50 to-green-100 border-l-4 border-green-500 rounded-xl shadow-md hover:shadow-lg transition-shadow p-4">
      <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
        {/* Indicador de seleção */}
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        {/* Logo da companhia */}
        <div className="flex-shrink-0">
          <img
            src={airlineLogo}
            alt={airline}
            className="h-8 w-auto object-contain"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
        </div>

        {/* Informações do voo */}
        <div className="flex-grow">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            {/* Horários */}
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-gray-900">{departureTime}</span>
              <span className="text-xs text-gray-500">{originIATA}</span>
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
              <span className="text-xs text-gray-500">{destinationIATA}</span>
              <span className="text-lg font-bold text-gray-900">{arrivalTime}</span>
            </div>

            {/* Duração e conexões */}
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {duration}
              </span>
              <span className="text-gray-400">•</span>
              <span>{connectionsText}</span>
            </div>
          </div>

          {/* Companhia */}
          <div className="mt-1 text-xs text-gray-500">
            {airline}
          </div>
        </div>

        {/* Preço e botão */}
        <div className="flex-shrink-0 flex flex-col items-end gap-2">
          <div className="text-right">
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(price)}
            </div>
            <div className="text-xs text-gray-500">
              ou {formatMiles(miles)} milhas
            </div>
          </div>

          {onChangeClick && (
            <button
              onClick={onChangeClick}
              className="px-4 py-2 text-sm font-medium text-green-700 bg-white border border-green-300 rounded-lg hover:bg-green-50 transition-colors"
            >
              Alterar
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompactFlightCard;
