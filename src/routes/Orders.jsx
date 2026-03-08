import React, { useState, useContext } from "react";
import Sidebar from "../Components/Sidebar";
import Header from "../Components/Header";
import Footer from "../Components/Footer";
import Generics from "../Components/Orders";
import { projectAPI } from "../utils/api";
import { AuthContext } from "../context/AuthContext";

export default function Orders({ onNavigate, activePage }) {
  const { currentUser } = useContext(AuthContext);
  const [searchResult, setSearchResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // 🔍 Handle search from Header
  const handleSearch = async (query) => {
    if (!query) {
      setSearchResult(null);
      return;
    }

    setLoading(true);
    try {
      const response = await projectAPI.getAll({ search: query });

      if (response.success && response.projects) {
        setSearchResult(response.projects);
      } else {
        setSearchResult("not-found");
      }
    } catch (err) {
      console.error("Search error:", err);
      setSearchResult("not-found");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="orders-page">
      {/* Sidebar Section */}
      <Sidebar onNavigate={onNavigate} activePage={activePage} />

      {/* Main Dashboard Section */}
      <div className="dashboard-main">
        {/* Header with search bar */}
        <Header onSearch={handleSearch} />

        {/* Orders Content */}
        <div className="dashboard-content">
          {/* Loader */}
          {loading && <p>🔄 Searching...</p>}

          {/* Show Orders when not searching */}
          {!loading && !searchResult && <Generics />}

          {/* Show search result */}
          {!loading && searchResult && searchResult !== "not-found" && (
            <div className="search-result">
              <h3>Search Result</h3>
              <pre>{JSON.stringify(searchResult, null, 2)}</pre>
              <button
                className="reset-btn"
                onClick={() => setSearchResult(null)}
              >
                ⬅ Back to Orders
              </button>
            </div>
          )}

          {/* Not found */}
          {!loading && searchResult === "not-found" && (
            <div className="search-result">
              <p>No results found.</p>
              <button
                className="reset-btn"
                onClick={() => setSearchResult(null)}
              >
                ⬅ Back to Orders
              </button>
            </div>
          )}
        </div>

        {/* Footer (hide on search just like dashboard) */}
        <div className="dashboard-footer">
          {!searchResult && <Footer />}
        </div>
      </div>
    </div>
  );
}
