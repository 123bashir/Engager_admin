import React, { useState } from "react";
import "./View.css";
import { FaPrint, FaTimes } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";

export default function ViewOrder() {
  const navigate = useNavigate();
  const [showCancelPopup, setShowCancelPopup] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  // Example data, replace with props/state
  const transaction = {
    title: "PHENOBARB TAB",
    id: "TXN-956145",
    category: "Poison Box",
    description: "Dispensed 2 packs",
    status: "Completed",
    createdOn: "2025-07-02 20:38:28",
    lastUpdate: "2025-08-13 22:53:45",
    addedBy: "Pharmacist Musa",
    updatedBy: "Pharmacist Musa",
    amount: "2500",
    method: "Cash",
    customer: "Bashir Yusuf",
  };

  const handleEdit = () => {
    navigate(`/edit/${transaction.id}`);
  };

  const handlePrint = () => {
    const doc = new jsPDF({
      unit: "mm",
      format: [80, 140], // POS slip size
    });

    doc.setFontSize(12);
    doc.text("PHARMACY DEPARTMENT", 40, 10, { align: "center" });
    doc.setFontSize(10);
    doc.text("Murtala Muhammad Specialist Hospital", 40, 15, { align: "center" });
    doc.text("Kofar Mata Rd, Kano", 40, 20, { align: "center" });
    doc.text("Tel: 08000000000", 40, 25, { align: "center" });

    doc.setFontSize(11);
    doc.text("TRANSACTION RECEIPT", 40, 35, { align: "center" });

    doc.setFontSize(9);
    doc.text(`Transaction ID: ${transaction.id}`, 5, 45);
    doc.text(`Customer: ${transaction.customer}`, 5, 50);
    doc.text(`Title: ${transaction.title}`, 5, 55);
    doc.text(`Category: ${transaction.category}`, 5, 60);
    doc.text(`Description: ${transaction.description}`, 5, 65);
    doc.text(`Status: ${transaction.status}`, 5, 70);
    doc.text(`Amount: ₦${transaction.amount}`, 5, 75);
    doc.text(`Payment Method: ${transaction.method}`, 5, 80);
    doc.text(`Date: ${transaction.createdOn}`, 5, 85);

    doc.setFontSize(8);
    doc.text("Thank you for your patronage!", 40, 100, { align: "center" });
    doc.text("www.mmhs.com", 40, 105, { align: "center" });

    doc.save(`Receipt_${transaction.id}.pdf`);
  };

  const handleCancelConfirm = () => {
    if (!cancelReason.trim()) {
      alert("Please provide a reason for cancellation.");
      return;
    }
    alert(`Transaction cancelled. Reason: ${cancelReason}`);
    setShowCancelPopup(false);
    setCancelReason("");
  };

  return (
    <div className="view-bg">
      <h2 className="view-title">Orders</h2>
      <div className="view-card">
        <h3 className="view-subtitle">Orders Information</h3>
        <div className="view-info">
          <div className="view-row">
            <div className="view-field">
              <span className="view-label">Title :</span> {transaction.title}
            </div>
          </div>
          <div className="view-row">
            <div className="view-field">
              <span className="view-label">#ID :</span> {transaction.id}
            </div>
            <div className="view-field">
              <span className="view-label">Category :</span> {transaction.category}
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
              <span className="view-label">Status :</span> {transaction.status}
            </div>
            <div className="view-field">
              <span className="view-label">Amount :</span> ₦{transaction.amount}
            </div>
          </div>
          <div className="view-row">
            <div className="view-field">
              <span className="view-label">Created On :</span> {transaction.createdOn}
            </div>
            <div className="view-field">
              <span className="view-label">Last Update :</span> {transaction.lastUpdate}
            </div>
          </div>
        </div>
        
      </div>

      {showCancelPopup && (
        <div className="popup-overlay">
          <div className="popup">
            <h3>Cancel Transaction</h3>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Enter reason for cancellation..."
            />
            <div className="popup-actions">
              <button className="popup-btn confirm" onClick={handleCancelConfirm}>
                Submit
              </button>
              <button className="popup-btn close" onClick={() => setShowCancelPopup(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
