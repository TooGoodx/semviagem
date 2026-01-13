import React from 'react'
import { usePermissions, Permissions, canSearchDate } from '../../hooks/usePermissions'
import { FeatureUpgradePrompt } from './FeatureUpgradePrompt'

interface AuthorizedFeatureProps {
  feature: keyof Permissions
  children: React.ReactNode
  fallback?: React.ReactNode
  showUpgradePrompt?: boolean
  customMessage?: string
}

export function AuthorizedFeature({
  feature,
  children,
  fallback,
  showUpgradePrompt = true,
  customMessage
}: AuthorizedFeatureProps) {
  const permissions = usePermissions()

  // Check if user has permission for this feature
  const hasPermission = permissions[feature]

  // If user has permission, render children
  if (hasPermission) {
    return <>{children}</>
  }

  // If custom fallback provided, use it
  if (fallback) {
    return <>{fallback}</>
  }

  // If upgrade prompt disabled, render nothing
  if (!showUpgradePrompt) {
    return null
  }

  // Default: show upgrade prompt
  return (
    <FeatureUpgradePrompt
      feature={feature}
      customMessage={customMessage}
    />
  )
}

// Specialized components for common use cases
export function SearchDateGate({
  searchDate,
  children
}: {
  searchDate: string
  children: React.ReactNode
}) {
  const permissions = usePermissions()
  const canSearch = canSearchDate(searchDate, permissions)

  if (canSearch) {
    return <>{children}</>
  }

  return (
    <FeatureUpgradePrompt
      feature="canSearchUnlimited"
      customMessage={`Esta data está além do seu limite de ${permissions.searchDayLimit} dias. Upgrade para buscar em qualquer data.`}
    />
  )
}

export function AlertsGate({ children }: { children: React.ReactNode }) {
  return (
    <AuthorizedFeature feature="canCreateAlerts">
      {children}
    </AuthorizedFeature>
  )
}

export function DashboardGate({ children }: { children: React.ReactNode }) {
  return (
    <AuthorizedFeature feature="canAccessDashboard">
      {children}
    </AuthorizedFeature>
  )
}
