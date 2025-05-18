import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Alert system component for monitoring misinformation and emerging concerns
const AlertSystem = ({ api }) => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  
  // Fetch alerts from API
  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        setLoading(true);
        
        // For the hackathon demo, we'll use sample data
        // In a production environment, you would make an actual API call:
        // const response = await api.get('/alerts', {
        //   params: { severity: filter !== 'all' ? filter : undefined }
        // });
        // setAlerts(response.data);
        
        // Sample alert data
        const sampleAlerts = [
          {
            id: 1,
            type: 'misinformation',
            content: 'Claim that prices have tripled across all routes is spreading on social media',
            severity: 'high',
            date: '2025-05-15',
            sources: ['Twitter', 'Facebook', 'WhatsApp groups'],
            suggested_response: 'Publish official fare comparison chart showing actual price changes and distribute through official channels and media partners.',
            hasResponse: false
          },
          {
            id: 2,
            type: 'emerging_concern',
            content: 'Complaints about card reader malfunctions at busy stations',
            severity: 'medium',
            date: '2025-05-16',
            sources: ['Customer feedback', 'Twitter'],
            suggested_response: 'Acknowledge the issue and communicate planned maintenance schedule.',
            hasResponse: true
          },
          {
            id: 3,
            type: 'sentiment_spike',
            content: 'Sudden increase in negative sentiment regarding transfer policies',
            severity: 'medium',
            date: '2025-05-17',
            sources: ['News Comments', 'Twitter', 'Forums'],
            suggested_response: 'Clarify transfer policy with infographics and simple explanations.',
            hasResponse: false
          },
          {
            id: 4,
            type: 'misinformation',
            content: 'False rumors about impending fare increases in June',
            severity: 'high',
            date: '2025-05-18',
            sources: ['Facebook', 'WhatsApp groups'],
            suggested_response: 'Issue official statement denying planned increases and reaffirm price stability commitment.',
            hasResponse: false
          },
          {
            id: 5,
            type: 'emerging_concern',
            content: 'Confusion about how distance is calculated for fare pricing',
            severity: 'low',
            date: '2025-05-14',
            sources: ['Surveys', 'Customer feedback'],
            suggested_response: 'Create educational content about distance calculation methodology.',
            hasResponse: true
          }
        ];
        
        // Filter based on severity if needed
        const filteredAlerts = filter === 'all' 
          ? sampleAlerts 
          : sampleAlerts.filter(alert => alert.severity === filter);
        
        setAlerts(filteredAlerts);
        setLoading(false);
      } catch (err) {
        setError('Failed to load alerts. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchAlerts();
    
    // Set up polling for real-time updates
    const intervalId = setInterval(fetchAlerts, 60000); // Poll every minute
    
    return () => clearInterval(intervalId);
  }, [api, filter]);
  
  // Handle resolving an alert
  const handleResolveAlert = async (alertId) => {
    try {
      // In a production environment:
      // await api.post(`/alerts/${alertId}/resolve`);
      
      // For the demo, just update local state
      setAlerts(alerts.filter(alert => alert.id !== alertId));
    } catch (err) {
      setError('Failed to resolve alert. Please try again.');
    }
  };
  
  // Handle creating a response to misinformation
  const handleCreateResponse = async (alertId, response) => {
    try {
      // In a production environment:
      // await api.post(`/alerts/${alertId}/respond`, { response });
      
      // For the demo, just update local state
      setAlerts(alerts.map(alert => 
        alert.id === alertId ? { ...alert, hasResponse: true } : alert
      ));
    } catch (err) {
      setError('Failed to save response. Please try again.');
    }
  };

  const alertTypeIcon = (type) => {
    switch (type) {
      case 'misinformation':
        return (
          <div className="bg-red-100 text-red-600 p-2 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'emerging_concern':
        return (
          <div className="bg-yellow-100 text-yellow-600 p-2 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 8a1 1 0 102 0v-1a1 1 0 10-2 0v1z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'sentiment_spike':
        return (
          <div className="bg-blue-100 text-blue-600 p-2 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-700 p-4 rounded-lg">
        <p>{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-2 bg-red-100 text-red-800 px-4 py-2 rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Alert Monitoring System</h2>
        <div className="flex space-x-2">
          <button 
            onClick={() => setFilter('all')} 
            className={`px-3 py-1 rounded text-sm ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            All
          </button>
          <button 
            onClick={() => setFilter('high')} 
            className={`px-3 py-1 rounded text-sm ${filter === 'high' ? 'bg-red-600 text-white' : 'bg-gray-200'}`}
          >
            High Priority
          </button>
          <button 
            onClick={() => setFilter('medium')} 
            className={`px-3 py-1 rounded text-sm ${filter === 'medium' ? 'bg-yellow-600 text-white' : 'bg-gray-200'}`}
          >
            Medium
          </button>
          <button 
            onClick={() => setFilter('low')} 
            className={`px-3 py-1 rounded text-sm ${filter === 'low' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}
          >
            Low
          </button>
        </div>
      </div>
      
      {alerts.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p>No active alerts at this time.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {alerts.map(alert => (
            <div 
              key={alert.id} 
              className={`p-4 rounded-lg border-l-4 ${
                alert.severity === 'high' ? 'border-red-500 bg-red-50' : 
                alert.severity === 'medium' ? 'border-yellow-500 bg-yellow-50' : 
                'border-blue-500 bg-blue-50'
              }`}
            >
              <div className="flex items-start">
                <div className="mr-4 flex-shrink-0">
                  {alertTypeIcon(alert.type)}
                </div>
                <div className="flex-grow">
                  <div className="flex justify-between">
                    <h3 className="font-bold text-gray-800">
                      {alert.type === 'misinformation' ? 'Potential Misinformation' : 
                       alert.type === 'emerging_concern' ? 'Emerging Public Concern' : 
                       'Sentiment Spike Detected'}
                    </h3>
                    <span className="text-sm text-gray-500">{alert.date}</span>
                  </div>
                  <p className="text-gray-700 mt-1">{alert.content}</p>
                  
                  {alert.sources && alert.sources.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600 font-medium">Sources:</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {alert.sources.map((source, index) => (
                          <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {source}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {alert.suggested_response && (
                    <div className="mt-3 p-3 bg-white rounded border border-gray-200">
                      <p className="text-sm text-gray-600 font-medium">Suggested Response:</p>
                      <p className="text-sm mt-1">{alert.suggested_response}</p>
                    </div>
                  )}
                  
                  <div className="mt-4 flex justify-end space-x-3">
                    {!alert.hasResponse && alert.type === 'misinformation' && (
                      <button 
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm"
                        onClick={() => {
                          const response = prompt('Enter response to this misinformation:');
                          if (response) handleCreateResponse(alert.id, response);
                        }}
                      >
                        Create Response
                      </button>
                    )}
                    <button 
                      className="px-3 py-1 bg-green-100 text-green-800 rounded text-sm"
                      onClick={() => handleResolveAlert(alert.id)}
                    >
                      Mark Resolved
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AlertSystem;