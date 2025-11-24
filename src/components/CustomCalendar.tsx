import React, { useState, useEffect } from 'react';
// REQ-01: Removido imports não utilizados após remoção de restrições de data
// import { useAuth } from '../context/AuthContext';
// import { useUserPlan } from '../hooks/useUserPlan';
// import PremiumUpgradeModal from './PremiumUpgradeModal';

interface CustomCalendarProps {
  onDateSelect: (date: Date) => void;
  onClose: () => void;
  selectedDate?: string;
  minDate?: Date;
  title?: string;
}

const CustomCalendar: React.FC<CustomCalendarProps> = ({
  onDateSelect,
  onClose,
  selectedDate,
  minDate,
  title = "Selecionar data"
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);
  // REQ-01: Removido state de modal premium e restrições

  useEffect(() => {
    if (selectedDate) {
      setCurrentMonth(new Date(selectedDate));
    }
  }, [selectedDate]);

  // Componente sempre renderizado quando instanciado (condição já aplicada no Home)

  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const weekDays = ['2ª', '3ª', '4ª', '5ª', '6ª', 'Sá', 'Do'];

  const today = new Date();
  const minDateObj = minDate || today;

  // REQ-01: Busca ilimitada para TODOS os usuários (free/basic/pro)
  // Removido limite de 30 dias

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = (firstDay.getDay() + 6) % 7; // Adjust for Monday start

    const days: (number | null)[] = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  };

  const formatDate = (year: number, month: number, day: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const isDateDisabled = (year: number, month: number, day: number) => {
    const date = new Date(year, month, day);

    // Only disable dates that are before minimum allowed date (past dates)
    if (date < minDateObj) {
      return true;
    }

    return false;
  };

  // REQ-01: Sem restrições de data - todos podem buscar qualquer data futura
  const isDateRestricted = (year: number, month: number, day: number) => {
    return false; // Sempre permite todas as datas futuras
  };

  const isDateSelected = (year: number, month: number, day: number) => {
    if (!selectedDate) return false;
    const dateStr = formatDate(year, month, day);
    return dateStr === selectedDate;
  };

  const isToday = (year: number, month: number, day: number) => {
    return (
      year === today.getFullYear() &&
      month === today.getMonth() &&
      day === today.getDate()
    );
  };

  const handleDateClick = (day: number, monthOffset: number = 0) => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth() + monthOffset;

    // REQ-01: Sem verificação de restrição - todas as datas futuras permitidas
    if (!isDateDisabled(year, month, day)) {
      const selectedDate = new Date(year, month, day, 12, 0, 0, 0);
      onDateSelect(selectedDate);
      // NÃO chama onClose() aqui - deixa o componente pai decidir
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const renderMonth = (monthOffset: number) => {
    const monthDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + monthOffset, 1);
    const days = getDaysInMonth(monthDate);
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();

    return (
      <div className="flex-1">
        {/* Month header */}
        <div className="text-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            {months[month]} {year}
          </h3>
        </div>

        {/* Week days header */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map(day => (
            <div key={day} className="text-center text-xs font-medium text-gray-500 py-1">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => {
            if (day === null) {
              return <div key={index} className="h-8"></div>;
            }

            const disabled = isDateDisabled(year, month, day);
            const selected = isDateSelected(year, month, day);
            const todayDate = isToday(year, month, day);
            const dateStr = formatDate(year, month, day);

            return (
              <button
                key={day}
                onClick={() => handleDateClick(day, monthOffset)}
                onMouseEnter={() => setHoveredDate(dateStr)}
                onMouseLeave={() => setHoveredDate(null)}
                disabled={disabled}
                className={`
                  h-8 w-8 rounded text-sm transition-all duration-200 flex items-center justify-center relative
                  ${disabled
                    ? 'text-gray-300 cursor-not-allowed'
                    : 'text-gray-700 cursor-pointer'
                  }
                  ${selected
                    ? 'bg-red-500 text-white hover:bg-red-600 font-medium border-2 border-red-600'
                    : ''
                  }
                  ${todayDate && !selected
                    ? 'bg-blue-50 text-blue-600 font-semibold border border-blue-200'
                    : ''
                  }
                  ${hoveredDate === dateStr && !selected && !disabled
                    ? 'border-2 border-gray-800'
                    : ''
                  }
                `}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Main content container */}
        <div className="relative">
          {/* Navigation header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <div className="text-sm text-gray-500 font-medium">{title}</div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => navigateMonth('next')}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
              
              <button
                onClick={onClose}
                className="p-2 hover:bg-red-100 rounded-full transition-colors"
                aria-label="Fechar calendário"
              >
                <svg className="w-5 h-5 text-gray-600 hover:text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Two months side by side (desktop) or one month (mobile) */}
          <div className="flex flex-col md:flex-row p-4 md:p-6 gap-4 md:gap-8">
            {renderMonth(0)}
            <div className="hidden md:block">
              {renderMonth(1)}
            </div>
          </div>

          {/* Bottom section with search button */}
          <div className="p-4 border-t border-gray-100">
            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="px-8 py-3 bg-red-500 text-white rounded-md font-medium hover:bg-red-600 transition-colors shadow-lg"
              >
                Procurar voos
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* REQ-01: Modal premium removido - todas as datas são permitidas */}
    </div>
  );
};

export default CustomCalendar;
