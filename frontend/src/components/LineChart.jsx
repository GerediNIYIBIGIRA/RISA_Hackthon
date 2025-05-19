import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart, LineElement, CategoryScale, LinearScale, PointElement, Legend, Tooltip } from 'chart.js';
Chart.register(LineElement, CategoryScale, LinearScale, PointElement, Legend, Tooltip);

const LineChart = ({ data }) => {
  // Transform your data to fit Chart.js format
  const labels = data.map(item => item.date);
  const chartData = {
    labels,
    datasets: [
      {
        label: 'Positive',
        data: data.map(item => item.positive),
        borderColor: 'green',
        fill: false,
      },
      {
        label: 'Neutral',
        data: data.map(item => item.neutral),
        borderColor: 'gray',
        fill: false,
      },
      {
        label: 'Negative',
        data: data.map(item => item.negative),
        borderColor: 'red',
        fill: false,
      },
    ],
  };
  return <Line data={chartData} />;
};

export default LineChart;
