import React from 'react';

const SentimentCard = ({ title, value, trend, subtext, color }) => {
  // Determine the appropriate color class based on the color prop
  const getColorClass = () => {
    switch (color) {
      case 'red':
        return 'text-red-500';
      case 'green':
        return 'text-green-500';
      case 'blue':
        return 'text-blue-700';
      case 'orange':
        return 'text-orange-500';
      case 'yellow':
        return 'text-yellow-500';
      default:
        return 'text-gray-800';
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="font-bold text-gray-500 text-sm mb-1">{title}</h3>
      <p className={`text-2xl font-bold ${getColorClass()}`}>{value}</p>
      <p className="text-sm text-gray-500">
        {trend && (
          <>
            {trend.startsWith('+') ? 'Trending positive ' : 'Trending negative '} 
            {trend}
          </>
        )}
        {subtext && subtext}
      </p>
    </div>
  );
};

export default SentimentCard;