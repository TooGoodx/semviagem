import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSubscription } from '../../hooks/useSubscription';
import { designSystem } from '../../styles/designSystem';

interface ProfileWizardProps {
  onComplete: () => void;
}

const formatPhone = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 6) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
};

const ProfileWizard: React.FC<ProfileWizardProps> = ({ onComplete }) => {
  const { user } = useAuth();
  const { isPremium, isLoading: subscriptionLoading } = useSubscription();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [formState, setFormState] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
  });
  const [isSaving, setIsSaving] = useState(false);

  const steps = useMemo(
    () => [
      { id: 1, title: 'Confirme seus dados básicos' },
      { id: 2, title: 'Status da sua conta' },
    ],
    [],
  );

  useEffect(() => {
    const stored = localStorage.getItem('sv_wizard_data');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setFormState((prev) => ({
          name: parsed.name || prev.name,
          email: parsed.email || prev.email,
          phone: parsed.phone ? formatPhone(parsed.phone) : prev.phone,
        }));
      } catch (error) {
        console.warn('Não foi possível carregar dados do wizard:', error);
      }
    }
  }, []);

  const handleSubmitStepOne = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user?.sub) {
      toast.error('Não foi possível identificar sua conta. Faça login novamente.');
      return;
    }
    setIsSaving(true);

    try {
      await fetch('/.netlify/functions/save-user-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userData: {
            sub: user.sub,
            name: formState.name,
            email: formState.email,
          },
          registrationData: {
            phone: formState.phone,
            acceptMarketing: true,
          },
        }),
      });
      toast.success('Dados atualizados com sucesso!');
      setCurrentStep(2);
      localStorage.setItem('sv_wizard_data', JSON.stringify(formState));
    } catch (error) {
      console.error(error);
      toast.error('Não foi possível atualizar seus dados. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      <div
        className="relative w-full max-w-2xl rounded-3xl p-8 space-y-6"
        style={{ backgroundColor: designSystem.colors.background, color: designSystem.colors.textPrimary }}
      >
        <button
          type="button"
          onClick={() => {
            localStorage.setItem('sv_wizard_completed', 'true');
            onComplete();
          }}
          className="absolute top-6 right-6 w-10 h-10 rounded-full flex items-center justify-center border transition-colors duration-200 hover:bg-[#E4E4E4]"
          style={{ borderColor: designSystem.colors.outline }}
          aria-label="Fechar assistente"
        >
          <span className="text-lg font-semibold">&times;</span>
        </button>
        <header>
          <div className="flex items-center gap-3">
            {steps.map((step) => (
              <div key={step.id} className="flex items-center gap-2">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold"
                  style={{
                    backgroundColor:
                      currentStep === step.id
                        ? designSystem.colors.accent
                        : designSystem.colors.surface,
                    color: currentStep === step.id ? designSystem.colors.primary : designSystem.colors.textPrimary,
                  }}
                >
                  {step.id}
                </div>
                <span className="text-sm sm:text-base font-medium">{step.title}</span>
                {step.id < steps.length && <div className="w-6 border-t border-dashed opacity-40" />}
              </div>
            ))}
          </div>
        </header>

        {currentStep === 1 && (
          <form onSubmit={handleSubmitStepOne} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nome completo</label>
                <input
                  type="text"
                  value={formState.name}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, name: event.target.value }))
                  }
                  className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2"
                  style={{
                    borderColor: designSystem.colors.outline,
                    backgroundColor: '#FFFFFF',
                  }}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">E-mail</label>
                <input
                  type="email"
                  value={formState.email}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, email: event.target.value }))
                  }
                  className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2"
                  style={{
                    borderColor: designSystem.colors.outline,
                    backgroundColor: '#FFFFFF',
                  }}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">WhatsApp</label>
              <input
                type="tel"
                value={formState.phone}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    phone: formatPhone(event.target.value),
                  }))
                }
                className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2"
                style={{
                  borderColor: designSystem.colors.outline,
                  backgroundColor: '#FFFFFF',
                }}
                placeholder="(31) 99999-9999"
                required
              />
              <p className="text-xs opacity-80 mt-2">
                Usaremos este número para enviar alertas de promoções e atualizações importantes via WhatsApp.
              </p>
            </div>

            <div className="flex items-center justify-end pt-2">
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-3 rounded-xl text-sm font-medium border transition-transform duration-200 hover:-translate-y-0.5 disabled:opacity-70"
                style={{
                  backgroundColor: designSystem.colors.accent,
                  color: designSystem.colors.primary,
                  borderColor: designSystem.colors.outline,
                }}
              >
                {isSaving ? 'Salvando...' : 'Continuar'}
              </button>
            </div>
          </form>
        )}

        {currentStep === 2 && (
          <div className="space-y-6">
            <div
              className="rounded-2xl p-6"
              style={{ backgroundColor: designSystem.colors.surface }}
            >
              <h3 className="text-lg font-semibold mb-2">Status da assinatura</h3>
              <p className="text-sm opacity-90">
                {subscriptionLoading
                  ? 'Carregando...'
                  : isPremium
                  ? 'Você é membro Premium! Aproveite buscas ilimitadas e alertas antecipados.'
                  : 'Sua conta está no plano gratuito. Assine o plano PRO para habilitar alertas inteligentes por WhatsApp e acesso antecipado às melhores tarifas.'}
              </p>
            </div>

            <div className="flex flex-wrap gap-3 justify-between items-center">
              <div className="flex flex-wrap gap-3">
                {!isPremium && (
                  <a
                    href="/premium"
                    target="_blank"
                    rel="noreferrer"
                    className="px-6 py-3 rounded-xl text-sm font-medium border transition-transform duration-200 hover:-translate-y-0.5"
                    style={{
                      backgroundColor: designSystem.colors.accent,
                      color: designSystem.colors.primary,
                      borderColor: designSystem.colors.outline,
                    }}
                  >
                    Conhecer plano PRO
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => navigate('/profile')}
                  className="px-6 py-3 rounded-xl text-sm font-medium border transition-transform duration-200 hover:-translate-y-0.5"
                  style={{
                    backgroundColor: '#FFFFFF',
                    color: designSystem.colors.primary,
                    borderColor: designSystem.colors.outline,
                  }}
                >
                  Ajustar preferências
                </button>
              </div>
              <p className="text-xs opacity-70">Feche no botão “×” quando terminar.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileWizard;
