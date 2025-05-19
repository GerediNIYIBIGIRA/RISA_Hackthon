// // import React from 'react';

// // const DemographicAnalysis = () => {
// //   return (
// //     <div className="bg-white rounded-lg shadow-md p-6">
// //       <h2 className="text-xl font-bold mb-4">Demographic Analysis</h2>
// //       <p className="text-gray-600">
// //         This component will show demographic analysis visualization. For the hackathon demo, this is a placeholder.
// //       </p>
// //     </div>
// //   );
// // };

// // export default DemographicAnalysis;

// import React from 'react';

// const DemographicAnalysis = () => {
//   return (
//     <div className="bg-white rounded-lg shadow-md p-6">
//       <h2 className="text-xl font-bold mb-4">Demographic Analysis</h2>
//       <p className="text-gray-600">
//         This component will show demographic analysis visualization. For the hackathon demo, this is a placeholder.
//       </p>
//     </div>
//   );
// };

// export default DemographicAnalysis;

import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart, BarElement, CategoryScale, LinearScale, Legend, Tooltip } from 'chart.js';
Chart.register(BarElement, CategoryScale, LinearScale, Legend, Tooltip);

const DemographicAnalysis = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">Demographic Analysis</h2>
        <p className="text-gray-600">
          No demographic data available.
        </p>
      </div>
    );
  }

  const labels = data.map(item => item.name);
  const positive = data.map(item => item.positive);
  const neutral = data.map(item => item.neutral);
  const negative = data.map(item => item.negative);

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Positive',
        data: positive,
        backgroundColor: 'rgba(34,197,94,0.7)',
      },
      {
        label: 'Neutral',
        data: neutral,
        backgroundColor: 'rgba(156,163,175,0.7)',
      },
      {
        label: 'Negative',
        data: negative,
        backgroundColor: 'rgba(239,68,68,0.7)',
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: false },
    },
    scales: {
      x: { stacked: true },
      y: { stacked: true, beginAtZero: true },
    },
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4">Demographic Analysis</h2>
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default DemographicAnalysis;
