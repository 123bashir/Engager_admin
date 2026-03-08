import React, { useState, useEffect, useContext } from "react";
import "./Transactions.css";
import { FaCalendarAlt, FaCalendarDay, FaFilter, FaEye, FaCalendar } from "react-icons/fa";
import { Link } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import QRCode from "qrcode";
import * as XLSX from "xlsx";
import { AuthContext } from "../context/AuthContext";
import { MdPayment } from "react-icons/md";
import { useNotification } from "../context/NotificationContext";

const paymentMethods = ["Cash", "Bank Transfer", "POS", "Mobile Money", "Cheque"];
const descriptions = [
  "LUC PAYMENT FEES",
  "SUB DIVISION",
  "APPLICATION FORM PROCESSING FEES",
  "RECERTIFICATION PAYMENT FEES",
  "APPLICATION FORM FEES",
  "ASSIANMENT FEES",
  "OCCUPANCY PERMIT RESETTLEMENT ",
  "SURVEY DEPOSIT FEES",
  "CHANGE OF OWNERSHIP O.S.S FEE",
  "SLTR CLEARANCE ON DEMAND RESIDENTIAL",
  "SITE PLAN FEES",
  "BILL BALANCE",
  "5% ASSIANMENT REG FEES",
  "5% DEED OF PURCHASE FEES",
  "BILL BALANCE &2025 G/RENT",
  "LUC &G/RENT 2025",
  "PROCESSING FEES",
  "BETTERMENT FEES",
  "LUC",
  "LAND USE CHARGES",
  "SEARCH",
  "OTHERS...."
];

export default function Transactions() {
  const { currentUser } = useContext(AuthContext);
  const { notifyError } = useNotification();
  const token = import.meta.env.VITE_ADMIN_TOKEN;
  const [summary, setSummary] = useState({ all: 0, today: 0, month: 0, year: 0 });
  const [search, setSearch] = useState("");
  const [entries, setEntries] = useState(10);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filter, setFilter] = useState({ date: "", description: "", paymentMethod: "" });
  const [products, setProducts] = useState([]);

  // Fetch all transactions on mount and whenever filter changes
  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (filter.date) {
          // Always send YYYY-MM-DD
          let d = new Date(filter.date);
          const month = String(d.getMonth() + 1).padStart(2, "0");
          const day = String(d.getDate()).padStart(2, "0");
          const formatted = `${d.getFullYear()}-${month}-${day}`;
          params.append("date", formatted);
        }
        if (filter.description) params.append("description", filter.description);
        if (filter.paymentMethod) params.append("paymentMethod", filter.paymentMethod);

        const response = await fetch(
          `${import.meta.env.VITE_BASE_URL}/getTransactions?${params.toString()}`,
          {
            headers: {
              Authorization: `Bearer ${import.meta.env.VITE_ADMIN_TOKEN}`,
            },
          }
        );
        const data = await response.json();
        setProducts(data.transactions || []);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching transactions:", error);
        setLoading(false);
      }
    };
    fetchTransactions(); // <-- call it here!
  }, [filter, token]);

  // Fetch statistics for summary cards
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_BASE_URL}/transactions/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.status && data.stats) setSummary(data.stats);
      } catch (err) {
        setSummary({ all: 0, today: 0, month: 0, year: 0 });
      }
    };
    fetchStats();
  }, [token]);

  // Filtering logic (search and pagination)
  const filtered = products.filter((p) => {
    const matchesSearch =
      p.transactionID?.toLowerCase().includes(search.toLowerCase()) ||
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.address?.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  const totalPages = Math.ceil(filtered.length / entries);
  const startIdx = (page - 1) * entries;
  const endIdx = startIdx + entries;
  const pageData = filtered.slice(startIdx, endIdx);

  useEffect(() => { setPage(1); }, [search, entries, filter]);

  // Excel Export
  const handleExportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filtered.map((p, i) => ({
      "S/N": i + 1,
      "Transaction ID": p.transactionID,
      Name: p.name,
      "Payment Method": p.payment_method,
      Address: p.address,
      Amount: p.amount,
      "Bank": p.bank,
      "Teller Number": p.teller_number || "",
      Date: p.transaction_date,
      Description: p.description,
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Transactions");
    XLSX.writeFile(wb, "Transactions_Report.xlsx");
  };

  // PDF Export with watermark and QR code
  const handlePrintPDF = async () => {
    setLoading(true);
    try {
      const doc = new jsPDF();
      // Watermark
      doc.setFontSize(60);
      doc.setTextColor(230, 230, 230);
      doc.text("KANGIS ACCOUNTING DEPARTMENT", 35, 100, { angle: 30, opacity: 0.2 });

      // Header
      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.text("Kangis Accounting Department", 105, 18, { align: "center" });
      doc.setFontSize(12);
      doc.text("Official Transaction Report", 105, 26, { align: "center" });

      // QR code (generate for this report)
      const qrData = "https://kangis.gov.ng/";
      const qrUrl = await QRCode.toDataURL(qrData);
      doc.addImage(qrUrl, "PNG", 170, 10, 25, 25);

      // Table
      autoTable(doc, {
        startY: 40,
        head: [["S/N", "Transaction ID", "Name", "Payment Method", "Address", "Bank", "Amount", "Teller Number", "Date", "Description"]],
        body: filtered.map((p, i) => [
          i + 1,
          p.transactionID,
          p.name,
          p.payment_method,
          p.address,
          p.bank,
          p.amount,
          p.teller_number || "",
          p.transaction_date,
          p.description,
        ]),
        theme: "grid",
        headStyles: { fillColor: [34, 197, 139], textColor: "#fff" },
        styles: { fontSize: 10 },
        margin: { left: 14, right: 14 },
      });

      // Footer
      doc.setFontSize(9);
      doc.setTextColor("#888");
      doc.text(
        "Kangis Accounting Department - https://kangis.gov.ng/",
        105,
        doc.internal.pageSize.height - 8,
        { align: "center" }
      );

      doc.save("Kangis_Transactions_Report.pdf");
    } catch (err) {
      notifyError("PDF generation failed!");
    }
    setLoading(false);
  };

  // Share via WhatsApp
  const handleShareWhatsApp = () => {
    const text = filtered
      .map(
        (p, i) =>
          `${i + 1}. ${p.name} (${p.transactionID}) - ${p.description}, ${p.payment_method}, Teller: ${p.teller_number || ""}, ${p.transaction_date}`
      )
      .join("\n");
    const url = `https://wa.me/?text=${encodeURIComponent("Transactions:\n" + text)}`;
    window.open(url, "_blank");
  };

  // Filter popup handlers
  const handleFilterChange = (e) => setFilter({ ...filter, [e.target.name]: e.target.value });
  const handleFilterReset = () => setFilter({ date: "", description: "", paymentMethod: "" });
  const handleOverlayClick = (e) => {
    if (e.target.classList.contains("filter-popup-overlay")) setFilterOpen(false);
  };
  const handlePrev = () => setPage(page > 1 ? page - 1 : 1);
  const handleNext = () => setPage(page < totalPages ? page + 1 : totalPages);

  const formatDate = (dateObj) => {
    if (!dateObj) return "";
    const d = new Date(dateObj);
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${d.getFullYear()}-${month}-${day}`;
  };

  return (
    <div className="generic-bg">
      <div className="generic-header">
        <h2 className="generic-title">Transactions</h2>
        <div className="generic-cards">
          <div className="generic-card">
            <div className="generic-card-icon"><MdPayment /></div>
            <div>
              <div className="generic-card-main">{summary.all}</div>
              <div className="generic-card-label">All Transactions</div>
            </div>
          </div>
          <div className="generic-card">
            <div className="generic-card-icon"><FaCalendarDay /></div>
            <div>
              <div className="generic-card-main">{summary.today}</div>
              <div className="generic-card-label">Today’s Transactions</div>
            </div>
          </div>
          <div className="generic-card">
            <div className="generic-card-icon"><FaCalendarAlt /></div>
            <div>
              <div className="generic-card-main">{summary.month}</div>
              <div className="generic-card-label">Monthly Transactions</div>
            </div>
          </div>
          <div className="generic-card">
            <div className="generic-card-icon"><FaCalendar /></div>
            <div>
              <div className="generic-card-main">{summary.year}</div>
              <div className="generic-card-label">Yearly Transactions</div>
            </div>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="generic-content">
        <div className="generic-products-title">Transactions</div>
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
              <option value={50}>50</option>
            </select>{" "}
            entries
          </div>
          <div className="generic-actions">
            <button
              className="generic-btn generic-filter"
              onClick={() => setFilterOpen(true)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: "#4a90e2",
                color: "#fff",
                borderRadius: 8,
                border: "none",
                padding: "8px 16px",
                fontWeight: "bold",
                cursor: "pointer",
                boxShadow: "0 2px 8px rgba(85,99,222,0.08)",
              }}
            >
              <FaFilter /> Filter
            </button>
          </div>
          <div className="generic-search-wrap">
            Search:{" "}
            <input
              type="text"
              className="generic-search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
            />
          </div>
        </div>

        <div className="generic-table-wrapper">
          <table className="generic-table">
            <thead>
              <tr>
                <th>S/N</th>
                <th>Transaction ID</th>
                <th>Name</th>
                <th>Payment Method</th>
                <th>Address</th>
                <th>Amount</th>
                <th>Bank</th>
                <th>Date</th>
                <th>Description</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {pageData.map((p, i) => (
                <tr key={p.transactionID + i}>
                  <td>{startIdx + i + 1}</td>
                  <td>{p.transactionID}</td>
                  <td>{p.name}</td>
                  <td>{p.payment_method}</td>
                  <td>{p.address}</td>
                  <td>{p.amount}</td>
                  <td>{p.bank}</td>
                  <td>{p.transaction_date ? p.transaction_date.split("T")[0] : ""}</td>
                  <td>{p.description}</td>
                  <td>
                    <Link to={`/viewTransct/${p.transactionID}`}>
                      <button className="generic-action-btn view"><FaEye /></button>
                    </Link>
                  </td>
                </tr>
              ))}
              {pageData.length === 0 && (
                <tr>
                  <td colSpan={9} style={{ textAlign: "center", color: "#888" }}>
                    No Transactions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Bottom action buttons */}
        <div style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: "16px",
          marginTop: 24,
        }}>
          <button
            className="generic-btn"
            style={{
              background: "#25D366",
              color: "#fff",
              borderRadius: 8,
              border: "none",
              padding: "12px 24px",
              fontWeight: "bold",
              cursor: "pointer",
              fontSize: "16px",
              boxShadow: "0 2px 8px rgba(85,99,222,0.08)",
              transition: "background 0.3s",
            }}
            onClick={handleShareWhatsApp}
          >
            Share via WhatsApp
          </button>
          <button
            className="generic-btn"
            style={{
              background: "#1d6f42",
              color: "#fff",
              borderRadius: 8,
              border: "none",
              padding: "12px 24px",
              fontWeight: "bold",
              cursor: "pointer",
              fontSize: "16px",
              boxShadow: "0 2px 8px rgba(85,99,222,0.08)",
              transition: "background 0.3s",
            }}
            onClick={handleExportExcel}
            disabled={loading}
          >
            Export as Excel
          </button>
          <button
            className="generic-btn"
            style={{
              background: "linear-gradient(90deg, #4a90e2 0%, #6ee7b7 100%)",
              color: "#fff",
              borderRadius: 8,
              border: "none",
              padding: "12px 24px",
              fontWeight: "bold",
              cursor: "pointer",
              fontSize: "16px",
              boxShadow: "0 2px 8px rgba(85,99,222,0.08)",
              transition: "background 0.3s",
            }}
            onClick={handlePrintPDF}
            disabled={loading}
          >
            Print as PDF
          </button>
        </div>

        <div className="generic-footer">
          <span>
            Showing {filtered.length === 0 ? 0 : startIdx + 1} to{" "}
            {Math.min(endIdx, filtered.length)} of {filtered.length} entries
          </span>
          <div className="generic-pagination">
            <button
              className="generic-page-btn"
              onClick={handlePrev}
              disabled={page === 1}
            >
              Previous
            </button>
            <span className="generic-page-num">{page}</span>
            <button
              className="generic-page-btn"
              onClick={handleNext}
              disabled={page === totalPages || totalPages === 0}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Filter Popup */}
      {filterOpen && (
        <div className="filter-popup-overlay" onClick={handleOverlayClick}>
          <div
            className="filter-popup"
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              background: "#fff",
              borderRadius: "16px",
              boxShadow: "0 8px 32px rgba(85,99,222,0.12)",
              padding: "32px 24px",
              zIndex: 2000,
              minWidth: 320,
              maxWidth: "90vw",
              transition: "all 0.3s",
            }}
          >
            <h3 style={{ marginBottom: 24, color: "#4a90e2", textAlign: "center" }}>
              Filter Transactions
            </h3>
            <div style={{ marginBottom: 18 }}>
              <label style={{ fontWeight: 500, marginBottom: 6, display: "block" }}>Date</label>
              <input
                type="date"
                name="date"
                value={filter.date}
                onChange={handleFilterChange}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "8px",
                  border: "1px solid #ccc",
                  fontSize: "14px",
                  outline: "none",
                  marginBottom: "8px",
                }}
              />
            </div>
            <div style={{ marginBottom: 18 }}>
              <label style={{ fontWeight: 500, marginBottom: 6, display: "block" }}>Description</label>
              <select
                name="description"
                value={filter.description}
                onChange={handleFilterChange}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "8px",
                  border: "1px solid #ccc",
                  fontSize: "14px",
                  outline: "none",
                  marginBottom: "8px",
                  background: "#f8fafc",
                }}
              >
                <option value="">All</option>
                {descriptions.map((desc) => (
                  <option key={desc} value={desc}>{desc}</option>
                ))}
              </select>
            </div>
            <div style={{ marginBottom: 18 }}>
              <label style={{ fontWeight: 500, marginBottom: 6, display: "block" }}>Payment Method</label>
              <select
                name="paymentMethod"
                value={filter.paymentMethod}
                onChange={handleFilterChange}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "8px",
                  border: "1px solid #ccc",
                  fontSize: "14px",
                  outline: "none",
                  marginBottom: "8px",
                  background: "#f8fafc",
                }}
              >
                <option value="">All</option>
                {paymentMethods.map((method) => (
                  <option key={method} value={method}>{method}</option>
                ))}
              </select>
            </div>
            <div style={{ display: "flex", gap: 12, marginTop: 18 }}>
              <button
                type="button"
                onClick={() => setFilterOpen(false)}
                style={{
                  flex: 1,
                  padding: "12px",
                  background: "#4a90e2",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  fontWeight: "bold",
                  cursor: "pointer",
                  fontSize: "15px",
                  boxShadow: "0 2px 8px rgba(85,99,222,0.08)",
                  transition: "background 0.3s",
                }}
              >
                Apply
              </button>
              <button
                type="button"
                onClick={handleFilterReset}
                style={{
                  flex: 1,
                  padding: "12px",
                  background: "#e0e7ff",
                  color: "#4a90e2",
                  border: "none",
                  borderRadius: "8px",
                  fontWeight: "bold",
                  cursor: "pointer",
                  fontSize: "15px",
                  boxShadow: "0 2px 8px rgba(85,99,222,0.08)",
                  transition: "background 0.3s",
                }}
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modern filter popup overlay styles */}
      <style>{`
        .filter-popup-overlay {
          position: fixed;
          inset: 0;
          background: rgba(34, 197, 139, 0.08);
          z-index: 1999;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: fadeIn 0.3s;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @media (max-width: 600px) {
          .filter-popup {
            min-width: 90vw !important;
            padding: 18px 8px !important;
          }
        }
      `}</style>
    </div>
  );
}
