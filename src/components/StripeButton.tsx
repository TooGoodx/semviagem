import { useEffect, useState, useRef } from 'react';
import { STRIPE_CONFIG } from '../config/stripe';

const StripeButton = () => {
  // Re-enable Stripe with updated configuration
  const [isStripeDisabled] = useState(false);
  const [isStripeLoaded, setIsStripeLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const errorHandlerRef = useRef<((event: ErrorEvent) => void) | null>(null);

  // Use configuration from stripe.ts
  const props = {
    buttonId: import.meta.env.VITE_STRIPE_BUTTON_ID || 'buy_btn_1RyKDdRtN3YwSDWnNaQ2MkrB',
    publishableKey: STRIPE_CONFIG.publishableKey,
    checkoutUrl: import.meta.env.VITE_STRIPE_CHECKOUT_URL || 'https://buy.stripe.com/bJe14pgIRbhx6MT9gtdMI02'
  };

  // Early return if Stripe is disabled to prevent any script loading
  if (isStripeDisabled) {
    return (
      <div className="w-full" ref={containerRef}>
        <div className="mb-4">
          <div className="text-center mb-3">
            <p className="text-sm font-medium" style={{color: '#F0C72F'}}>
              💳 Pagamento Seguro
            </p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-blue-800 font-medium">
                Sistema de pagamento em manutenção
              </p>
            </div>
            <p className="text-xs text-blue-600 mb-3">
              Estamos atualizando nosso sistema de pagamentos para oferecer uma experiência ainda melhor
            </p>
            <button 
              onClick={() => {
                window.open(props.checkoutUrl, '_blank');
              }}
              className="bg-blue-500 hover:bg-blue-600 text-white text-sm px-4 py-2 rounded-lg transition-colors"
            >
              Ir para Checkout
            </button>
          </div>
        </div>
      </div>
    );
  }

  useEffect(() => {
    // Comprehensive error handler for all Stripe-related errors
    const handleGlobalError = (event: ErrorEvent) => {
      const message = event.message || '';
      const filename = event.filename || '';
      
      // Check for Stripe-related errors
      if (
        message.includes('payload') || 
        message.includes('buy-button') ||
        filename.includes('buy-button.js') ||
        filename.includes('stripe.com')
      ) {
        console.warn('🟡 Stripe error intercepted and handled:', message);
        setHasError(true);
        setErrorMessage('Sistema de pagamento temporariamente indisponível');
        event.preventDefault();
        event.stopPropagation();
        return true;
      }
      return false;
    };

    // Store reference for cleanup
    errorHandlerRef.current = handleGlobalError;
    
    // Add error listeners
    window.addEventListener('error', handleGlobalError, true);
    window.addEventListener('unhandledrejection', (event) => {
      if (event.reason && typeof event.reason === 'string' && event.reason.includes('payload')) {
        console.warn('🟡 Stripe promise rejection intercepted:', event.reason);
        setHasError(true);
        setErrorMessage('Sistema de pagamento temporariamente indisponível');
        event.preventDefault();
      }
    });

    return () => {
      if (errorHandlerRef.current) {
        window.removeEventListener('error', errorHandlerRef.current, true);
      }
    };
  }, []);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let intervalId: NodeJS.Timeout;

    const checkStripeLoaded = () => {
      try {
        return !!(window.customElements && window.customElements.get('stripe-buy-button'));
      } catch (error) {
        console.warn('🟡 Error checking Stripe custom elements:', error);
        return false;
      }
    };

    const initializeStripe = () => {
      // Reset error state
      setHasError(false);
      setErrorMessage('');

      // Check if already loaded
      if (checkStripeLoaded()) {
        console.log('✅ Stripe already loaded');
        setIsStripeLoaded(true);
        return;
      }

      // Set a timeout to prevent infinite loading
      timeoutId = setTimeout(() => {
        if (!isStripeLoaded) {
          console.warn('⚠️ Stripe loading timeout - showing fallback');
          setHasError(true);
          setErrorMessage('Carregando sistema de pagamento...');
        }
      }, 10000); // 10 seconds timeout

      // Check periodically for Stripe to load
      intervalId = setInterval(() => {
        if (checkStripeLoaded()) {
          console.log('✅ Stripe buy-button loaded successfully');
          setIsStripeLoaded(true);
          clearInterval(intervalId);
          clearTimeout(timeoutId);
        }
      }, 500);
    };

    // Start initialization
    initializeStripe();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (intervalId) clearInterval(intervalId);
    };
  }, [isStripeLoaded]);

  // Render error state
  if (hasError) {
    return (
      <div className="w-full" ref={containerRef}>
        <div className="mb-4">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <svg className="w-5 h-5 text-orange-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <p className="text-sm text-orange-800 font-medium">
                {errorMessage || 'Sistema de pagamento temporariamente indisponível'}
              </p>
            </div>
            <div className="flex gap-2 justify-center">
              <button 
                onClick={() => {
                  setHasError(false);
                  setErrorMessage('');
                  setIsStripeLoaded(false);
                }}
                className="text-xs text-orange-600 hover:text-orange-800 underline"
              >
                Tentar novamente
              </button>
              <span className="text-xs text-orange-400">•</span>
              <button 
                onClick={() => {
                  window.open(props.checkoutUrl, '_blank');
                }}
                className="text-xs text-orange-600 hover:text-orange-800 underline"
              >
                Checkout direto
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render loading state
  if (!isStripeLoaded) {
    return (
      <div className="w-full" ref={containerRef}>
        <div className="mb-4">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
            <div className="animate-pulse">
              <div className="h-12 bg-gray-200 rounded-lg mb-2"></div>
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="text-sm text-gray-600">Carregando sistema de pagamento...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render Stripe button with error boundary - UPDATED URLs
  return (
    <div className="w-full" ref={containerRef}>
      <div className="mb-4">
        <div className="text-center mb-3">
          <p className="text-sm font-medium" style={{color: '#F0C72F'}}>
            💳 Pagamento Seguro via Stripe
          </p>
        </div>
        <div className="stripe-button-container">
          <stripe-buy-button
            buy-button-id={props.buttonId}
            publishable-key={props.publishableKey}
          />
        </div>
      </div>
      <div className="text-center">
        <p className="text-xs" style={{color: '#E4E4E4'}}>
          🔒 Pagamento 100% seguro • Cancele quando quiser
        </p>
      </div>
    </div>
  );
};

export default StripeButton;
