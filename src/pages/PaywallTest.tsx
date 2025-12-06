import React from 'react'
import { PaywallProvider, usePaywall, PaywallOverlay, UpgradePrompt } from '../components/paywall'

function TestContent() {
  const {
    showPaywallModal,
    hidePaywallModal,
    isModalVisible,
    modalContext,
    modalFlightCount,
    shouldShowPaywall
  } = usePaywall()

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-8">
        <h1
          className="text-4xl font-bold text-center mb-2"
          style={{
            fontFamily: 'Playfair Display, serif',
            color: '#4896C7'
          }}
        >
          SemViagem Paywall Test
        </h1>
        <p className="text-center text-gray-600 italic">
          Design System Compliance Review
        </p>
      </div>

      {/* Test Controls */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">
            Test Controls
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Modal Tests */}
            <div>
              <h3 className="font-medium mb-3 text-gray-700">Modal Tests</h3>
              <div className="space-y-2">
                <button
                  onClick={() => showPaywallModal('flights', 42)}
                  className="w-full text-white font-medium py-2 px-4 rounded transition-opacity hover:opacity-90"
                  style={{ backgroundColor: '#4896C7' }}
                >
                  Show Modal: 42 Flights Found
                </button>

                <button
                  onClick={() => showPaywallModal('flights', 0)}
                  className="w-full text-white font-medium py-2 px-4 rounded transition-opacity hover:opacity-90"
                  style={{ backgroundColor: '#4896C7' }}
                >
                  Show Modal: General Context
                </button>

                <button
                  onClick={() => showPaywallModal('search', 0)}
                  className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded transition-colors"
                >
                  Show Modal: Search Context
                </button>
              </div>
            </div>

            {/* Status Display */}
            <div>
              <h3 className="font-medium mb-3 text-gray-700">Current Status</h3>
              <div className="bg-gray-50 rounded p-3 text-sm space-y-1">
                <div><strong>Modal Visible:</strong> {isModalVisible ? 'Yes' : 'No'}</div>
                <div><strong>Context:</strong> {modalContext}</div>
                <div><strong>Flight Count:</strong> {modalFlightCount}</div>
                <div><strong>Should Show Paywall:</strong> {shouldShowPaywall('flights') ? 'Yes' : 'No'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* UpgradePrompt Examples */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">
            UpgradePrompt Components
          </h2>

          <div className="space-y-4">
            {/* Results Found Banner */}
            <div>
              <h3 className="font-medium mb-2 text-gray-700">Context: Results Found</h3>
              <UpgradePrompt
                context="results-found"
                onUpgrade={() => showPaywallModal('flights', 73)}
                onDismiss={() => console.log('Results banner dismissed')}
              />
            </div>

            {/* Search Limit Banner */}
            <div>
              <h3 className="font-medium mb-2 text-gray-700">Context: Search Limit</h3>
              <UpgradePrompt
                context="search-limit"
                onUpgrade={() => showPaywallModal('search', 0)}
                onDismiss={() => console.log('Search limit banner dismissed')}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Design System Verification */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">
            Design System Verification
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Colors */}
            <div>
              <h3 className="font-medium mb-3 text-gray-700">Brand Colors</h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <div
                    className="w-8 h-8 rounded border"
                    style={{ backgroundColor: '#4896C7' }}
                  ></div>
                  <span className="text-sm">Primary Blue: #4896C7</span>
                </div>

                <div className="flex items-center space-x-3">
                  <div
                    className="w-8 h-8 rounded border"
                    style={{ backgroundColor: '#F0C730' }}
                  ></div>
                  <span className="text-sm">Yellow Accent: #F0C730</span>
                </div>

                <div className="flex items-center space-x-3">
                  <div
                    className="w-8 h-8 rounded border"
                    style={{ backgroundColor: '#22C55E' }}
                  ></div>
                  <span className="text-sm">Success Green: #22C55E</span>
                </div>
              </div>
            </div>

            {/* Typography */}
            <div>
              <h3 className="font-medium mb-3 text-gray-700">Typography</h3>
              <div className="space-y-3">
                <div>
                  <p
                    className="text-xl italic"
                    style={{
                      fontFamily: 'Playfair Display, serif',
                      color: '#4896C7'
                    }}
                  >
                    Viaje o mundo quase de graça
                  </p>
                  <span className="text-xs text-gray-500">Playfair Display, italic</span>
                </div>

                <div>
                  <p className="text-base">
                    Encontre voos baratos usando milhas
                  </p>
                  <span className="text-xs text-gray-500">System font, body text</span>
                </div>

                <div>
                  <p
                    className="text-lg font-bold"
                    style={{ color: '#F0C730' }}
                  >
                    R$ 29,90/mês
                  </p>
                  <span className="text-xs text-gray-500">Pricing, yellow accent</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Test Instructions */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <h3 className="font-medium text-blue-900 mb-2">
            📱 Mobile Testing Instructions
          </h3>
          <p className="text-blue-800 text-sm">
            Open browser dev tools (F12) → Toggle device toolbar →
            Test on iPhone/Android sizes → Verify touch targets,
            readability, and modal responsiveness
          </p>
        </div>
      </div>

      {/* PaywallOverlay (controlled by buttons above) */}
      <PaywallOverlay
        isVisible={isModalVisible}
        onClose={hidePaywallModal}
        flightCount={modalFlightCount}
        context={modalContext}
      />
    </div>
  )
}

export function PaywallTest() {
  return (
    <PaywallProvider>
      <TestContent />
    </PaywallProvider>
  )
}
