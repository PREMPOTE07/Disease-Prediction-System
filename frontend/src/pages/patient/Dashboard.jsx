import React from "react";
import Sidebar from "../../components/common/Sidebar";
import PredictSection from "./PredictSection";

const Dashboard = () => {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar user={user} />
      <div className="flex-1 p-6">
        <PredictSection />
      </div>
    </div>
  );
};

export default Dashboard;