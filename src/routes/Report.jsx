import React from "react";
import Sidebar from "../Components/Sidebar";
import Header from "../Components/Header";
import Footer from "../Components/Footer";
import Report from "../Components/Report";
// import "../Components/Generics.css";

export default function Reports({ onNavigate, activePage }) {
  return (
    <div >
      <Sidebar onNavigate={onNavigate} activePage={activePage} />
      <div className="dashboard-main">
        <Header />
        <Report />
        <div className="dashboard-footer">
          <Footer />
        </div>
      </div>
    </div>
  );
}