// import React from 'react';

// const Reports = () => {
//   return (
//     <div className="bg-white rounded-lg shadow-md p-6">
//       <h2 className="text-xl font-bold mb-4">Reports</h2>
//       <p className="text-gray-600">
//         This component will show generated reports. For the hackathon demo, this is a placeholder.
//       </p>
//     </div>
//   );
// };

// export default Reports;


import React from 'react';

// Helper: download CSV
function downloadCSV(data, filename = "sentiment-report.csv") {
  const csvRows = [];
  // Get headers
  const headers = Object.keys(data[0]);
  csvRows.push(headers.join(','));
  // Loop over rows
  data.forEach(row => {
    const values = headers.map(h => `"${(row[h] ?? '').toString().replace(/"/g, '""')}"`);
    csvRows.push(values.join(','));
  });
  const csvString = csvRows.join('\n');
  const blob = new Blob([csvString], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.setAttribute('hidden', '');
  a.setAttribute('href', url);
  a.setAttribute('download', filename);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

const Reports = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">Reports</h2>
        <p className="text-gray-600">
          No data available for reports.
        </p>
      </div>
    );
  }

  // Summary statistics
  const total = data.length;
  const pos = data.filter(d => d.Predicted_Sentiment?.toLowerCase() === 'positive').length;
  const neu = data.filter(d => d.Predicted_Sentiment?.toLowerCase() === 'neutral').length;
  const neg = data.filter(d => d.Predicted_Sentiment?.toLowerCase() === 'negative').length;
  const avgScore = (data.reduce((sum, d) => sum + (d.Sentiment_Score || 0), 0) / total).toFixed(2);
  const agreement = (data.filter(d => d.Sentiment_Match).length / total * 100).toFixed(1);

  // Recent 5 records for table
  const recent = data.slice(-5).reverse();

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4">Reports</h2>
      <div className="mb-4">
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={() => downloadCSV(data)}
        >
          Download Full Report (CSV)
        </button>
      </div>
      <div className="mb-4 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-blue-50 rounded">
          <div className="text-2xl font-bold">{total}</div>
          <div className="text-gray-600">Total Comments</div>
        </div>
        <div className="p-4 bg-green-50 rounded">
          <div className="text-2xl font-bold">{pos}</div>
          <div className="text-gray-600">Positive</div>
        </div>
        <div className="p-4 bg-yellow-50 rounded">
          <div className="text-2xl font-bold">{neu}</div>
          <div className="text-gray-600">Neutral</div>
        </div>
        <div className="p-4 bg-red-50 rounded">
          <div className="text-2xl font-bold">{neg}</div>
          <div className="text-gray-600">Negative</div>
        </div>
        <div className="p-4 bg-gray-50 rounded col-span-2">
          <div className="text-xl font-bold">{avgScore}</div>
          <div className="text-gray-600">Average Sentiment Score</div>
        </div>
        <div className="p-4 bg-indigo-50 rounded col-span-2">
          <div className="text-xl font-bold">{agreement}%</div>
          <div className="text-gray-600">Model-Human Agreement</div>
        </div>
      </div>

      <h3 className="text-lg font-bold mt-6 mb-2">Recent Comments</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr>
              <th className="px-2 py-1 text-left">Date</th>
              <th className="px-2 py-1 text-left">Comment</th>
              <th className="px-2 py-1 text-left">Predicted</th>
              <th className="px-2 py-1 text-left">Score</th>
              <th className="px-2 py-1 text-left">District</th>
            </tr>
          </thead>
          <tbody>
            {recent.map((row, i) => (
              <tr key={i}>
                <td className="px-2 py-1">{row.Date}</td>
                <td className="px-2 py-1">{row.Comment?.slice(0, 60)}{row.Comment?.length > 60 ? '...' : ''}</td>
                <td className="px-2 py-1">{row.Predicted_Sentiment}</td>
                <td className="px-2 py-1">{row.Sentiment_Score?.toFixed(2)}</td>
                <td className="px-2 py-1">{row.District}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Reports;
