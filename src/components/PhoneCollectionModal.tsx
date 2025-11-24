import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

interface PhoneCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { phone: string; instagram?: string; acceptMarketing: boolean }) => void;
  provider: 'google' | 'facebook' | 'github' | 'linkedin';
  providerLabel: string;
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

const PhoneCollectionModal: React.FC<PhoneCollectionModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  provider,
  providerLabel,
}) => {
  const [phone, setPhone] = useState('');
  const [instagram, setInstagram] = useState('');
  const [acceptMarketing, setAcceptMarketing] = useState(false);
  const [errors, setErrors] = useState<{ phone?: string; instagram?: string }>({});

  if (!isOpen) return null;

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setPhone(formatted);
    setErrors((prev) => ({ ...prev, phone: undefined }));
  };

  const handleInstagramChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInstagram(e.target.value);
    setErrors((prev) => ({ ...prev, instagram: undefined }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: typeof errors = {};

    // Validação do telefone (obrigatório)
    const phoneRegex = /^\(\d{2}\)\s?\d{4,5}-\d{4}$/;
    if (!phone.trim() || !phoneRegex.test(phone)) {
      newErrors.phone = 'Por favor, insira um WhatsApp válido no formato (DD) 99999-9999';
    }

    // Validação de Instagram (opcional, mas se preenchido deve ser válido)
    if (instagram.trim()) {
      const instagramRegex = /^@?[\w][\w.]{0,28}[\w]$|^https?:\/\/(www\.)?instagram\.com\/[\w.]+\/?$/;
      if (!instagramRegex.test(instagram.trim())) {
        newErrors.instagram = 'Use o formato @usuario ou URL do Instagram';
      }
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    // Sucesso - envia os dados
    onSubmit({
      phone,
      instagram: instagram.trim() || undefined,
      acceptMarketing,
    });
  };

  const getProviderIcon = () => {
    switch (provider) {
      case 'google':
        return (
          <svg className="h-6 w-6" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
        );
      case 'facebook':
        return (
          <svg className="h-6 w-6 text-[#1877F2]" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M24 12.073c0-6.627-5.373-12-12-12S0 5.446 0 12.073c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
            />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-md mx-4 bg-white rounded-lg shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            {getProviderIcon()}
            <h2 className="text-xl font-semibold text-[#060D1C]">
              Última etapa antes de continuar
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Fechar"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              Para receber alertas de ofertas exclusivas no WhatsApp, precisamos do seu número:
            </p>
          </div>

          {/* Phone Input */}
          <div className="space-y-2">
            <Label htmlFor="phone-modal" className="text-sm font-semibold text-[#060D1C]">
              WhatsApp
            </Label>
            <Input
              id="phone-modal"
              value={phone}
              onChange={handlePhoneChange}
              placeholder="(31) 99999-9999"
              className={`text-base ${errors.phone ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
              autoFocus
            />
            {errors.phone && <p className="text-xs text-red-600">{errors.phone}</p>}
          </div>

          {/* Instagram Input (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="instagram-modal" className="text-sm font-semibold text-[#060D1C]">
              Instagram <span className="text-xs text-[#060D1C]/50 font-normal">(opcional)</span>
            </Label>
            <Input
              id="instagram-modal"
              value={instagram}
              onChange={handleInstagramChange}
              placeholder="@seudestino"
              className={`text-base ${errors.instagram ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
            />
            {errors.instagram && <p className="text-xs text-red-600">{errors.instagram}</p>}
          </div>

          {/* Marketing Consent */}
          <div className="flex items-start gap-3 rounded-md border border-dashed border-gray-200 bg-gray-50/70 px-4 py-3">
            <Checkbox
              id="marketing-modal"
              checked={acceptMarketing}
              onCheckedChange={(checked) => setAcceptMarketing(Boolean(checked))}
            />
            <Label htmlFor="marketing-modal" className="text-sm text-[#060D1C]/80 leading-relaxed cursor-pointer">
              Desejo receber alertas inteligentes e ofertas exclusivas pelo WhatsApp e e-mail.
            </Label>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-[#F0C72F] text-[#060D1C] hover:bg-[#d8b329]"
            >
              Continuar com {providerLabel}
            </Button>
          </div>

          {/* Privacy Note */}
          <p className="text-xs text-gray-500 text-center">
            Seus dados estão seguros e não serão compartilhados com terceiros.
          </p>
        </form>
      </div>
    </div>
  );
};

export default PhoneCollectionModal;
