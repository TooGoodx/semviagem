import React from 'react';
import { redirectToStripeCheckout } from '../lib/stripe';

interface StripeCheckoutProps {
  className?: string;
  children?: React.ReactNode;
}

const StripeCheckout: React.FC<StripeCheckoutProps> = ({ 
  className = '', 
  children = 'Comprar Agora' 
}) => {
  const handleCheckout = () => {
    try {
      redirectToStripeCheckout();
    } catch (error) {
      console.error('Erro ao redirecionar para checkout:', error);
      alert('Erro ao processar pagamento. Tente novamente.');
    }
  };

  return (
    <button
      onClick={handleCheckout}
      className={`
        bg-blue-600 hover:bg-blue-700 
        text-white font-semibold 
        py-3 px-6 rounded-lg 
        transition-colors duration-200 
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
    >
      {children}
    </button>
  );
};

export default StripeCheckout;
