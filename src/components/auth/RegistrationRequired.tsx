import React, { useEffect, useState } from 'react'
import { useAuth0 } from '@auth0/auth0-react'

interface RegistrationRequiredProps {
  pendingUserData: any
}

export function RegistrationRequired({ pendingUserData }: RegistrationRequiredProps) {
  const { logout } = useAuth0()
  const [countdown, setCountdown] = useState(10)

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          // Auto redirect to registration after 10 seconds
          window.location.href = '/register'
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const handleRegisterNow = () => {
    window.location.href = '/register'
  }

  const handleLogout = () => {
    sessionStorage.removeItem('pendingRegistration')
    logout({ logoutParams: { returnTo: window.location.origin } })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          {/* Lock Icon */}
          <div
            className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-3xl"
            style={{ backgroundColor: '#060D1C' }}
          >
            🔒
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Cadastro Necessário
          </h2>

          <div className="mb-6">
            <p className="text-gray-600 mb-4">
              Olá <strong>{pendingUserData?.name || 'visitante'}</strong>!
            </p>
            <p className="text-gray-600">
              Você precisa completar seu cadastro para acessar a TripJunto.
            </p>
          </div>

          {/* User Info Display */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            {pendingUserData?.picture && (
              <img
                src={pendingUserData.picture}
                alt="User"
                className="w-12 h-12 rounded-full mx-auto mb-2"
              />
            )}
            <p className="text-sm text-gray-600">
              📧 {pendingUserData?.email}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleRegisterNow}
              className="w-full text-white font-semibold py-3 px-4 rounded-lg transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#060D1C' }}
            >
              Completar Cadastro Agora
            </button>

            <button
              onClick={handleLogout}
              className="w-full border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-3 px-4 rounded-lg transition-colors"
            >
              Sair e Usar Outra Conta
            </button>
          </div>

          {/* Auto redirect countdown */}
          <p className="text-xs text-gray-500 mt-4">
            Redirecionando automaticamente em {countdown} segundos...
          </p>
        </div>
      </div>
    </div>
  )
}
