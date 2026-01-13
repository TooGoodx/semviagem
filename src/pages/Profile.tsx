import React, { useEffect, useMemo, useState, useCallback, useRef } from "react"
import { toast } from "react-hot-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CheckCircle2, Phone } from "lucide-react"
import { useUser } from "../context/UserContext"
import { airportsByCountry } from "../data/airports"
import CustomCalendar from "../components/CustomCalendar"
import AlertConfigSection from "../components/alerts/AlertConfigSection"
import { designSystem, componentClasses } from "../styles/designSystem"
import { updateUserWhatsApp } from "../lib/supabase"
import { formatWhatsAppNumber, isValidWhatsAppNumber } from "../services/whatsappService"

const formatCountryLabel = (country: string) =>
  country
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")

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

type PreferencesState = {
  country: string
  city: string
  airport: string
  travelDate: string
  priceLimit: number
  instagram: string
}

const defaultPreferences: PreferencesState = {
  country: "",
  city: "",
  airport: "",
  travelDate: "",
  priceLimit: 4000,
  instagram: "",
}

const Profile: React.FC = () => {
  const { user, auth0User, subscription_status } = useUser()
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [formState, setFormState] = useState({
    name: auth0User?.name || "",
    email: auth0User?.email || "",
    phone: "",
  })
  const [preferences, setPreferences] = useState<PreferencesState>(defaultPreferences)
  const [showCalendar, setShowCalendar] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Carregar dados do perfil do Supabase
  useEffect(() => {
    const loadProfileData = async () => {
      if (!auth0User?.sub) {
        setIsLoadingProfile(false)
        return
      }

      try {
        console.log('Carregando perfil do Supabase...')
        const response = await fetch(`/.netlify/functions/load-user-profile?auth0_id=${auth0User.sub}`)
        const data = await response.json()

        if (data.success && data.profile) {
          console.log('Perfil carregado:', data.profile.email)

          // Popular dados do formulário
          setFormState((prev) => ({
            name: data.profile.name || prev.name,
            email: data.profile.email || prev.email,
            phone: data.profile.phone ? formatPhone(data.profile.phone) : prev.phone,
          }))

          // Popular Instagram nas preferências
          setPreferences((prev) => ({
            ...prev,
            instagram: data.profile.instagram || '',
          }))
        } else {
          console.log('Perfil não encontrado no Supabase')
        }
      } catch (error) {
        console.error('Erro ao carregar perfil:', error)
      } finally {
        setIsLoadingProfile(false)
      }
    }

    loadProfileData()
  }, [auth0User?.sub])

  // Carregar dados do localStorage (fallback)
  useEffect(() => {
    const storedWizardData = localStorage.getItem("sv_wizard_data")
    if (storedWizardData) {
      try {
        const parsed = JSON.parse(storedWizardData)
        setFormState((prev) => ({
          name: parsed.name || prev.name,
          email: parsed.email || prev.email,
          phone: parsed.phone ? formatPhone(parsed.phone) : prev.phone,
        }))
      } catch (error) {
        console.warn("Não foi possível ler dados do wizard:", error)
      }
    }

    const storedPreferences = localStorage.getItem("sv_preferences")
    if (storedPreferences) {
      try {
        const parsed = JSON.parse(storedPreferences)
        setPreferences({
          ...defaultPreferences,
          ...parsed,
        })
      } catch (error) {
        console.warn("Não foi possível ler preferências armazenadas:", error)
      }
    }
  }, [])

  // Auto-save function
  const saveProfileData = useCallback(async () => {
    if (!formState.name.trim() || !formState.email.trim()) {
      return
    }

    if (!auth0User?.sub) {
      return
    }

    setIsSaving(true)
    try {
      await fetch("/.netlify/functions/save-user-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userData: {
            sub: auth0User.sub,
            name: formState.name.trim(),
            email: formState.email.trim().toLowerCase(),
          },
          registrationData: {
            phone: formState.phone.trim(),
            instagram: preferences.instagram.trim(),
          },
        }),
      })

      setLastSaved(new Date())
    } catch (error) {
      console.error("Erro ao salvar perfil:", error)
    } finally {
      setIsSaving(false)
    }
  }, [formState, preferences.instagram, auth0User])

  // Debounced auto-save
  const scheduleAutoSave = useCallback(() => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current)
    }

    saveTimerRef.current = setTimeout(() => {
      saveProfileData()
    }, 1000)
  }, [saveProfileData])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current)
      }
    }
  }, [])

  const countries = useMemo(() => Object.keys(airportsByCountry), [])

  const cities = useMemo(() => {
    if (!preferences.country) return []
    const airports = airportsByCountry[preferences.country] || []
    const set = new Set<string>()
    airports.forEach((airport) => {
      if (airport.city) set.add(airport.city)
    })
    return Array.from(set).sort()
  }, [preferences.country])

  const airports = useMemo(() => {
    if (!preferences.country) return []
    const list = airportsByCountry[preferences.country] || []
    if (!preferences.city) return list
    return list.filter((airport) => airport.city === preferences.city)
  }, [preferences.country, preferences.city])

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast.error("Selecione uma imagem válida.")
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setAvatarPreview(reader.result)
      }
    }
    reader.readAsDataURL(file)
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] via-white to-[#eef2f6] pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold" style={{ color: designSystem.colors.textPrimary }}>Meu perfil</h1>
          <p className="text-sm" style={{ color: designSystem.colors.textMuted }}>Mantenha seus dados sempre atualizados para receber alertas personalizados.</p>
        </div>

        <Card className="shadow-2xl border-gray-100">
          <CardHeader className="flex flex-col gap-6 md:flex-row md:items-center">
            <label className="relative w-32 h-32 rounded-3xl overflow-hidden flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 shadow-lg cursor-pointer group">
              <Avatar className="w-full h-full rounded-3xl">
                <AvatarImage
                  src={avatarPreview || auth0User?.picture}
                  alt={auth0User?.name || "Avatar"}
                  className="object-cover"
                />
                <AvatarFallback className="text-3xl font-bold rounded-3xl" style={{ backgroundColor: designSystem.colors.accent, color: designSystem.colors.textPrimary }}>
                  {auth0User?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?'}
                </AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-200 flex items-center justify-center">
                <span className="text-white text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  Alterar foto
                </span>
              </div>
              <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleAvatarChange} />
            </label>
            <div className="flex-1 space-y-4">
              <div>
                <p className="text-sm" style={{ color: designSystem.colors.textMuted }}>Logado como</p>
                <p className="text-lg font-semibold" style={{ color: designSystem.colors.textPrimary }}>{auth0User?.email || "Conta autenticada"}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="profile-name" className="text-sm font-medium" style={{ color: designSystem.colors.textPrimary }}>
                    Nome completo
                  </Label>
                  <Input
                    id="profile-name"
                    value={formState.name}
                    onChange={(event) => {
                      setFormState((prev) => ({ ...prev, name: event.target.value }))
                      scheduleAutoSave()
                    }}
                    className={componentClasses.input.base}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="profile-email" className="text-sm font-medium" style={{ color: designSystem.colors.textPrimary }}>
                    E-mail
                  </Label>
                  <Input
                    id="profile-email"
                    type="email"
                    value={formState.email}
                    onChange={(event) => {
                      setFormState((prev) => ({ ...prev, email: event.target.value }))
                      scheduleAutoSave()
                    }}
                    className={componentClasses.input.base}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="profile-phone" className="text-sm font-medium flex items-center gap-2" style={{ color: designSystem.colors.textPrimary }}>
                    <Phone className="w-4 h-4 text-green-600" />
                    WhatsApp (para alertas)
                  </Label>
                  <Input
                    id="profile-phone"
                    value={formState.phone}
                    onChange={async (event) => {
                      const formatted = formatPhone(event.target.value)
                      setFormState((prev) => ({ ...prev, phone: formatted }))
                      scheduleAutoSave()

                      // Also save to Supabase if user is logged in and number is valid
                      if (user?.id && formatted.replace(/\D/g, '').length >= 10) {
                        const whatsappFormatted = formatWhatsAppNumber(formatted)
                        if (isValidWhatsAppNumber(whatsappFormatted)) {
                          await updateUserWhatsApp(user.id, whatsappFormatted)
                        }
                      }
                    }}
                    placeholder="(31) 99999-9999"
                    className={componentClasses.input.base}
                  />
                  <p className="text-xs" style={{ color: designSystem.colors.textMuted }}>
                    Este número será usado para receber alertas de preço via WhatsApp
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="profile-instagram" className="text-sm font-medium" style={{ color: designSystem.colors.textPrimary }}>
                    Instagram
                  </Label>
                  <Input
                    id="profile-instagram"
                    value={preferences.instagram}
                    onChange={(event) => {
                      setPreferences((prev) => ({ ...prev, instagram: event.target.value }))
                      scheduleAutoSave()
                    }}
                    placeholder="@seudestino"
                    className={componentClasses.input.base}
                  />
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Box informativo sobre combinações de alertas */}
        <section
          aria-labelledby="alerts-info-title"
          className="sv-info-box"
          role="region"
          style={{
            background: '#fff',
            border: '1px solid #E9EEF3',
            borderRadius: '12px',
            padding: '16px',
            boxShadow: 'none',
            marginBottom: '24px',
            marginTop: '24px'
          }}
        >
          <div
            className="sv-info-box__inner"
            style={{
              display: 'flex',
              gap: '12px',
              alignItems: 'center'
            }}
          >
            {/* Ícone */}
            <div
              className="sv-info-box__icon"
              aria-hidden="true"
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#fff',
                boxShadow: '0 1px 4px rgba(9,30,66,0.04)',
                border: '1px solid #E9EEF3'
              }}
            >
              ✈️
            </div>

            {/* Conteúdo */}
            <div className="sv-info-box__content" style={{ flex: 1 }}>
              <h3
                id="alerts-info-title"
                className="sv-info-box__title"
                style={{
                  margin: 0,
                  fontSize: '16px',
                  fontWeight: 600,
                  color: '#060D1C',
                  lineHeight: 1.4
                }}
              >
                Cada alerta monitora até 1.225 combinações de voos automaticamente!
              </h3>
              <p
                className="sv-info-box__desc"
                style={{
                  margin: '4px 0 0 0',
                  fontSize: '13px',
                  color: '#8B98A6',
                  lineHeight: 1.4
                }}
              >
                Combinando 5 origens × 5 destinos × 49 datas (7 dias ida × 7 dias volta) — máxima chance de encontrar sua viagem ideal.
              </p>
            </div>
          </div>
        </section>

        {/* Configuração de Alertas - Substituiu "Preferências de viagem" antiga */}
        <AlertConfigSection />

        {/* Indicador de save status */}
        {(isSaving || lastSaved) && (
          <div className="flex items-center justify-end gap-2 text-sm">
            {isSaving ? (
              <>
                <div className="h-4 w-4 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: designSystem.colors.accent, borderTopColor: 'transparent' }} />
                <span style={{ color: designSystem.colors.textMuted }}>Salvando...</span>
              </>
            ) : lastSaved ? (
              <>
                <CheckCircle2 className="h-4 w-4" style={{ color: designSystem.colors.success }} />
                <span style={{ color: designSystem.colors.textMuted }}>
                  Salvo automaticamente
                </span>
              </>
            ) : null}
          </div>
        )}
      </div>

      {showCalendar && (
        <div className="fixed inset-0 z-40 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div className="relative bg-white rounded-3xl shadow-xl p-6 max-w-2xl w-full">
            <CustomCalendar
              title="Selecione a data de interesse"
              selectedDate={preferences.travelDate}
              onDateSelect={(date) => {
                setPreferences((prev) => ({
                  ...prev,
                  travelDate: date.toISOString(),
                }))
                setShowCalendar(false)
              }}
              onClose={() => setShowCalendar(false)}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default Profile
