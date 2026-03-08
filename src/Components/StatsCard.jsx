import React from "react";
import "./StatsCard.css";

export default function StatsCard({ title, value, subtitle, icon }) {
  return (
    <div className="stats-card">
      <div className="stats-icon">{icon}</div>
      <h3>{title}</h3>
      <h2>{value}</h2>
      <p>{subtitle}</p>
    </div>
  );
}
