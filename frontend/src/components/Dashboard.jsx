// import React, { useState, useEffect } from 'react';
// import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

// // Sample data - would be replaced with actual API data
// const sentimentTrends = [
//   { date: '2025-01', positive: 25, neutral: 45, negative: 30 },
//   { date: '2025-02', positive: 28, neutral: 42, negative: 30 },
//   { date: '2025-03', positive: 30, neutral: 40, negative: 30 },
//   { date: '2025-04', positive: 35, neutral: 38, negative: 27 },
//   { date: '2025-05', positive: 38, neutral: 37, negative: 25 },
// ];

// const topConcerns = [
//   { name: 'High prices for long routes', count: 245, sentiment: -0.78 },
//   { name: 'Unclear distance calculations', count: 189, sentiment: -0.65 },
//   { name: 'Improved fairness for short trips', count: 156, sentiment: 0.82 },
//   { name: 'Card system reliability', count: 134, sentiment: -0.55 },
//   { name: 'Transfer policy complications', count: 98, sentiment: -0.48 },
// ];

// const sourceSentiment = [
//   { name: 'Twitter', positive: 35, neutral: 40, negative: 25 },
//   { name: 'Facebook', positive: 30, neutral: 35, negative: 35 },
//   { name: 'News Comments', positive: 25, neutral: 30, negative: 45 },
//   { name: 'Forums', positive: 40, neutral: 35, negative: 25 },
//   { name: 'Surveys', positive: 45, neutral: 30, negative: 25 },
// ];

// const demographicSentiment = [
//   { name: 'Urban Residents', value: 55, sentiment: 'positive' },
//   { name: 'Rural Residents', value: 45, sentiment: 'negative' },
//   { name: 'Students', value: 65, sentiment: 'negative' },
//   { name: 'Working Adults', value: 40, sentiment: 'positive' },
//   { name: 'Elderly', value: 70, sentiment: 'negative' },
// ];

// const COLORS = ['#00C49F', '#FFBB28', '#FF8042', '#0088FE', '#FF0000'];

// const Dashboard = ({ api }) => {
//   const [alerts, setAlerts] = useState([
//     {
//       id: 1,
//       type: 'misinformation',
//       content: 'Claim that prices have tripled across all routes is spreading on social media',
//       severity: 'high',
//       date: '2025-05-15'
//     },
//     {
//       id: 2,
//       type: 'emerging_concern',
//       content: 'Complaints about card reader malfunctions at busy stations',
//       severity: 'medium',
//       date: '2025-05-16'
//     }
//   ]);
  
//   const [timeframe, setTimeframe] = useState('monthly');
//   const [recommendations, setRecommendations] = useState([
//     'Launch educational campaign about distance calculation methods',
//     'Address card reader reliability issues at major stations',
//     'Consider special rates for students based on negative sentiment',
//     'Highlight cost savings for short-distance travelers'
//   ]);
  
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [sentimentData, setSentimentData] = useState({
//     trends: sentimentTrends,
//     concerns: topConcerns,
//     bySource: sourceSentiment,
//     demographic: demographicSentiment
//   });

//   // Fetch dashboard data from API
//   useEffect(() => {
//     const fetchDashboardData = async () => {
//       setLoading(true);
//       setError(null);
      
//       try {
//         // In a production environment, you would make actual API calls:
//         /*
//         const [trendsRes, concernsRes, sourceRes, demoRes, alertsRes, recsRes] = await Promise.all([
//           api.get('/sentiment/overview', { params: { timeframe } }),
//           api.get('/sentiment/concerns'),
//           api.get('/sentiment/by-source'),
//           api.get('/demographics/sentiment'),
//           api.get('/alerts'),
//           api.get('/recommendations')
//         ]);
        
//         setSentimentData({
//           trends: trendsRes.data.sentimentTrends,
//           concerns: concernsRes.data,
//           bySource: sourceRes.data,
//           demographic: demoRes.data
//         });
        
//         setAlerts(alertsRes.data);
//         setRecommendations(recsRes.data);
//         */
        
//         // For the hackathon demo, we'll use the sample data
//         // Simulate API call delay
//         await new Promise(resolve => setTimeout(resolve, 500));
        
//         setSentimentData({
//           trends: sentimentTrends,
//           concerns: topConcerns,
//           bySource: sourceSentiment,
//           demographic: demographicSentiment
//         });
        
//       } catch (err) {
//         console.error('Error fetching dashboard data:', err);
//         setError('Failed to load dashboard data. Please try again.');
//       } finally {
//         setLoading(false);
//       }
//     };
    
//     fetchDashboardData();
//   }, [api, timeframe]);

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-64">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="bg-red-50 text-red-700 p-4 rounded-lg">
//         <p>{error}</p>
//         <button 
//           onClick={() => window.location.reload()} 
//           className="mt-2 bg-red-100 text-red-800 px-4 py-2 rounded"
//         >
//           Retry
//         </button>
//       </div>
//     );
//   }

//   return (
//     <div className="flex flex-col h-screen bg-gray-100">
//       <div className="bg-blue-700 text-white p-4">
//         <h1 className="text-2xl font-bold">Rwanda Transport Fare Sentiment Dashboard</h1>
//         <p className="text-sm">Distance-based fare implementation sentiment analysis</p>
//       </div>
      
//       <div className="p-4 grid grid-cols-12 gap-4 flex-grow overflow-auto">
//         {/* Summary Stats */}
//         <div className="col-span-12 grid grid-cols-4 gap-4">
//           <div className="bg-white p-4 rounded shadow">
//             <h3 className="font-bold text-gray-500 text-sm">OVERALL SENTIMENT</h3>
//             <p className="text-3xl font-bold text-yellow-500">Neutral-Mixed</p>
//             <p className="text-sm text-gray-500">Trending positive +2.5%</p>
//           </div>
          
//           <div className="bg-white p-4 rounded shadow">
//             <h3 className="font-bold text-gray-500 text-sm">SENTIMENT VOLUME</h3>
//             <p className="text-3xl font-bold">12,456</p>
//             <p className="text-sm text-gray-500">Posts analyzed in last 30 days</p>
//           </div>
          
//           <div className="bg-white p-4 rounded shadow">
//             <h3 className="font-bold text-gray-500 text-sm">TOP CONCERN</h3>
//             <p className="text-3xl font-bold text-red-500">Pricing Clarity</p>
//             <p className="text-sm text-gray-500">245 mentions this month</p>
//           </div>
          
//           <div className="bg-white p-4 rounded shadow">
//             <h3 className="font-bold text-gray-500 text-sm">ALERT STATUS</h3>
//             <p className="text-3xl font-bold text-orange-500">Moderate (2)</p>
//             <p className="text-sm text-gray-500">1 high priority alert</p>
//           </div>
//         </div>
        
//         {/* Main sentiment trend chart */}
//         <div className="col-span-8 bg-white p-4 rounded shadow">
//           <div className="flex justify-between items-center mb-4">
//             <h2 className="font-bold text-lg">Sentiment Trends Over Time</h2>
//             <div className="flex space-x-2">
//               <button 
//                 onClick={() => setTimeframe('weekly')}
//                 className={`px-3 py-1 rounded text-sm ${timeframe === 'weekly' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
//               >
//                 Weekly
//               </button>
//               <button 
//                 onClick={() => setTimeframe('monthly')}
//                 className={`px-3 py-1 rounded text-sm ${timeframe === 'monthly' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
//               >
//                 Monthly
//               </button>
//             </div>
//           </div>
          
//           <ResponsiveContainer width="100%" height={300}>
//             <LineChart data={sentimentData.trends}>
//               <CartesianGrid strokeDasharray="3 3" />
//               <XAxis dataKey="date" />
//               <YAxis />
//               <Tooltip />
//               <Legend />
//               <Line type="monotone" dataKey="positive" stroke="#00C49F" strokeWidth={2} />
//               <Line type="monotone" dataKey="neutral" stroke="#FFBB28" strokeWidth={2} />
//               <Line type="monotone" dataKey="negative" stroke="#FF8042" strokeWidth={2} />
//             </LineChart>
//           </ResponsiveContainer>
//         </div>
        
//         {/* Alerts panel */}
//         <div className="col-span-4 bg-white p-4 rounded shadow overflow-y-auto">
//           <h2 className="font-bold text-lg mb-4">Alerts & Issues</h2>
//           {alerts.map(alert => (
//             <div key={alert.id} className={`mb-3 p-3 rounded border-l-4 ${
//               alert.severity === 'high' ? 'border-red-500 bg-red-50' : 
//               alert.severity === 'medium' ? 'border-orange-500 bg-orange-50' : 
//               'border-yellow-500 bg-yellow-50'
//             }`}>
//               <div className="flex justify-between">
//                 <span className="font-bold text-sm">{
//                   alert.type === 'misinformation' ? 'MISINFORMATION' : 
//                   alert.type === 'emerging_concern' ? 'EMERGING CONCERN' : 
//                   'SENTIMENT SPIKE'
//                 }</span>
//                 <span className="text-xs text-gray-500">{alert.date}</span>
//               </div>
//               <p className="text-sm mt-1">{alert.content}</p>
//             </div>
//           ))}
//         </div>
        
//         {/* Top concerns */}
//         <div className="col-span-6 bg-white p-4 rounded shadow">
//           <h2 className="font-bold text-lg mb-4">Top Public Concerns</h2>
//           <ResponsiveContainer width="100%" height={300}>
//             <BarChart data={sentimentData.concerns}>
//               <CartesianGrid strokeDasharray="3 3" />
//               <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
//               <YAxis />
//               <Tooltip />
//               <Bar dataKey="count" fill="#8884d8">
//                 {sentimentData.concerns.map((entry, index) => (
//                   <Cell key={`cell-${index}`} fill={entry.sentiment > 0 ? '#00C49F' : '#FF8042'} />
//                 ))}
//               </Bar>
//             </BarChart>
//           </ResponsiveContainer>
//         </div>
        
//         {/* Source comparison */}
//         <div className="col-span-6 bg-white p-4 rounded shadow">
//           <h2 className="font-bold text-lg mb-4">Sentiment by Source</h2>
//           <ResponsiveContainer width="100%" height={300}>
//             <BarChart
//               data={sentimentData.bySource}
//               layout="vertical"
//               stackOffset="expand"
//               barCategoryGap={20}
//             >
//               <CartesianGrid strokeDasharray="3 3" />
//               <XAxis type="number" tickFormatter={(tick) => `${tick}%`} />
//               <YAxis type="category" dataKey="name" />
//               <Tooltip />
//               <Legend />
//               <Bar dataKey="positive" stackId="a" fill="#00C49F" />
//               <Bar dataKey="neutral" stackId="a" fill="#FFBB28" />
//               <Bar dataKey="negative" stackId="a" fill="#FF8042" />
//             </BarChart>
//           </ResponsiveContainer>
//         </div>
        
//         {/* Demographic breakdown */}
//         <div className="col-span-4 bg-white p-4 rounded shadow">
//           <h2 className="font-bold text-lg mb-4">Demographics Breakdown</h2>
//           <ResponsiveContainer width="100%" height={250}>
//             <PieChart>
//               <Pie
//                 data={sentimentData.demographic}
//                 cx="50%"
//                 cy="50%"
//                 outerRadius={80}
//                 fill="#8884d8"
//                 dataKey="value"
//                 label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
//               >
//                 {sentimentData.demographic.map((entry, index) => (
//                   <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
//                 ))}
//               </Pie>
//               <Tooltip />
//             </PieChart>
//           </ResponsiveContainer>
//         </div>
        
//         {/* Recommendations */}
//         <div className="col-span-8 bg-white p-4 rounded shadow">
//           <h2 className="font-bold text-lg mb-4">Policy Recommendations</h2>
//           <div className="space-y-3">
//             {recommendations.map((rec, index) => (
//               <div key={index} className="flex items-start">
//                 <div className="flex-shrink-0 bg-blue-100 text-blue-600 p-2 rounded-full mr-3">
//                   <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
//                     <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
//                   </svg>
//                 </div>
//                 <div>
//                   <p className="font-medium">{rec}</p>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Dashboard;



// #############################################################################################


import React, { useState, useEffect } from 'react';
import LineChart from './LineChart';      
import BarChart from './BarChart';
import PieChart from './PieChart';

function getSentimentTrends(data) {
  // Group by month, count sentiment
  const grouped = {};
  data.forEach(row => {
    if (!row.Date || !row.Predicted_Sentiment) return;
    const date = row.Date.slice(0, 7); // 'YYYY-MM'
    if (!grouped[date]) grouped[date] = { date, positive: 0, neutral: 0, negative: 0 };
    const sentiment = row.Predicted_Sentiment.toLowerCase();
    if (grouped[date][sentiment] !== undefined) grouped[date][sentiment] += 1;
  });
  return Object.values(grouped).sort((a, b) => a.date.localeCompare(b.date));
}

function getTopConcerns(data) {
  // Count most frequent topics
  const concernCounts = {};
  data.forEach(row => {
    if (row.Topic) {
      if (!concernCounts[row.Topic]) concernCounts[row.Topic] = { name: row.Topic, count: 0, sentiment: 0 };
      concernCounts[row.Topic].count += 1;
      concernCounts[row.Topic].sentiment += row.Sentiment_Score || 0;
    }
  });
  // Average sentiment per concern
  Object.values(concernCounts).forEach(c => {
    c.sentiment = c.count ? c.sentiment / c.count : 0;
  });
  return Object.values(concernCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}

function getSourceBreakdown(data) {
  // Example: by District
  const sources = {};
  data.forEach(row => {
    if (!row.District) return;
    if (!sources[row.District]) sources[row.District] = { name: row.District, positive: 0, neutral: 0, negative: 0 };
    const sentiment = row.Predicted_Sentiment?.toLowerCase();
    if (sources[row.District][sentiment] !== undefined) sources[row.District][sentiment] += 1;
  });
  return Object.values(sources);
}

function getDemographicBreakdown(data) {
  // Example: by Name (or any other demographic field)
  const demo = {};
  data.forEach(row => {
    if (!row.Name) return;
    if (!demo[row.Name]) demo[row.Name] = { name: row.Name, positive: 0, neutral: 0, negative: 0 };
    const sentiment = row.Predicted_Sentiment?.toLowerCase();
    if (demo[row.Name][sentiment] !== undefined) demo[row.Name][sentiment] += 1;
  });
  // Optionally, take top 10
  return Object.values(demo).sort((a, b) => (b.positive + b.neutral + b.negative) - (a.positive + a.neutral + a.negative)).slice(0, 10);
}

const Dashboard = () => {
  const [sentimentData, setSentimentData] = useState({
    trends: [],
    concerns: [],
    bySource: [],
    demographic: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/dashboard-data.json')
      .then(res => res.json())
      .then(data => {
        setSentimentData({
          trends: getSentimentTrends(data),
          concerns: getTopConcerns(data),
          bySource: getSourceBreakdown(data),
          demographic: getDemographicBreakdown(data)
        });
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="dashboard">
      <h2>Sentiment Trends Over Time</h2>
      <LineChart data={sentimentData.trends} />

      <h2>Top Concerns</h2>
      <BarChart data={sentimentData.concerns} />

      <h2>Sentiment by District</h2>
      <BarChart data={sentimentData.bySource} />

      <h2>Sentiment by Demographic</h2>
      <PieChart data={sentimentData.demographic} />
    </div>
  );
};

export default Dashboard;
