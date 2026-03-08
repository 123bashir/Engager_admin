import React from "react";
import Sidebar from "../Components/Sidebar";
import Header from "../Components/Header";
import Footer from "../Components/Footer";
import ViewOrder from "../Components/ViewOrder";

export default function viewOrder({ onNavigate, activePage }) {
  return (
    <div >
      <Sidebar onNavigate={onNavigate} activePage={activePage} />
      <div className="dashboard-main">
        <Header />
        <ViewOrder />
        <div className="dashboard-footer">
          <Footer />
        </div>
      </div>
    </div>
  );
}