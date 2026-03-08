import React, { useState, useEffect } from "react";
import "./Dispensary.css";



export default function Dispensary() {
  const [search, setSearch] = useState("");
  const [entries, setEntries] = useState(5);
  const [page, setPage] = useState(1);
  const dispensaries = [
    { code: "PL-ST586578", title: "A&E Night", branch: "A&E", store: "A&E Store", status: "Active" },
    { code: "PL-ST586535", title: "A&E Morning", branch: "A&E", store: "A&E Store", status: "Active" },
    { code: "PL-ST448373", title: "A&E Evening", branch: "A&E", store: "A&E Store", status: "Active" },
    { code: "PL-ST623049", title: "A&E Weekend", branch: "A&E", store: "A&E Store", status: "Active" },
    { code: "PL-ST586578", title: "A&E Night", branch: "A&E", store: "A&E Store", status: "Active" },
    { code: "PL-ST586535", title: "A&E Morning", branch: "A&E", store: "A&E Store", status: "Active" },
    { code: "PL-ST448373", title: "A&E Evening", branch: "A&E", store: "A&E Store", status: "Active" },
    { code: "PL-ST623049", title: "A&E Weekend", branch: "A&E", store: "A&E Store", status: "Active" },
    { code: "PL-ST586578", title: "A&E Night", branch: "A&E", store: "A&E Store", status: "Active" },
    { code: "PL-ST586535", title: "A&E Morning", branch: "A&E", store: "A&E Store", status: "Active" },
    { code: "PL-ST448373", title: "A&E Evening", branch: "A&E", store: "A&E Store", status: "Active" },];
  const filtered = dispensaries.filter(
    d =>
      d.code.toLowerCase().includes(search.toLowerCase()) ||
      d.title.toLowerCase().includes(search.toLowerCase()) ||
      d.branch.toLowerCase().includes(search.toLowerCase()) ||
      d.store.toLowerCase().includes(search.toLowerCase()) ||
      d.status.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / entries);
  const startIdx = (page - 1) * entries;
  const endIdx = startIdx + entries;
  const pageData = filtered.slice(startIdx, endIdx);

  const handlePrev = () => setPage(page > 1 ? page - 1 : 1);
  const handleNext = () => setPage(page < totalPages ? page + 1 : totalPages);

  useEffect(() => {
    setPage(1);
  }, [search, entries]);

  return (
      <div className="dispensary-container">
        <h2 className="dispensary-title">Latest 10 Transaction</h2>
        <div className="dispensary-controls">
        
        
        </div>
        <div className="dispensary-table-wrapper">
          <table className="dispensary-table">
            <thead>
              <tr>
                <th>S/N</th>
                <th>CODE</th>
                <th>TITLE</th>
                <th>BRANCH</th>
                <th>STORE</th>
                <th>STATUS</th>
                <th>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {pageData.map((d, i) => (
                <tr key={d.code + i}>
                  <td>{startIdx + i + 1}</td>
                  <td>{d.code}</td>
                  <td>{d.title}</td>
                  <td>{d.branch}</td>
                  <td>{d.store}</td>
                  <td className="dispensary-status">{d.status}</td>
                  <td>
                    <button className="dispensary-action">
                      <span className="dispensary-dots">⋮</span>
                    </button>
                  </td>
                </tr>
              ))}
              {pageData.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", color: "#888" }}>
                    No Transaction found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="dispensary-footer">
         
          <div className="dispensary-pagination">
          
          
          </div>
        </div>
      </div>
  );
}