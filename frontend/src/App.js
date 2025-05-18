// import React, { useState, useEffect } from 'react';
// import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
// import axios from 'axios';
// import Dashboard from './components/Dashboard';
// import AlertSystem from './components/AlertSystem';
// import TopicAnalysis from './components/TopicAnalysis';
// import DemographicAnalysis from './components/DemographicAnalysis';
// import GeographicView from './components/GeographicView';
// import Reports from './components/Reports';
// import Settings from './components/Settings';
// import Login from './components/Login';
// import './App.css';

// // Load environment variables
// const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

// // Create axios instance with base URL
// const api = axios.create({
//   baseURL: API_BASE_URL,
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });

// function App() {
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [sidebarOpen, setSidebarOpen] = useState(true);

//   // Check for existing auth token on component mount
//   useEffect(() => {
//     const token = localStorage.getItem('auth_token');
//     if (token) {
//       api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
//       fetchUserProfile();
//     } else {
//       setLoading(false);
//     }
//   }, []);

//   // Fetch user profile if token exists
//   const fetchUserProfile = async () => {
//     try {
//       const response = await api.get('/users/profile');
//       setUser(response.data);
//       setIsAuthenticated(true);
//       setLoading(false);
//     } catch (error) {
//       console.error('Error fetching user profile:', error);
//       localStorage.removeItem('auth_token');
//       delete api.defaults.headers.common['Authorization'];
//       setLoading(false);
//     }
//   };

//   // Handle login
//   const handleLogin = async (credentials) => {
//     try {
//       const response = await api.post('/auth/login', credentials);
//       const { token, user } = response.data;
      
//       localStorage.setItem('auth_token', token);
//       api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
//       setUser(user);
//       setIsAuthenticated(true);
//       return true;
//     } catch (error) {
//       console.error('Login error:', error);
//       return false;
//     }
//   };

//   // Handle logout
//   const handleLogout = () => {
//     localStorage.removeItem('auth_token');
//     delete api.defaults.headers.common['Authorization'];
//     setUser(null);
//     setIsAuthenticated(false);
//   };

//   // Toggle sidebar
//   const toggleSidebar = () => {
//     setSidebarOpen(!sidebarOpen);
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-screen">
//         <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-700"></div>
//       </div>
//     );
//   }

//   if (!isAuthenticated) {
//     return <Login onLogin={handleLogin} />;
//   }

//   return (
//     <Router>
//       <div className="flex h-screen bg-gray-100">
//         {/* Sidebar */}
//         <div className={`bg-gray-800 text-white w-64 space-y-6 py-7 px-2 absolute inset-y-0 left-0 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition duration-200 ease-in-out z-10`}>
//           <div className="flex items-center space-x-2 px-4">
//             <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
//               <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
//               <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.478 0-8.268-2.943-9.542-7zM10 15a5 5 0 100-10 5 5 0 000 10z" clipRule="evenodd" />
//             </svg>
//             <h1 className="text-lg font-bold">Rwanda Transport<br />Sentiment Dashboard</h1>
//           </div>

//           <nav>
//             <Link to="/" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700">
//               Dashboard
//             </Link>
//             <Link to="/alerts" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700">
//               Alerts & Issues
//             </Link>
//             <Link to="/topics" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700">
//               Topic Analysis
//             </Link>
//             <Link to="/demographics" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700">
//               Demographic Analysis
//             </Link>
//             <Link to="/geographic" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700">
//               Geographic View
//             </Link>
//             <Link to="/reports" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700">
//               Reports
//             </Link>
//             <Link to="/settings" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700">
//               Settings
//             </Link>
//           </nav>

//           <div className="px-4 mt-auto">
//             <div className="flex items-center space-x-2 mt-6">
//               <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
//                 {user.name.charAt(0)}
//               </div>
//               <div>
//                 <p className="text-sm font-medium">{user.name}</p>
//                 <button 
//                   onClick={handleLogout} 
//                   className="text-xs text-gray-400 hover:text-white transition duration-200"
//                 >
//                   Sign out
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Main content */}
//         <div className="flex-1 flex flex-col overflow-hidden">
//           {/* Top header */}
//           <header className="bg-white shadow-sm z-10">
//             <div className="px-4 py-3 flex justify-between items-center">
//               <button 
//                 onClick={toggleSidebar}
//                 className="md:hidden rounded-md p-2 inline-flex items-center justify-center text-gray-500 hover:text-gray-600 hover:bg-gray-100 focus:outline-none"
//               >
//                 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
//                 </svg>
//               </button>
              
//               <div className="flex items-center space-x-4">
//                 <button className="bg-blue-100 text-blue-600 px-4 py-2 rounded-md text-sm font-medium">
//                   Export Data
//                 </button>
//                 <span className="text-sm text-gray-500">Last updated: {new Date().toLocaleString()}</span>
//               </div>
//             </div>
//           </header>

//           {/* Main content area */}
//           <main className="flex-1 overflow-y-auto p-4">
//             <Routes>
//               <Route path="/" element={<Dashboard api={api} />} />
//               <Route path="/alerts" element={<AlertSystem api={api} />} />
//               <Route path="/topics" element={<TopicAnalysis api={api} />} />
//               <Route path="/demographics" element={<DemographicAnalysis api={api} />} />
//               <Route path="/geographic" element={<GeographicView api={api} />} />
//               <Route path="/reports" element={<Reports api={api} />} />
//               <Route path="/settings" element={<Settings api={api} user={user} />} />
//             </Routes>
//           </main>

//           {/* Footer */}
//           <footer className="bg-white p-4 shadow-inner text-center text-sm text-gray-500">
//             Rwanda Transport Fare Sentiment Analysis System © 2025
//           </footer>
//         </div>
//       </div>
//     </Router>
//   );
// }

// export default App;


// Modified App.js to skip login for hackathon demo


// ###################################################################################################

// import React from 'react';
// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import Dashboard from './components/Dashboard';
// import AlertSystem from './components/AlertSystem';
// import TopicAnalysis from './components/TopicAnalysis';
// import DemographicAnalysis from './components/DemographicAnalysis';
// import GeographicView from './components/GeographicView';
// import Reports from './components/Reports';
// import Settings from './components/Settings';
// import './App.css';

// // Create a mock API service for demo
// const api = {
//   get: (endpoint) => {
//     console.log(`Mock API GET request to ${endpoint}`);
//     return Promise.resolve({ data: {} });
//   },
//   post: (endpoint, data) => {
//     console.log(`Mock API POST request to ${endpoint}`, data);
//     return Promise.resolve({ data: {} });
//   }
// };

// // Mock user for demo
// const demoUser = {
//   name: 'Demo User',
//   email: 'demo@example.com',
//   role: 'admin',
//   permissions: ['dashboard_access', 'reports_access']
// };

// function App() {
//   return (
//     <Router>
//       <div className="flex h-screen bg-gray-100">
//         {/* Sidebar */}
//         <div className="bg-gray-800 text-white w-64 space-y-6 py-7 px-2 absolute inset-y-0 left-0 transform md:relative md:translate-x-0 transition duration-200 ease-in-out z-10">
//           <div className="flex items-center space-x-2 px-4">
//             <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
//               <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
//               <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.478 0-8.268-2.943-9.542-7zM10 15a5 5 0 100-10 5 5 0 000 10z" clipRule="evenodd" />
//             </svg>
//             <h1 className="text-lg font-bold">Rwanda Transport<br />Sentiment Dashboard</h1>
//           </div>

//           <nav>
//             <a href="/" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700">
//               Dashboard
//             </a>
//             <a href="/alerts" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700">
//               Alerts & Issues
//             </a>
//             <a href="/topics" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700">
//               Topic Analysis
//             </a>
//             <a href="/demographics" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700">
//               Demographic Analysis
//             </a>
//             <a href="/geographic" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700">
//               Geographic View
//             </a>
//             <a href="/reports" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700">
//               Reports
//             </a>
//             <a href="/settings" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700">
//               Settings
//             </a>
//           </nav>

//           <div className="px-4 mt-auto">
//             <div className="flex items-center space-x-2 mt-6">
//               <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
//                 {demoUser.name.charAt(0)}
//               </div>
//               <div>
//                 <p className="text-sm font-medium">{demoUser.name}</p>
//                 <span className="text-xs text-gray-400">Demo Mode</span>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Main content */}
//         <div className="flex-1 flex flex-col overflow-hidden">
//           {/* Top header */}
//           <header className="bg-white shadow-sm z-10">
//             <div className="px-4 py-3 flex justify-between items-center">
//               <button className="md:hidden rounded-md p-2 inline-flex items-center justify-center text-gray-500 hover:text-gray-600 hover:bg-gray-100 focus:outline-none">
//                 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
//                 </svg>
//               </button>
              
//               <div className="flex items-center space-x-4">
//                 <button className="bg-blue-100 text-blue-600 px-4 py-2 rounded-md text-sm font-medium">
//                   Export Data
//                 </button>
//                 <span className="text-sm text-gray-500">Last updated: {new Date().toLocaleString()}</span>
//               </div>
//             </div>
//           </header>

//           {/* Main content area */}
//           <main className="flex-1 overflow-y-auto p-4">
//             <Routes>
//               <Route path="/" element={<Dashboard api={api} />} />
//               <Route path="/alerts" element={<AlertSystem api={api} />} />
//               <Route path="/topics" element={<TopicAnalysis api={api} />} />
//               <Route path="/demographics" element={<DemographicAnalysis api={api} />} />
//               <Route path="/geographic" element={<GeographicView api={api} />} />
//               <Route path="/reports" element={<Reports api={api} />} />
//               <Route path="/settings" element={<Settings api={api} user={demoUser} />} />
//             </Routes>
//           </main>

//           {/* Footer */}
//           <footer className="bg-white p-4 shadow-inner text-center text-sm text-gray-500">
//             Rwanda Transport Fare Sentiment Analysis System © 2025
//           </footer>
//         </div>
//       </div>
//     </Router>
//   );
// }

// export default App;


// ################################################################

import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import AlertSystem from './components/AlertSystem';
import TopicAnalysis from './components/TopicAnalysis';
import DemographicAnalysis from './components/DemographicAnalysis';
import GeographicView from './components/GeographicView';
import Reports from './components/Reports';
import Settings from './components/Settings';
import Sidebar from './components/shared/Sidebar';
import Header from './components/shared/Header';
import './App.css';

// Create a mock API service for demo
const api = {
  get: (endpoint) => {
    console.log(`Mock API GET request to ${endpoint}`);
    return Promise.resolve({ data: {} });
  },
  post: (endpoint, data) => {
    console.log(`Mock API POST request to ${endpoint}`, data);
    return Promise.resolve({ data: {} });
  }
};

// Mock user for demo
const demoUser = {
  name: 'Demo User',
  email: 'demo@example.com',
  role: 'admin',
  permissions: ['dashboard_access', 'reports_access']
};

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Toggle sidebar
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <Router>
      <div className="flex h-screen bg-gray-100">
        {/* Sidebar */}
        <div className={`${sidebarOpen ? 'block' : 'hidden'} md:block`}>
          <Sidebar user={demoUser} />
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top header */}
          <Header toggleSidebar={toggleSidebar} />

          {/* Main content area */}
          <main className="flex-1 overflow-y-auto p-4">
            <Routes>
              <Route path="/" element={<Dashboard api={api} />} />
              <Route path="/alerts" element={<AlertSystem api={api} />} />
              <Route path="/topics" element={<TopicAnalysis api={api} />} />
              <Route path="/demographics" element={<DemographicAnalysis api={api} />} />
              <Route path="/geographic" element={<GeographicView api={api} />} />
              <Route path="/reports" element={<Reports api={api} />} />
              <Route path="/settings" element={<Settings api={api} user={demoUser} />} />
              <Route path="*" element={<Dashboard api={api} />} />
            </Routes>
          </main>

          {/* Footer */}
          <footer className="bg-white p-4 shadow-inner text-center text-sm text-gray-500">
            Rwanda Transport Fare Sentiment Analysis System © 2025
          </footer>
        </div>
      </div>
    </Router>
  );
}

export default App;