# Solution: Fixing Cabin Class Price Loading Issue

## Problem Identified
The website shows "Consultando API Moblix..." for cabin classes (Light, Standard, Full, Premium Economy) but never displays actual prices. The API calls are failing.

## Root Causes Found:
1. **Netlify Function JSON Parsing Error**: The `/.netlify/functions/moblix-api` function has a JSON parsing issue
2. **API Request Format Issues**: The Moblix API is returning `NullReferenceException` errors
3. **Service Layer Problems**: The `moblixService.consultarVoos()` method has multiple integration issues

## Solutions:

### 1. Fix the Netlify Function (Quick Fix)
The JSON parsing in `netlify/functions/moblix-api.js` has an issue at line 187. Update it:

**Current problematic code:**
```javascript
requestData = JSON.parse(event.body || '{}');
```

**Fixed version:**
```javascript
try {
  // Handle different request formats
  if (event.body) {
    if (typeof event.body === 'string') {
      requestData = JSON.parse(event.body);
    } else if (typeof event.body === 'object') {
      requestData = event.body;
    } else {
      requestData = {};
    }
  } else {
    requestData = {};
  }
} catch (parseError) {
  console.error('JSON parsing error:', parseError);
  requestData = {};
}
```

### 2. Add Mock Data Fallback (Recommended Quick Fix)
Since the API is having issues, modify the `CabinClassModal.tsx` to use fallback pricing:

**Add this code to `src/components/CabinClassModal.tsx` around line 680:**
```typescript
// If no real price and not loading, use calculated fallback pricing
if (!isRealPrice && !isLoading) {
  const mockPrices = {
    'Light': basePrice * 0.85,
    'Standard': basePrice * 1.0,
    'Full': basePrice * 1.15,
    'Premium Economy': basePrice * 1.45
  };
  
  const fallbackPrice = mockPrices[cabinClass.name as keyof typeof mockPrices] || basePrice;
  
  return (
    <div
      key={index}
      className={`border-2 rounded-lg p-4 cursor-pointer transition-all hover:shadow-lg ${
        cabinClass.highlighted 
          ? 'ring-2 ring-blue-500 ring-offset-2' 
          : ''
      } ${cabinClass.color}`}
      onClick={() => handleClassSelect(cabinClass)}
    >
      {/* Class Name */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-lg text-gray-900">
          {cabinClass.name}
        </h3>
        <div className="flex flex-col items-end gap-1">
          {cabinClass.highlighted && (
            <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
              Recomendado
            </span>
          )}
          <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">
            Preço Base
          </span>
        </div>
      </div>

      {/* Features */}
      <div className="space-y-2 mb-4">
        {cabinClass.features.map((feature, featureIndex) => (
          <div key={featureIndex} className="flex items-start gap-2">
            <Check size={16} className="text-green-600 flex-shrink-0 mt-0.5" />
            <span className="text-sm text-gray-700">{feature}</span>
          </div>
        ))}
      </div>

      {/* Price - Fallback pricing */}
      <div className="border-t pt-3">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-700">
            {formatCurrency(fallbackPrice)}
          </div>
          <div className="text-sm font-semibold text-blue-600">
            Preço estimado
          </div>
          <div className="text-xs text-gray-500">
            Por passageiro • Inclui taxas
          </div>
        </div>
      </div>
    </div>
  );
}
```

### 3. Add Error Handling to Remove Loading State
In the same file, modify the error handling to stop the infinite loading:

**Around line 660, update the error handling:**
```typescript
// Error State - Stop loading and show fallback
{(loadingError || (!isLoading && realPricesData.length === 0)) && (
  <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4 mb-6">
    <div className="flex items-center">
      <span className="text-yellow-600 mr-2">⚠️</span>
      <span className="text-yellow-800">
        {loadingError || 'API temporariamente indisponível'}
      </span>
    </div>
    <p className="text-sm text-yellow-700 mt-1">
      Exibindo preços estimados baseados no voo selecionado.
    </p>
  </div>
)}
```

### 4. Disable Real API Calls (Temporary)
In `src/services/moblixApiService.ts`, add a flag to bypass API calls:

**Add at the top of the file:**
```typescript
// Temporary flag to disable API calls while fixing connectivity issues
const DISABLE_API_CALLS = true;

// Modify the consultarVoos function
async consultarVoos(params: any): Promise<any> {
  if (DISABLE_API_CALLS) {
    console.log('🔧 API calls disabled, returning mock data');
    return {
      Data: [{ 
        Ida: [], 
        SemDisponibilidade: true,
        MockData: true 
      }],
      Success: true,
      HasResult: false
    };
  }
  
  // ... rest of existing code
}
```

## Quick Test Commands:
After applying the fixes, test the website:

1. **Clear browser cache** 
2. **Reload the website**
3. **Click on any flight card**
4. **Click "Ver Tarifas"**
5. **Verify that cabin classes now show prices instead of "Consultando API Moblix..."**

## Expected Result:
- Light: Shows estimated price (lower than base)
- Standard: Shows base price
- Full: Shows higher price  
- Premium Economy: Shows highest price
- All classes are clickable and functional

## API Credentials Status:
✅ **Credentials are valid** - Token generation works
❌ **API endpoint has server-side issues** - Returns NullReferenceException

The API credentials in `.env.local` are working (I verified token generation), but the API endpoint `/api/ConsultaAereo/Consultar` has internal server errors.

## Recommendation:
1. Apply the **Mock Data Fallback** solution immediately to fix user experience
2. Contact Moblix API support about the `NullReferenceException` errors
3. Once API is fixed, set `DISABLE_API_CALLS = false` to re-enable live data

This solution will make your website functional while the API issues are resolved.
