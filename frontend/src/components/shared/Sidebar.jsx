import React from 'react';

const Sidebar = ({ user, onLogout }) => {
  return (
    <div className="bg-gray-800 text-white w-64 space-y-6 py-7 px-2 absolute inset-y-0 left-0 transform md:relative md:translate-x-0 transition duration-200 ease-in-out z-10">
      <div className="flex items-center space-x-2 px-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.478 0-8.268-2.943-9.542-7zM10 15a5 5 0 100-10 5 5 0 000 10z" clipRule="evenodd" />
        </svg>
        <h1 className="text-lg font-bold">Rwanda Transport<br />Sentiment Dashboard</h1>
      </div>

      <nav>
        <a href="/" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700">
          Dashboard
        </a>
        <a href="/alerts" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700">
          Alerts & Issues
        </a>
        <a href="/topics" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700">
          Topic Analysis
        </a>
        <a href="/demographics" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700">
          Demographic Analysis
        </a>
        <a href="/geographic" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700">
          Geographic View
        </a>
        <a href="/reports" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700">
          Reports
        </a>
        <a href="/settings" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700">
          Settings
        </a>
      </nav>

      {user && (
        <div className="px-4 mt-auto">
          <div className="flex items-center space-x-2 mt-6">
            <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
              {user.name.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-medium">{user.name}</p>
              {onLogout ? (
                <button 
                  onClick={onLogout} 
                  className="text-xs text-gray-400 hover:text-white transition duration-200"
                >
                  Sign out
                </button>
              ) : (
                <span className="text-xs text-gray-400">Demo Mode</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;