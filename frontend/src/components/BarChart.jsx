import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart, BarElement, CategoryScale, LinearScale, Legend, Tooltip } from 'chart.js';
Chart.register(BarElement, CategoryScale, LinearScale, Legend, Tooltip);

const BarChart = ({ data }) => {
  // For top concerns or bySource
  const labels = data.map(item => item.name);
  const chartData = {
    labels,
    datasets: [
      {
        label: 'Count',
        data: data.map(item => item.count || item.positive + item.neutral + item.negative),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
      },
    ],
  };
  return <Bar data={chartData} />;
};

export default BarChart;
