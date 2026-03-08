import React, { useState, useEffect } from "react";
import "./View.css";
import { FaPrint, FaTimes } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import jsPDF from "jspdf";
import QRCode from "qrcode";

export default function View() {
  const navigate = useNavigate();
  const { id } = useParams(); // transactionID from route
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [popup, setPopup] = useState(null);

  // Fetch transaction on mount
  useEffect(() => {
    const fetchTransaction = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_BASE_URL}/getTransaction/${id}`,
          {
            headers: {
              Authorization: `Bearer ${import.meta.env.VITE_ADMIN_TOKEN}`,
            },
          }
        );
        const data = await res.json();
        console.log(data);
        if (data.success) setTransaction(data.transaction);
        else setPopup({ type: "error", message: data.message });
      } catch (err) {
        setPopup({ type: "error", message: "Network error" });
      }
      setLoading(false);
    };
    fetchTransaction();
  }, [id]);

  // Print KANGIS receipt with watermark and QR code
  const handlePrint = async () => {
    if (!transaction) return;
    const doc = new jsPDF({
      unit: "mm",
      format: [80, 140], // POS slip size
    });

    // White background
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, 80, 140, "F");

    // Green check SVG (drawn manually)
    doc.setDrawColor(34, 197, 94);
    doc.setFillColor(34, 197, 94);
    doc.circle(40, 18, 6, "F");
    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(1.2);
    // Draw check mark
    doc.line(38, 18, 40, 21);
    doc.line(40, 21, 44, 15);

    // Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(30, 41, 59);
    doc.text("Transaction approved", 40, 32, { align: "center" });

    // Store name
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text("KANGIS Accounting Dept.", 40, 38, { align: "center" });

    // Section divider
    doc.setDrawColor(226, 232, 240);
    doc.line(8, 42, 72, 42);

    // Transaction details
    let y = 48;
    const labelStyle = {
      font: "helvetica",
      fontStyle: "normal",
      fontSize: 9,
      textColor: [100, 116, 139],
    };
    const valueStyle = {
      font: "helvetica",
      fontStyle: "bold",
      fontSize: 9,
      textColor: [30, 41, 59],
    };

    function printRow(label, value) {
      doc.setFont(labelStyle.font, labelStyle.fontStyle);
      doc.setFontSize(labelStyle.fontSize);
      doc.setTextColor(...labelStyle.textColor);
      doc.text(label, 10, y);
      doc.setFont(valueStyle.font, valueStyle.fontStyle);
      doc.setFontSize(valueStyle.fontSize);
      doc.setTextColor(...valueStyle.textColor);
      doc.text(String(value ?? ""), 70, y, { align: "right" }); // <-- always string
      y += 6;
    }

    printRow("Transaction ID", transaction.transactionID);
    printRow("Customer", transaction.name);
    printRow("Address", transaction.address);
    printRow("Teller Number", transaction.teller_number || "-------");
    printRow("Description", transaction.description);
    printRow("Bank", transaction.bank);
    printRow("Amount", `₦${transaction.amount}`);
    printRow("Payment Method", transaction.payment_method);
    printRow("Date", transaction.transaction_date || "");

    // Section divider
    y += 2;
    doc.setDrawColor(226, 232, 240);
    doc.line(8, y, 72, y);
    y += 8;

    // QR code (transactionID)
    const qrUrl = await QRCode.toDataURL(transaction.transactionID);
    doc.addImage(qrUrl, "PNG", 32, y, 26, 26);
    y += 22;

    // Footer: Thank you and watermark
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(34, 197, 94);
    doc.text("APPROVED - THANK YOU ", 40, y, { align: "center" });

    y += 7;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text("www.kangis.com", 40, y, { align: "center" });

    // Watermark at the bottom
    doc.setFontSize(18);
    doc.setTextColor(200, 200, 200);
    doc.text("KANGIS", 40, 137, { align: "center", opacity: 0.13 });

    doc.save(`KANGIS_Receipt_${transaction.transactionID}.pdf`);
  };

  // Delete transaction
  const handleDelete = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BASE_URL}/deleteTransaction/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_ADMIN_TOKEN}`,
          },
        }
      );
      const data = await res.json();
      if (data.success) {
        setPopup({
          type: "success",
          message: "Transaction deleted successfully.",
        });
        setTimeout(() => navigate("/transactions"), 1200);
      } else {
        setPopup({ type: "error", message: data.message });
      }
    } catch (err) {
      setPopup({ type: "error", message: "Network error" });
    }
    setShowConfirmPopup(false);
  };

  if (loading) return <div className="view-bg">Loading...</div>;

  return (
    <div className="view-bg">
      <h2 className="view-title">Transaction</h2>
      {transaction && (
        <div className="view-card">
          <h3 className="view-subtitle">Transaction Information</h3>
          <div className="view-info">
            <div className="view-row">
              <div className="view-field">
                <span className="view-label">Customer :</span> {transaction.name}
              </div>
            </div>
            <div className="view-row">
              <div className="view-field">
                <span className="view-label">#ID :</span> {transaction.transactionID}
              </div>
              <div className="view-field">
                <span className="view-label">Teller Number :</span> {transaction.teller_number || "--------"}
              </div>
              <div className="view-field">
                <span className="view-label">Address :</span> {transaction.address}
              </div>
              <div className="view-field">
                <span className="view-label">Bank :</span> {transaction.bank}
              </div>
            </div>
            <div className="view-row">
              <div className="view-field" style={{ width: "100%" }}>
                <span className="view-label">Description :</span> {transaction.description}
              </div>
            </div>
            <hr className="view-divider" />
            <div className="view-row">
              <div className="view-field">
                <span className="view-label">Amount :</span> ₦{transaction.amount}
              </div>
              <div className="view-field">
                <span className="view-label">Payment Method :</span> {transaction.payment_method}
              </div>
            </div>
            <div className="view-row">
              <div className="view-field">
                <span className="view-label">Date :</span> {transaction.transaction_date ? transaction.transaction_date.split("T")[0] : ""}
              </div>
            </div>
          </div>
          <div className="view-actions">
            <button className="view-btn print" onClick={handlePrint}>
              <FaPrint /> Print Receipt
            </button>
            <button className="view-btn cancel" onClick={() => setShowConfirmPopup(true)}>
              <FaTimes /> Delete
            </button>
          </div>
        </div>
      )}

      {/* Confirm Deletion Popup */}
      {showConfirmPopup && (
        <div className="popup-overlay" onClick={() => setShowConfirmPopup(false)}>
          <div className="popup" onClick={e => e.stopPropagation()}>
            <h4>Confirm Deletion</h4>
            <p>Are you sure you want to delete this transaction?</p>
            <div style={{ display: "flex", gap: 10 }}>
              <button className="view-btn cancel" onClick={handleDelete}>Yes</button>
              <button className="view-btn" onClick={() => setShowConfirmPopup(false)}>No</button>
            </div>
          </div>
        </div>
      )}

      {/* Popup for success/error */}
      {popup && (
        <div
          style={{
            position: "fixed",
            top: 24,
            right: 24,
            background: popup.type === "success" ? "#22c55e" : "#ef4444",
            color: "#fff",
            padding: "12px 24px",
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            zIndex: 1000,
            fontWeight: "bold",
            fontSize: "16px",
            transition: "opacity 0.3s",
          }}
        >
          {popup.message}
        </div>
      )}
    </div>
  );
}
