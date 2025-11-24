import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelection } from '../context/SelectionContext';
import FlightResultCard from '../components/FlightResultCard';

const Summary: React.FC = () => {
  const { selected, clear } = useSelection();
  const navigate = useNavigate();

  const handleClear = () => {
    clear();
    navigate('/flights');
  };

  const outbound = selected.outbound;
  const ret = selected.return;

  const getFromToLabels = (flight: any) => {
    if (!flight) return { from: undefined, to: undefined } as { from?: string; to?: string };
    const from = flight.Origem || flight.departure || flight?.segments?.[0]?.departure || flight?.segments?.[0]?.origem;
    const to = flight.Destino || flight.arrival || flight?.segments?.[flight?.segments?.length - 1]?.arrival || flight?.segments?.[flight?.segments?.length - 1]?.destino;
    return { from, to };
  };

  return (
    <div className="py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Resumo da Seleção</h1>
          <div className="flex gap-2">
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
            >
              Voltar
            </button>
            <button
              onClick={handleClear}
              className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700"
            >
              Limpar seleção
            </button>
          </div>
        </div>

        {(!outbound && !ret) && (
          <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800">
            Nenhum voo selecionado ainda. Volte para a página de resultados para escolher seus voos.
          </div>
        )}

        {outbound && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Voo de ida</h2>
            {(() => {
              const { from, to } = getFromToLabels(outbound);
              return (
                <FlightResultCard
                  flight={outbound as any}
                  isSelected={true}
                  selectionMessage="Selecionado como voo de ida"
                  fromLabel={from}
                  toLabel={to}
                />
              );
            })()}
          </div>
        )}

        {ret && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Voo de volta</h2>
            {(() => {
              const { from, to } = getFromToLabels(ret);
              return (
                <FlightResultCard
                  flight={ret as any}
                  isSelected={true}
                  selectionMessage="Selecionado como voo de volta"
                  fromLabel={from}
                  toLabel={to}
                />
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
};

export default Summary;
