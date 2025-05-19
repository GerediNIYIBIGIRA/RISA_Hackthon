import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart, ArcElement, Legend, Tooltip } from 'chart.js';
Chart.register(ArcElement, Legend, Tooltip);

const PieChart = ({ data }) => {
  const labels = data.map(item => item.name);
  const values = data.map(item => item.positive + item.neutral + item.negative);
  const chartData = {
    labels,
    datasets: [
      {
        label: 'Demographic',
        data: values,
        backgroundColor: [
          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
          '#FF9F40', '#E7E9ED', '#36A2EB', '#FF6384', '#FFCE56'
        ],
      },
    ],
  };
  return <Pie data={chartData} />;
};

export default PieChart;
