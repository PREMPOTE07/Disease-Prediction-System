import React from "react";
import { Link } from "react-router-dom";

const Sidebar = ({ user }) => {
  return (
    <div className="w-64 bg-blue-700 text-white p-5 hidden md:block">
      <h2 className="text-2xl font-bold mb-6">🧠 Health AI</h2>

      <p className="mb-4">👤 {user?.fullName}</p>

      <ul className="space-y-3">
        <li className="bg-blue-600 p-2 rounded">Dashboard</li>
        <li className="hover:bg-blue-600 p-2 rounded"><Link to="/patient/history">History</Link></li>
        <li className="hover:bg-blue-600 p-2 rounded">Downloads</li>
      </ul>
    </div>
  );
};

export default Sidebar;