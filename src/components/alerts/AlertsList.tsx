import React, { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Plane,
  Calendar,
  Bell,
  BellOff,
  Trash2,
  Edit2,
  MapPin,
  MessageCircle,
  Mail,
  AlertCircle
} from 'lucide-react'
import { Alert, updateAlert, deleteAlert } from '../../lib/supabase'
import { designSystem } from '../../styles/designSystem'
import toast from 'react-hot-toast'

interface AlertsListProps {
  alerts: Alert[]
  onAlertUpdated: () => void
  onEditAlert?: (alert: Alert) => void
  isLoading?: boolean
  maxAlerts?: number
}

const AlertsList: React.FC<AlertsListProps> = ({
  alerts,
  onAlertUpdated,
  onEditAlert,
  isLoading = false,
  maxAlerts = 10
}) => {
  const [processingId, setProcessingId] = useState<string | null>(null)

  // Format date for display
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr)
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short'
      })
    } catch {
      return dateStr
    }
  }

  // Toggle alert active status
  const handleToggleActive = async (alert: Alert) => {
    setProcessingId(alert.id)
    try {
      const updated = await updateAlert(alert.id, {
        is_active: !alert.is_active
      })

      if (updated) {
        toast.success(
          alert.is_active
            ? 'Alerta pausado'
            : 'Alerta reativado'
        )
        onAlertUpdated()
      } else {
        throw new Error('Falha ao atualizar')
      }
    } catch (error) {
      console.error('Error toggling alert:', error)
      toast.error('Erro ao atualizar alerta')
    } finally {
      setProcessingId(null)
    }
  }

  // Delete alert
  const handleDelete = async (alert: Alert) => {
    if (!confirm(`Tem certeza que deseja excluir o alerta "${alert.alert_name}"?`)) {
      return
    }

    setProcessingId(alert.id)
    try {
      const success = await deleteAlert(alert.id)

      if (success) {
        toast.success('Alerta excluído')
        onAlertUpdated()
      } else {
        throw new Error('Falha ao excluir')
      }
    } catch (error) {
      console.error('Error deleting alert:', error)
      toast.error('Erro ao excluir alerta')
    } finally {
      setProcessingId(null)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-20 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (alerts.length === 0) {
    return (
      <Card className="border-dashed border-2 border-gray-200">
        <CardContent className="p-8 text-center">
          <AlertCircle className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Nenhum alerta configurado
          </h3>
          <p className="text-sm text-gray-500">
            Configure seu primeiro alerta para receber notificações quando os preços caírem.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header with counter */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold" style={{ color: designSystem.colors.textPrimary }}>
          Seus Alertas ({alerts.length}/{maxAlerts})
        </h3>
        <Badge
          className={alerts.filter(a => a.is_active).length > 0
            ? 'bg-green-100 text-green-800'
            : 'bg-gray-100 text-gray-600'
          }
        >
          {alerts.filter(a => a.is_active).length} ativos
        </Badge>
      </div>

      {/* Alerts cards */}
      {alerts.map((alert) => (
        <Card
          key={alert.id}
          className={`transition-all duration-200 ${
            !alert.is_active ? 'opacity-60 bg-gray-50' : 'bg-white'
          } ${processingId === alert.id ? 'opacity-50 pointer-events-none' : ''}`}
        >
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              {/* Alert info */}
              <div className="flex-1 space-y-3">
                {/* Name and status */}
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-semibold text-gray-900">
                    {alert.alert_name}
                  </h4>
                  {!alert.is_active && (
                    <Badge variant="secondary" className="text-xs">
                      Pausado
                    </Badge>
                  )}
                  {alert.alert_types?.milhas && (
                    <Badge className="bg-purple-100 text-purple-800 text-xs">
                      Milhas
                    </Badge>
                  )}
                  {alert.alert_types?.preco && (
                    <Badge className="bg-blue-100 text-blue-800 text-xs">
                      Preço
                    </Badge>
                  )}
                </div>

                {/* Routes */}
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="font-medium text-gray-700">
                    {alert.origins?.join(', ') || 'N/A'}
                  </span>
                  <Plane className="w-4 h-4 text-gray-400" />
                  <span className="font-medium text-gray-700">
                    {alert.destinations?.join(', ') || 'N/A'}
                  </span>
                </div>

                {/* Dates */}
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>
                      Ida: {formatDate(alert.departure_start)} - {formatDate(alert.departure_end)}
                    </span>
                  </div>
                  {alert.return_start && alert.return_end && (
                    <div className="flex items-center gap-1">
                      <span>
                        Volta: {formatDate(alert.return_start)} - {formatDate(alert.return_end)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Notification channels */}
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  {alert.notify_whatsapp && (
                    <div className="flex items-center gap-1">
                      <MessageCircle className="w-3 h-3 text-green-600" />
                      WhatsApp
                    </div>
                  )}
                  {alert.notify_email && (
                    <div className="flex items-center gap-1">
                      <Mail className="w-3 h-3 text-blue-600" />
                      Email
                    </div>
                  )}
                  {alert.max_price_brl && (
                    <div className="flex items-center gap-1">
                      <span className="font-medium">
                        Máx: R$ {alert.max_price_brl.toLocaleString('pt-BR')}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex sm:flex-col gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleToggleActive(alert)}
                  disabled={processingId === alert.id}
                  className={`flex-1 sm:flex-none ${
                    alert.is_active
                      ? 'text-orange-600 hover:bg-orange-50'
                      : 'text-green-600 hover:bg-green-50'
                  }`}
                >
                  {alert.is_active ? (
                    <>
                      <BellOff className="w-4 h-4 mr-1" />
                      Pausar
                    </>
                  ) : (
                    <>
                      <Bell className="w-4 h-4 mr-1" />
                      Ativar
                    </>
                  )}
                </Button>

                {onEditAlert && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEditAlert(alert)}
                    disabled={processingId === alert.id}
                    className="flex-1 sm:flex-none text-blue-600 hover:bg-blue-50"
                  >
                    <Edit2 className="w-4 h-4 mr-1" />
                    Editar
                  </Button>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(alert)}
                  disabled={processingId === alert.id}
                  className="flex-1 sm:flex-none text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Excluir
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default AlertsList
