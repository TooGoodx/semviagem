import React, { useState } from 'react';
import toast from 'react-hot-toast';

const TestPage: React.FC = () => {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runTest = async (testName: string, testFunction: () => Promise<any>) => {
    setIsRunning(true);
    try {
      console.log(`Running test: ${testName}`);
      const startTime = Date.now();
      const result = await testFunction();
      const endTime = Date.now();
      
      const testResult = {
        name: testName,
        status: 'success',
        duration: endTime - startTime,
        result,
        timestamp: new Date().toLocaleTimeString()
      };
      
      setTestResults(prev => [...prev, testResult]);
      toast.success(`Test "${testName}" passed!`);
    } catch (error: any) {
      const testResult = {
        name: testName,
        status: 'error',
        error: error.message,
        timestamp: new Date().toLocaleTimeString()
      };
      
      setTestResults(prev => [...prev, testResult]);
      toast.error(`Test "${testName}" failed!`);
    } finally {
      setIsRunning(false);
    }
  };

  const tests = {
    'API Connection': async () => {
      // Simulate API test
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { status: 'Connected', response: 'OK' };
    },
    'Authentication': async () => {
      await new Promise(resolve => setTimeout(resolve, 800));
      return { token: 'valid', user: 'authenticated' };
    },
    'Database Query': async () => {
      await new Promise(resolve => setTimeout(resolve, 1200));
      return { records: 42, query: 'SELECT * FROM users' };
    },
    'Performance Test': async () => {
      const start = performance.now();
      await new Promise(resolve => setTimeout(resolve, 500));
      const end = performance.now();
      return { executionTime: `${(end - start).toFixed(2)}ms` };
    },
    'Error Handling': async () => {
      // This test intentionally throws an error sometimes
      if (Math.random() < 0.3) {
        throw new Error('Simulated error for testing');
      }
      return { errorHandling: 'working correctly' };
    }
  };

  const clearResults = () => {
    setTestResults([]);
    toast('Test results cleared');
  };

  const runAllTests = async () => {
    setTestResults([]);
    for (const [testName, testFunction] of Object.entries(tests)) {
      await runTest(testName, testFunction);
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-8 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            🧪 Test Page - Development Environment
          </h1>
          <p className="text-gray-600">
            This page is used for testing components, API connections, and debugging during development.
          </p>
        </div>

        {/* Test Controls */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Test Controls</h2>
          
          <div className="flex flex-wrap gap-4 mb-6">
            <button
              onClick={runAllTests}
              disabled={isRunning}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {isRunning ? '🔄 Running Tests...' : '🚀 Run All Tests'}
            </button>
            
            <button
              onClick={clearResults}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              🗑️ Clear Results
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {Object.entries(tests).map(([testName, testFunction]) => (
              <button
                key={testName}
                onClick={() => runTest(testName, testFunction)}
                disabled={isRunning}
                className="bg-white border-2 border-gray-200 hover:border-blue-500 text-gray-700 px-4 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {testName}
              </button>
            ))}
          </div>
        </div>

        {/* Test Results */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              📊 Test Results ({testResults.length})
            </h2>
          </div>
          
          {testResults.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Test Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Duration
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Details
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {testResults.map((result, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {result.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(result.status)}`}>
                          {result.status === 'success' ? '✅ Success' : '❌ Error'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {result.duration ? `${result.duration}ms` : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {result.timestamp}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {result.error ? (
                          <div className="text-red-600">{result.error}</div>
                        ) : (
                          <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-w-xs">
                            {JSON.stringify(result.result, null, 1)}
                          </pre>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-6 py-12 text-center">
              <div className="text-4xl mb-4">🧪</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No tests run yet</h3>
              <p className="text-gray-600">Run some tests to see results here.</p>
            </div>
          )}
        </div>

        {/* System Info */}
        <div className="bg-white rounded-lg shadow p-6 mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">🔧 System Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Environment</h3>
              <p className="text-gray-600">Development</p>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900 mb-2">React Version</h3>
              <p className="text-gray-600">18.x</p>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900 mb-2">TypeScript</h3>
              <p className="text-gray-600">Enabled</p>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Build Time</h3>
              <p className="text-gray-600">{new Date().toLocaleString('pt-BR')}</p>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900 mb-2">User Agent</h3>
              <p className="text-gray-600 text-sm truncate">{navigator.userAgent}</p>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Screen Resolution</h3>
              <p className="text-gray-600">{window.screen.width} x {window.screen.height}</p>
            </div>
          </div>
        </div>

        {/* Debug Tools */}
        <div className="bg-white rounded-lg shadow p-6 mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">🛠️ Debug Tools</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={() => {
                console.log('Console log test');
                toast('Check browser console');
              }}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-lg font-medium transition-colors"
            >
              📝 Console Log
            </button>
            
            <button
              onClick={() => {
                localStorage.setItem('test-key', 'test-value');
                toast.success('LocalStorage test completed');
              }}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-lg font-medium transition-colors"
            >
              💾 LocalStorage
            </button>
            
            <button
              onClick={() => {
                toast('Toast notification test');
              }}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-lg font-medium transition-colors"
            >
              🔔 Toast Test
            </button>
            
            <button
              onClick={() => {
                window.dispatchEvent(new Event('resize'));
                toast('Window resize event triggered');
              }}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-lg font-medium transition-colors"
            >
              📐 Resize Test
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestPage;
