import React, { useState, useEffect, useContext } from "react";
import "./Transactions.css";
import { FaBoxOpen, FaEye, FaCalendarDay, FaCalendarAlt, FaCalendar } from "react-icons/fa";
import { FiRefreshCw } from "react-icons/fi";
import { Link } from "react-router-dom";
import { MdPayment } from "react-icons/md";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { AuthContext } from "../context/AuthContext";
import Popup from "./Popup";

export default function Orders() {
  const { currentUser } = useContext(AuthContext);
  const token = currentUser?.token;

  const [summary, setSummary] = useState({
    all: 0,
    today: 0,
    month: 0,
    year: 0,
  });
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [entries, setEntries] = useState(10);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  // Popup state
  const [popup, setPopup] = useState({
    isOpen: false,
    type: "success",
    message: "",
  });

  const showPopup = (message, type = "success") => {
    setPopup({ isOpen: true, message, type });
  };

  const closePopup = () => setPopup((prev) => ({ ...prev, isOpen: false }));

  // ✅ Fetch orders from API
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/orders`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        if (data.success) {
          const orders = data.orders || [];
          setProducts(orders);

          const today = new Date().toISOString().split("T")[0];
          const todayCount = orders.filter(
            (o) => o.created_at && o.created_at.startsWith(today)
          ).length;

          setSummary({
            all: orders.length,
            today: todayCount,
          });
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };

    if (token) fetchOrders();
  }, [token]);

  // ✅ Filtering & Pagination
  const filtered = products.filter((p) => {
    const id = String(p.id ?? "").toLowerCase();
    const name = String(p.name ?? "").toLowerCase();
    const email = String(p.email ?? "").toLowerCase();
    const status = String(p.payment_status ?? "").toLowerCase();

    return (
      id.includes(search.toLowerCase()) ||
      name.includes(search.toLowerCase()) ||
      email.includes(search.toLowerCase()) ||
      status.includes(search.toLowerCase())
    );
  });

  const totalPages = Math.ceil(filtered.length / entries);
  const startIdx = (page - 1) * entries;
  const endIdx = startIdx + entries;
  const pageData = filtered.slice(startIdx, endIdx);

  const handlePrint = () => {
    setLoading(true);
    setTimeout(() => {
      try {
        const doc = new jsPDF();
        doc.setFontSize(16);
        doc.text("ENGAGER - Order Transactions Report", 105, 20, {
          align: "center",
        });
        doc.setFontSize(10);
        doc.text(
          `Generated on: ${new Date().toLocaleString()}`,
          105,
          26,
          { align: "center" }
        );

        autoTable(doc, {
          startY: 40,
          head: [
            ["S/N", "Order ID", "Customer Name", "Email", "Product", "Status"],
          ],
          body: filtered.map((p, i) => [
            i + 1,
            `#ORD-${String(p.id).padStart(5, "0")}`,
            p.name,
            p.email,
            p.product_name || "NFC Product",
            p.payment_status || "Pending",
          ]),
          theme: "grid",
          headStyles: { fillColor: [85, 99, 222], textColor: "#fff" },
        });

        doc.save("Engager_Orders_Report.pdf");
      } catch (err) {
        showPopup("PDF generation failed!", "error");
      }
      setLoading(false);
    }, 1000);
  };

  const handleVerifyPayment = async (orderId) => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/orders/${orderId}/verify-payment`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await res.json();
      if (data.success) {
        showPopup(data.message, "success");
        // Refresh products
        setProducts((prev) =>
          prev.map((p) =>
            p.id === orderId ? { ...p, payment_status: "Paid" } : p
          )
        );
      } else {
        showPopup(data.message || "Verification failed", "error");
      }
    } catch (error) {
      console.error(error);
      showPopup("Network error", "error");
    }
  };

  return (
    <div className="generic-bg">
      <div className="generic-header">
        <h2 className="generic-title">Order Transactions</h2>
        <div className="generic-cards">
          <div className="generic-card">
            <div className="generic-card-icon" style={{ background: "#5563DE" }}>
              <MdPayment />
            </div>
            <div>
              <div className="generic-card-main">{summary.all}</div>
              <div className="generic-card-label">Total Orders</div>
            </div>
          </div>
          <div className="generic-card">
            <div className="generic-card-icon" style={{ background: "#34A853" }}>
              <FaCalendarDay />
            </div>
            <div>
              <div className="generic-card-main">{summary.today}</div>
              <div className="generic-card-label">Orders Today</div>
            </div>
          </div>
        </div>
      </div>

      <div className="generic-content">
        <div className="generic-products-title">Order Log</div>
        <div className="generic-controls">
          <div>
            Show{" "}
            <select
              value={entries}
              onChange={(e) => setEntries(Number(e.target.value))}
              className="generic-select"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
            </select>{" "}
            entries
          </div>
          <div className="generic-actions">
            <button
              className="generic-btn generic-print"
              onClick={handlePrint}
              disabled={loading}
              style={{ background: "#5563DE", color: "white", border: "none" }}
            >
              {loading ? "Exporting..." : "Export PDF Report"}
            </button>
          </div>
          <div className="generic-search-wrap">
            Search:{" "}
            <input
              type="text"
              className="generic-search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter by name or ID..."
            />
          </div>
        </div>

        <div className="generic-table-wrapper">
          <table className="generic-table">
            <thead>
              <tr>
                <th>S/N</th>
                <th>Order ID</th>
                <th>Customer Name</th>
                <th>Email</th>
                <th>Product</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {pageData.map((p, i) => (
                <tr key={p.id}>
                  <td>{startIdx + i + 1}</td>
                  <td>
                    <strong>#ORD-{String(p.id).padStart(5, "0")}</strong>
                  </td>
                  <td>{p.name}</td>
                  <td>{p.email}</td>
                  <td>{p.product_name || "NFC Product"}</td>
                  <td>
                    <span
                      className={`status-badge ${p.payment_status === "Paid"
                          ? "status-completed"
                          : "status-pending"
                        }`}
                    >
                      {p.payment_status || "Pending"}
                    </span>
                  </td>
                  <td style={{ display: "flex", gap: "8px" }}>
                    <Link to={`/projects/view/${p.id}`}>
                      <button
                        className="generic-action-btn view"
                        title="View Order"
                      >
                        <FaEye />
                      </button>
                    </Link>
                    {p.payment_status !== "Paid" && (
                      <button
                        className="generic-action-btn edit"
                        title="Verify Payment"
                        onClick={() => handleVerifyPayment(p.id)}
                        style={{ color: "#34A853" }}
                      >
                        <FiRefreshCw />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {pageData.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    style={{
                      textAlign: "center",
                      color: "#888",
                      padding: "2rem",
                    }}
                  >
                    No Orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="generic-footer">
          <span>
            Showing {filtered.length === 0 ? 0 : startIdx + 1} to{" "}
            {Math.min(startIdx + entries, filtered.length)} of {filtered.length}{" "}
            entries
          </span>
          <div className="generic-pagination">
            <button
              className="generic-page-btn"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </button>
            <span className="generic-page-num">{page}</span>
            <button
              className="generic-page-btn"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || totalPages === 0}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Pop-up for responses */}
      <Popup
        isOpen={popup.isOpen}
        message={popup.message}
        type={popup.type}
        onClose={closePopup}
      />
    </div>
  );
}
