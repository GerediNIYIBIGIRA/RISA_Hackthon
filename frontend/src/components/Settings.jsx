import React from 'react';

const Settings = ({ api, user }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4">Settings</h2>
      <p className="text-gray-600">
        This component will show user settings. For the hackathon demo, this is a placeholder.
      </p>
      {user && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <h3 className="font-medium">Current User</h3>
          <p>Name: {user.name}</p>
          <p>Email: {user.email}</p>
        </div>
      )}
    </div>
  );
};

export default Settings;