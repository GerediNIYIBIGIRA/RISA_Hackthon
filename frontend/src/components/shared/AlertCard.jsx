import React from 'react';

const AlertCard = ({ alert }) => {
  // Determine the appropriate border and background color based on severity
  const getAlertStyle = () => {
    switch (alert.severity) {
      case 'high':
        return 'border-red-500 bg-red-50';
      case 'medium':
        return 'border-orange-500 bg-orange-50';
      case 'low':
        return 'border-yellow-500 bg-yellow-50';
      default:
        return 'border-blue-500 bg-blue-50';
    }
  };

  // Get the alert type label
  const getAlertTypeLabel = () => {
    switch (alert.type) {
      case 'misinformation':
        return 'MISINFORMATION';
      case 'emerging_concern':
        return 'EMERGING CONCERN';
      case 'sentiment_spike':
        return 'SENTIMENT SPIKE';
      default:
        return 'ALERT';
    }
  };

  return (
    <div className={`mb-3 p-3 rounded border-l-4 ${getAlertStyle()}`}>
      <div className="flex justify-between">
        <span className="font-bold text-sm">{getAlertTypeLabel()}</span>
        <span className="text-xs text-gray-500">{alert.date}</span>
      </div>
      <p className="text-sm mt-1">{alert.content}</p>
    </div>
  );
};

export default AlertCard;