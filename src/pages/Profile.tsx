import React, { useEffect, useMemo, useState, useCallback, useRef } from "react"
import { toast } from "react-hot-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CheckCircle2 } from "lucide-react"
import { useAuth } from "../context/AuthContext"
import { airportsByCountry } from "../data/airports"
import CustomCalendar from "../components/CustomCalendar"
import AlertConfigSection from "../components/alerts/AlertConfigSection"

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
  const { user } = useAuth()
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [formState, setFormState] = useState({
    name: user?.name || "",
    email: user?.email || "",
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
      if (!user?.sub) {
        setIsLoadingProfile(false)
        return
      }

      try {
        console.log('Carregando perfil do Supabase...')
        const response = await fetch(`/.netlify/functions/load-user-profile?auth0_id=${user.sub}`)
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
  }, [user?.sub])

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

    if (!user?.sub) {
      return
    }

    setIsSaving(true)
    try {
      await fetch("/.netlify/functions/save-user-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userData: {
            sub: user.sub,
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
  }, [formState, preferences.instagram, user])

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
          <h1 className="text-3xl font-bold text-[#060D1C]">Meu perfil</h1>
          <p className="text-sm text-[#060D1C]/60">Mantenha seus dados sempre atualizados para receber alertas personalizados.</p>
        </div>

        <Card className="shadow-[0_30px_70px_rgba(6,13,28,0.12)] border-gray-100">
          <CardHeader className="flex flex-col gap-6 md:flex-row md:items-center">
            <label className="relative w-32 h-32 rounded-3xl overflow-hidden flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 shadow-lg cursor-pointer group">
              <Avatar className="w-full h-full rounded-3xl">
                <AvatarImage
                  src={avatarPreview || user?.picture}
                  alt={user?.name || "Avatar"}
                  className="object-cover"
                />
                <AvatarFallback className="bg-[#F0C72F] text-[#060D1C] text-3xl font-bold rounded-3xl">
                  {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?'}
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
                <p className="text-sm text-[#060D1C]/60">Logado como</p>
                <p className="text-lg font-semibold text-[#060D1C]">{user?.email || "Conta autenticada"}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="profile-name" className="text-sm text-[#060D1C] font-medium">
                    Nome completo
                  </Label>
                  <Input
                    id="profile-name"
                    value={formState.name}
                    onChange={(event) => {
                      setFormState((prev) => ({ ...prev, name: event.target.value }))
                      scheduleAutoSave()
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="profile-email" className="text-sm text-[#060D1C] font-medium">
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
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="profile-phone" className="text-sm text-[#060D1C] font-medium">
                    WhatsApp
                  </Label>
                  <Input
                    id="profile-phone"
                    value={formState.phone}
                    onChange={(event) => {
                      setFormState((prev) => ({ ...prev, phone: formatPhone(event.target.value) }))
                      scheduleAutoSave()
                    }}
                    placeholder="(31) 99999-9999"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="profile-instagram" className="text-sm text-[#060D1C] font-medium">
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
                  />
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Configuração de Alertas - Substituiu "Preferências de viagem" antiga */}
        <AlertConfigSection />

        {/* Indicador de save status */}
        {(isSaving || lastSaved) && (
          <div className="flex items-center justify-end gap-2 text-sm">
            {isSaving ? (
              <>
                <div className="h-4 w-4 border-2 border-[#F0C72F] border-t-transparent rounded-full animate-spin" />
                <span className="text-[#060D1C]/60">Salvando...</span>
              </>
            ) : lastSaved ? (
              <>
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span className="text-[#060D1C]/60">
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
