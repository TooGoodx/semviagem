import React, { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import PhoneCollectionModal from "../PhoneCollectionModal"

type AuthTab = "login" | "register"

interface AuthTabsProps {
  initialTab?: AuthTab
  onEmailLogin: () => void
  onSocialLogin: (provider: "google" | "facebook" | "github" | "linkedin") => void
  onRegister: (data: { name: string; email: string; phone: string; instagram?: string; acceptMarketing: boolean }) => void
 }

const tabs: { key: AuthTab; label: string; description: string }[] = [
  { key: "login", label: "Entrar", description: "Acesse sua conta e continue suas buscas" },
  { key: "register", label: "Criar conta", description: "Cadastre-se em segundos e receba alertas exclusivos" },
 ]

const socialButtons = [
  {
    provider: "google" as const,
    label: "Google",
    className: "border-gray-200 bg-white text-gray-800 hover:bg-gray-50",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
      </svg>
    ),
  },
  {
    provider: "facebook" as const,
    label: "Facebook",
    className: "border-[#1877F2]/40 bg-[#1877F2] text-white hover:bg-[#0d5dc4]",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="currentColor"
          d="M24 12.073c0-6.627-5.373-12-12-12S0 5.446 0 12.073c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
        />
      </svg>
    ),
  },
  {
    provider: "github" as const,
    label: "GitHub",
    className: "border-gray-200 bg-gray-900 text-white hover:bg-gray-800",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="currentColor"
          d="M12 0C5.373 0 0 5.373 0 12c0 5.303 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.118-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.565 21.796 24 17.299 24 12c0-6.627-5.373-12-12-12z"
        />
      </svg>
    ),
  },
  {
    provider: "linkedin" as const,
    label: "LinkedIn",
    className: "border-[#0A66C2]/40 bg-[#0A66C2] text-white hover:bg-[#054b91]",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="currentColor"
          d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
        />
      </svg>
    ),
  },
 ]

 const formatPhone = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 11)
  if (digits.length <= 2) return digits
  if (digits.length <= 6) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  }
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`
 }

 const AuthTabs: React.FC<AuthTabsProps> = ({ initialTab = "login", onEmailLogin, onSocialLogin, onRegister }) => {
  const [activeTab, setActiveTab] = useState<AuthTab>(initialTab)
  const [registerForm, setRegisterForm] = useState({
    name: "",
    email: "",
    phone: "",
    instagram: "",
    acceptMarketing: false,
  })
  const [errors, setErrors] = useState<{ name?: string; email?: string; phone?: string; instagram?: string }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Phone collection modal state
  const [showPhoneModal, setShowPhoneModal] = useState(false)
  const [selectedProvider, setSelectedProvider] = useState<"google" | "facebook" | "github" | "linkedin" | null>(null)

  const tabContent = useMemo(() => tabs.find((tab) => tab.key === activeTab), [activeTab])

  const handleRegisterSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    const newErrors: typeof errors = {}
    if (!registerForm.name.trim()) newErrors.name = "Informe seu nome completo"

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!registerForm.email.trim() || !emailRegex.test(registerForm.email)) {
      newErrors.email = "Informe um e-mail válido"
    }

    const phoneRegex = /^\(\d{2}\)\s?\d{4,5}-\d{4}$/
    if (!registerForm.phone.trim() || !phoneRegex.test(registerForm.phone)) {
      newErrors.phone = "Use o formato (DD) 99999-9999"
    }

    // Validação de Instagram (opcional, mas se preenchido deve ser válido)
    if (registerForm.instagram.trim()) {
      const instagramRegex = /^@?[\w][\w.]{0,28}[\w]$|^https?:\/\/(www\.)?instagram\.com\/[\w.]+\/?$/
      if (!instagramRegex.test(registerForm.instagram.trim())) {
        newErrors.instagram = "Use o formato @usuario ou URL do Instagram"
      }
    }

    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) return

    setIsSubmitting(true)
    try {
      onRegister({
        name: registerForm.name.trim(),
        email: registerForm.email.trim().toLowerCase(),
        phone: registerForm.phone.trim(),
        instagram: registerForm.instagram.trim() || undefined,
        acceptMarketing: registerForm.acceptMarketing,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handler for social login button click
  const handleSocialLoginClick = (provider: "google" | "facebook" | "github" | "linkedin") => {
    // Se o usuário está no login (não no cadastro), pular modal de WhatsApp
    if (activeTab === 'login') {
      console.log('🔑 Login direto sem modal de WhatsApp')
      onSocialLogin(provider)
      return
    }

    // Se está no cadastro, mostrar modal de WhatsApp
    setSelectedProvider(provider)
    setShowPhoneModal(true)
  }

  // Handler for phone modal submit
  const handlePhoneModalSubmit = (data: { phone: string; instagram?: string; acceptMarketing: boolean }) => {
    if (!selectedProvider) return

    // Save phone data to localStorage for later retrieval in AuthCallback
    const socialLoginData = {
      phone: data.phone,
      instagram: data.instagram,
      acceptMarketing: data.acceptMarketing,
      timestamp: new Date().toISOString(),
      source: 'social_login',
      provider: selectedProvider
    }

    console.log('💾 Salvando dados do social login no localStorage:', socialLoginData)
    localStorage.setItem('pendingSocialLogin', JSON.stringify(socialLoginData))

    // Close modal
    setShowPhoneModal(false)

    // Proceed with social login
    onSocialLogin(selectedProvider)
  }

  // Handler for phone modal close
  const handlePhoneModalClose = () => {
    setShowPhoneModal(false)
    setSelectedProvider(null)
  }

  return (
    <Card className="shadow-[0_25px_60px_rgba(6,13,28,0.12)] border-gray-100 bg-white">
      <CardHeader className="gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {tabs.map((tab) => (
            <Button
              key={tab.key}
              type="button"
              variant={activeTab === tab.key ? "default" : "ghost"}
              className={cn(
                "rounded-full px-5",
                activeTab === tab.key
                  ? "bg-[#F0C72F] text-[#060D1C] hover:bg-[#d8b329]"
                  : "text-[#060D1C] hover:bg-[#F0C72F]/20"
              )}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </Button>
          ))}
        </div>
        <div>
          <CardTitle className="text-lg text-[#060D1C]">{tabContent?.label}</CardTitle>
          <CardDescription>{tabContent?.description}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-3">
          {socialButtons.map((button) => (
            <Button
              key={button.provider}
              type="button"
              className={cn("justify-start", button.className)}
              onClick={() => handleSocialLoginClick(button.provider)}
              variant="outline"
            >
              {button.icon}
              <span className="text-sm font-medium">{button.label}</span>
            </Button>
          ))}
        </div>

        {/* Phone Collection Modal */}
        <PhoneCollectionModal
          isOpen={showPhoneModal}
          onClose={handlePhoneModalClose}
          onSubmit={handlePhoneModalSubmit}
          provider={selectedProvider || "google"}
          providerLabel={socialButtons.find(b => b.provider === selectedProvider)?.label || "Google"}
        />

        <Separator className="bg-gray-200" />

        {activeTab === "login" ? (
          <div className="space-y-4">
            <Button
              type="button"
              className="w-full justify-center bg-[#F0C72F] text-[#060D1C] hover:bg-[#d8b329]"
              onClick={onEmailLogin}
            >
              Entrar com e-mail
            </Button>
            <p className="text-center text-sm text-[#060D1C]/70">
              Esqueceu a senha?{' '}
              <a href="/forgot-password" className="font-medium text-[#060D1C] underline">
                Recuperar acesso
              </a>
            </p>
          </div>
        ) : (
          <form className="space-y-4" onSubmit={handleRegisterSubmit}>
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-[#060D1C]" htmlFor="register-name">
                Nome completo
              </Label>
              <Input
                id="register-name"
                value={registerForm.name}
                onChange={(event) =>
                  setRegisterForm((prev) => ({ ...prev, name: event.target.value }))
                }
                placeholder="Como quer ser chamado"
                className={cn(errors.name && "border-red-500 focus-visible:ring-red-500")}
              />
              {errors.name && <p className="text-xs text-red-600">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-[#060D1C]" htmlFor="register-email">
                E-mail
              </Label>
              <Input
                id="register-email"
                type="email"
                value={registerForm.email}
                onChange={(event) =>
                  setRegisterForm((prev) => ({ ...prev, email: event.target.value }))
                }
                placeholder="nome@email.com"
                className={cn(errors.email && "border-red-500 focus-visible:ring-red-500")}
              />
              {errors.email && <p className="text-xs text-red-600">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-[#060D1C]" htmlFor="register-phone">
                WhatsApp
              </Label>
              <Input
                id="register-phone"
                value={registerForm.phone}
                onChange={(event) =>
                  setRegisterForm((prev) => ({ ...prev, phone: formatPhone(event.target.value) }))
                }
                placeholder="(31) 99999-9999"
                className={cn(errors.phone && "border-red-500 focus-visible:ring-red-500")}
              />
              {errors.phone && <p className="text-xs text-red-600">{errors.phone}</p>}
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-[#060D1C]" htmlFor="register-instagram">
                Instagram <span className="text-xs text-[#060D1C]/50 font-normal">(opcional)</span>
              </Label>
              <Input
                id="register-instagram"
                value={registerForm.instagram}
                onChange={(event) =>
                  setRegisterForm((prev) => ({ ...prev, instagram: event.target.value }))
                }
                placeholder="@seudestino"
                className={cn(errors.instagram && "border-red-500 focus-visible:ring-red-500")}
              />
              {errors.instagram && <p className="text-xs text-red-600">{errors.instagram}</p>}
            </div>

            <div className="flex items-start gap-3 rounded-md border border-dashed border-gray-200 bg-gray-50/70 px-4 py-3">
              <Checkbox
                id="register-marketing"
                checked={registerForm.acceptMarketing}
                onCheckedChange={(checked) =>
                  setRegisterForm((prev) => ({ ...prev, acceptMarketing: Boolean(checked) }))
                }
              />
              <Label htmlFor="register-marketing" className="text-sm text-[#060D1C]/80">
                Desejo receber alertas inteligentes e ofertas pelo WhatsApp e e-mail.
              </Label>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full justify-center bg-[#F0C72F] text-[#060D1C] hover:bg-[#d8b329]"
            >
              {isSubmitting ? 'Criando conta...' : 'Criar conta gratuita'}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  )
 }

 export default AuthTabs
