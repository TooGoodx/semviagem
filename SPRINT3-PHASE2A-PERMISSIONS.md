# SPRINT 3 DAY 2 PHASE 2A - PERMISSION HOOK SYSTEM

**Date:** December 8, 2025
**Status:** ✅ COMPLETE - READY FOR TESTING
**Feature:** Comprehensive Permission-Based Feature Access

---

## 🎯 OBJECTIVE

Implement a robust authorization layer that controls feature access based on subscription tiers with professional upgrade flows.

---

## 📊 SUBSCRIPTION LOGIC

### Tier Permissions:

| Feature | Free | Busca Ilimitada | Alertas Inteligentes |
|---------|------|-----------------|----------------------|
| **Search Limit** | 60 days | Unlimited (∞) | Unlimited (∞) |
| **Alerts** | ❌ No | ❌ No | ✅ Yes (max 10) |
| **Dashboard** | ❌ No | ❌ No | ✅ Yes |
| **Advanced Filters** | ❌ No | ✅ Yes | ✅ Yes |
| **Premium Features** | ❌ No | ✅ Yes | ✅ Yes |

---

## 📋 FILES CREATED

### 1. [src/hooks/usePermissions.ts](src/hooks/usePermissions.ts) *(NEW)*
**Lines:** 1-104

**Purpose:** Core permission calculation hook

**Key Features:**
- `usePermissions()` - Returns user permissions based on subscription
- `canSearchDate(date, permissions)` - Helper to check if date is searchable
- `getUpgradeRecommendation(plan, feature)` - Returns upgrade info for blocked features

**Permission Interface:**
```typescript
interface Permissions {
  // Search permissions
  canSearchUnlimited: boolean
  searchDayLimit: number | null  // null = unlimited

  // Alert permissions
  canCreateAlerts: boolean
  canAccessDashboard: boolean
  maxAlerts: number

  // UI permissions
  canAccessPremiumFeatures: boolean
  canSeeAdvancedFilters: boolean
}
```

**Logic:**
```typescript
// Free user
canSearchUnlimited: false
searchDayLimit: 60

// Busca Ilimitada user
canSearchUnlimited: true
searchDayLimit: null  // unlimited

// Alertas Inteligentes user
canSearchUnlimited: true
searchDayLimit: null  // unlimited
canCreateAlerts: true
maxAlerts: 10
```

---

### 2. [src/components/auth/FeatureUpgradePrompt.tsx](src/components/auth/FeatureUpgradePrompt.tsx) *(NEW)*
**Lines:** 1-132

**Purpose:** Smart upgrade prompt component

**Features:**
- **Full Mode:** Beautiful modal with benefits list, pricing, CTA
- **Compact Mode:** Inline banner for tight spaces
- **Context-Aware:** Shows correct plan based on desired feature
- **Professional UX:** Brand colors, icons, clear messaging

**Usage:**
```typescript
<FeatureUpgradePrompt
  feature="canSearchUnlimited"
  customMessage="Esta data está além do seu limite de 60 dias."
  compact={false}
/>
```

**Displays:**
- Feature icon (🚀, 🔔, 📊)
- Title and description
- Benefits list for target plan
- Price badge
- "Liberar [Feature]" CTA button
- "Ver Todos os Planos" secondary action

---

### 3. [src/components/auth/AuthorizedFeature.tsx](src/components/auth/AuthorizedFeature.tsx) *(NEW)*
**Lines:** 1-84

**Purpose:** Authorization wrapper component

**Base Component:**
```typescript
<AuthorizedFeature feature="canCreateAlerts">
  <AlertCreationForm />
</AuthorizedFeature>
```

**Specialized Gates:**
```typescript
// Search date gate
<SearchDateGate searchDate="2025-12-08">
  <FlightSearchResults />
</SearchDateGate>

// Alerts gate
<AlertsGate>
  <AlertDashboard />
</AlertsGate>

// Dashboard gate
<DashboardGate>
  <PremiumDashboard />
</DashboardGate>
```

**Behavior:**
- ✅ Has permission → Render children
- ❌ No permission + fallback → Render fallback
- ❌ No permission + showUpgradePrompt → Show upgrade prompt
- ❌ No permission + !showUpgradePrompt → Render nothing

---

### 4. [src/context/UserContext.tsx](src/context/UserContext.tsx) *(UPDATED)*
**Lines Modified:** 8-27, 31-80

**Added `searchDayLimit` Helper:**
```typescript
interface UserContextType {
  // ... existing properties
  searchDayLimit: number | null // null = unlimited, number = days limit
}

// In UserProvider:
const searchDayLimit = subscription_status === 'free' ? 60 : null
```

**Enhanced Debug Logging:**
```typescript
console.log('🔍 UserContext state:', {
  hasUser: !!user,
  isAuthenticated,
  subscriptionStatus: subscription_status,
  isPaid,
  canCreateAlerts,
  canSearchUnlimited,
  searchLimit: searchDayLimit ? `${searchDayLimit} days` : 'unlimited',
  syncError: error ? 'Present' : 'None',
  needsRegistration: !!(authData as any).needsRegistration
})
```

---

## 🧪 TESTING GUIDE

### Test 1: Free User Permissions
```typescript
// Expected console output:
🔍 Calculating permissions for subscription: free
🔐 User permissions: {
  subscription: "free",
  canSearchUnlimited: false,
  searchLimit: "60 days",
  canCreateAlerts: false,
  maxAlerts: 0
}

// Expected UserContext:
🔍 UserContext state: {
  subscriptionStatus: "free",
  isPaid: false,
  canCreateAlerts: false,
  canSearchUnlimited: false,
  searchLimit: "60 days"
}
```

**Test Scenarios:**
1. Try to create alert → See upgrade prompt for "Alertas Inteligentes" (R$ 29,90)
2. Search date >60 days from today → See upgrade prompt for "Busca Ilimitada" (R$ 19,90)
3. Access dashboard → Blocked with upgrade prompt

---

### Test 2: Busca Ilimitada User Permissions
```typescript
// Expected console output:
🔍 Calculating permissions for subscription: busca_ilimitada
🔐 User permissions: {
  subscription: "busca_ilimitada",
  canSearchUnlimited: true,
  searchLimit: "unlimited",
  canCreateAlerts: false,
  maxAlerts: 0
}

// Expected UserContext:
🔍 UserContext state: {
  subscriptionStatus: "busca_ilimitada",
  isPaid: true,
  canCreateAlerts: false,
  canSearchUnlimited: true,
  searchLimit: "unlimited"
}
```

**Test Scenarios:**
1. Search any date → ✅ Allowed (unlimited)
2. Try to create alert → See upgrade prompt for "Alertas Inteligentes" (R$ 29,90)
3. Access dashboard → Blocked with upgrade prompt

---

### Test 3: Alertas Inteligentes User Permissions
```typescript
// Expected console output:
🔍 Calculating permissions for subscription: alertas_inteligentes
🔐 User permissions: {
  subscription: "alertas_inteligentes",
  canSearchUnlimited: true,
  searchLimit: "unlimited",
  canCreateAlerts: true,
  maxAlerts: 10
}

// Expected UserContext:
🔍 UserContext state: {
  subscriptionStatus: "alertas_inteligentes",
  isPaid: true,
  canCreateAlerts: true,
  canSearchUnlimited: true,
  searchLimit: "unlimited"
}
```

**Test Scenarios:**
1. Search any date → ✅ Allowed (unlimited)
2. Create alerts → ✅ Allowed (up to 10)
3. Access dashboard → ✅ Allowed

---

## 🎨 USAGE EXAMPLES

### Example 1: Protect Alert Creation
```typescript
import { AlertsGate } from '../components/auth/AuthorizedFeature'

function AlertsPage() {
  return (
    <AlertsGate>
      <AlertCreationForm />
      <ActiveAlertsList />
    </AlertsGate>
  )
}
```

**Result:**
- Free/Busca users → See upgrade prompt
- Alertas users → See alert features

---

### Example 2: Search Date Validation
```typescript
import { SearchDateGate } from '../components/auth/AuthorizedFeature'

function FlightSearch({ departureDate }: { departureDate: string }) {
  return (
    <SearchDateGate searchDate={departureDate}>
      <FlightSearchResults date={departureDate} />
    </SearchDateGate>
  )
}
```

**Result:**
- Free user searching >60 days → Upgrade prompt
- Paid users → See results

---

### Example 3: Manual Permission Check
```typescript
import { usePermissions } from '../hooks/usePermissions'

function SearchForm() {
  const permissions = usePermissions()

  const handleSearch = (date: string) => {
    if (permissions.searchDayLimit && !canSearchDate(date, permissions)) {
      // Show upgrade modal
      setShowUpgrade(true)
      return
    }

    // Proceed with search
    executeSearch(date)
  }

  return (
    <form>
      <DatePicker
        onChange={handleSearch}
        helperText={permissions.searchDayLimit
          ? `Limite: ${permissions.searchDayLimit} dias`
          : 'Busca ilimitada'
        }
      />
    </form>
  )
}
```

---

### Example 4: Conditional UI Rendering
```typescript
import { usePermissions } from '../hooks/usePermissions'

function FlightFilters() {
  const permissions = usePermissions()

  return (
    <div>
      {/* Basic filters always shown */}
      <BasicFilters />

      {/* Advanced filters for paid users */}
      {permissions.canSeeAdvancedFilters ? (
        <AdvancedFilters />
      ) : (
        <FeatureUpgradePrompt
          feature="canSeeAdvancedFilters"
          compact={true}
        />
      )}
    </div>
  )
}
```

---

## 🔄 UPGRADE FLOW

### User Journey:
1. **User encounters blocked feature**
   - Sees `FeatureUpgradePrompt` with:
     - Feature icon and title
     - Clear description
     - Benefits list
     - Price badge
     - CTA button

2. **User clicks "Liberar [Feature]"**
   - Redirected to Stripe checkout
   - Purchase flow

3. **After successful payment**
   - Webhook updates `subscription_status` in Supabase
   - User refreshes or next login
   - Permissions recalculated
   - Feature unlocked

---

## 📊 BUILD STATUS

```
✓ Built in 4.22s
✓ 1,010.12 kB (280.07 kB gzipped)
✓ No TypeScript errors
```

---

## 🔍 TESTING CHECKLIST

### Permission Calculation:
- [ ] Free user: `searchDayLimit = 60`, `canCreateAlerts = false`
- [ ] Busca Ilimitada: `searchDayLimit = null`, `canCreateAlerts = false`
- [ ] Alertas: `searchDayLimit = null`, `canCreateAlerts = true`, `maxAlerts = 10`

### Component Behavior:
- [ ] AuthorizedFeature allows/blocks correctly
- [ ] FeatureUpgradePrompt shows correct plan/price
- [ ] Compact mode works
- [ ] SearchDateGate validates dates
- [ ] AlertsGate/DashboardGate work

### Console Verification:
- [ ] `usePermissions()` logs subscription and permissions
- [ ] `UserContext` logs include `searchLimit`
- [ ] Upgrade clicks log to console

---

## 🚀 NEXT STEPS - PHASE 2B

With Phase 2A complete, you can now:

1. **Integrate with existing components:**
   - Add `SearchDateGate` to flight search
   - Add `AlertsGate` to alert pages
   - Add `DashboardGate` to dashboard

2. **Test with dev utilities:**
```typescript
// In dev console:
const { updateSubscriptionStatus } = window.useUserContext()

// Test free tier
await updateSubscriptionStatus('free')

// Test busca ilimitada
await updateSubscriptionStatus('busca_ilimitada')

// Test alertas
await updateSubscriptionStatus('alertas_inteligentes')
```

3. **Verify upgrade flows:**
   - Test Stripe links work
   - Test webhook updates subscription
   - Test permissions update after upgrade

---

## 📝 SUMMARY

✅ **usePermissions hook** - Centralized permission logic
✅ **FeatureUpgradePrompt** - Professional upgrade UX
✅ **AuthorizedFeature** - Flexible authorization wrapper
✅ **Specialized gates** - SearchDateGate, AlertsGate, DashboardGate
✅ **UserContext updated** - Added searchDayLimit helper
✅ **Build verified** - No errors, ready for production

**PHASE 2A COMPLETE - READY FOR INTEGRATION AND TESTING**

---

**Generated:** 2025-12-08T05:00:00Z
**Sprint:** Sprint 3 Day 2 - Phase 2A
**Feature:** Permission Hook System
