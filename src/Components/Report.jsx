import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

function Report() {
  const [form, setForm] = useState({
    reference: "",
    name: "",
    address: "",
    amount: "",
    paymentMethod: "",
    bank: "",
    description: "",
    date: "",
    remita: "",
  });
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const paymentMethods = ["Bank Transfer", "Bank Teller", "POS"];
  const Banks = ["TAJ Bank", "JAIZ Bank"];
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

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleDateChange = (date) => {
    setForm({ ...form, date });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess("");
    setError("");
    try {
      // Format date as YYYY-MM-DD
      let formattedDate = "";
      if (form.date instanceof Date && !isNaN(form.date)) {
        const year = form.date.getFullYear();
        const month = String(form.date.getMonth() + 1).padStart(2, "0");
        const day = String(form.date.getDate()).padStart(2, "0");
        formattedDate = `${year}-${month}-${day}`;
      }

      const res = await fetch(`http://localhost:8080/add/transactions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_ADMIN_TOKEN}`,
        },
        body: JSON.stringify({
          ...form,
          date: formattedDate,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || `Server error: ${res.status}`);

      setSuccess(data.message || "Transaction Added successfully!");
      setError("");
      setForm({
        reference: "",
        name: "",
        address: "",
        amount: "",
        paymentMethod: "",
        bank: "",
        description: "",
        date: "",
        remita: "",
      });
    } catch (err) {
      setError(err.message || "Check your network or parameters.");
      setSuccess("");
    }
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.form} className="modern-form">
        <h2 style={styles.title}>Store Transaction Status</h2>

        {/* Row 1 - Reference & Name */}
        <div className="form-row">
          <div className="form-col">
            <label style={styles.label}>Transaction Reference</label>
            <input
              type="text"
              name="reference"
              value={form.reference}
              onChange={handleChange}
              placeholder="Enter Reference Number"
              style={styles.input}
              required
            />
          </div>
          <div className="form-col">
            <label style={styles.label}>Client Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter name"
              style={styles.input}
              required
            />
          </div>
        </div>

        {/* Row 2 - Address & Amount */}
        <div className="form-row">
          <div className="form-col">
            <label style={styles.label}>Address</label>
            <input
              type="text"
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="Enter address"
              style={styles.input}
              required
            />
          </div>
          <div className="form-col">
            <label style={styles.label}>Amount</label>
            <input
              type="number"
              name="amount"
              value={form.amount}
              onChange={handleChange}
              placeholder="Enter Amount In Naira"
              style={styles.input}
              required
            />
          </div>
        </div>

        {/* Row 3 - Payment Method */}
        <div className="form-row">
          <div className="form-col">
            <label style={styles.label}>Payment Method</label>
            <select
              name="paymentMethod"
              value={form.paymentMethod}
              onChange={handleChange}
              style={styles.select}
              required
            >
              <option value="">Select payment method</option>
              {paymentMethods.map((method) => (
                <option key={method} value={method}>
                  {method}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Row 4 - Bank & Description */}
        <div className="form-row">
          <div className="form-col">
            <label style={styles.label}>Bank</label>
            <select
              name="bank"
              value={form.bank} // ✅ FIXED
              onChange={handleChange}
              style={styles.select}
              required
            >
              <option value="">Select Bank</option>
              {Banks.map((bank) => (
                <option key={bank} value={bank}>
                  {bank}
                </option>
              ))}
            </select>
          </div>
          <div className="form-col">
            <label style={styles.label}>Description</label>
            <select
              name="description"
              value={form.description}
              onChange={handleChange}
              style={styles.select}
              required
            >
              <option value="">Select description</option>
              {descriptions.map((desc) => (
                <option key={desc} value={desc}>
                  {desc}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Conditional Teller Field */}
        {form.paymentMethod === "Bank Teller" && (
          <div className="form-row">
            <div className="form-col">
              <label style={styles.label}>Teller Number</label>
              <input
                type="number"
                name="remita"
                value={form.remita}
                onChange={handleChange}
                placeholder="Enter Remita Number"
                style={styles.input}
                required
              />
            </div>
          </div>
        )}

        {/* Row 5 - Date */}
        <div className="form-row">
          <div className="form-col">
            <label style={styles.label}>Date</label>
            <DatePicker
              selected={form.date}
              onChange={handleDateChange}
              dateFormat="dd/MM/yyyy"
              placeholderText="Choose date"
              className="datepicker-input"
              required
              style={{ width: "100%" }}
            />
          </div>
        </div>

        {/* Submit */}
        <button type="submit" style={styles.button}>
          Save Transaction
        </button>
        {error && <div style={{ color: "red" }}>{error}</div>}
      </form>

      {/* Success Message */}
      {success && (
        <div
          style={{
            background: "#22c55e",
            color: "#fff",
            padding: "0.75rem 1.2rem",
            borderRadius: "8px",
            textAlign: "center",
            marginTop: "1rem",
            fontWeight: "bold",
            boxShadow: "0 2px 8px rgba(34,197,94,0.12)",
            position: "fixed",
            top: "2rem",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 9999,
            transition: "opacity 0.4s",
          }}
        >
          {success}
        </div>
      )}

      {/* Extra CSS */}
      <style>{`
        .modern-form .form-row {
          display: flex;
          gap: 16px;
          margin-bottom: 0;
        }
        .modern-form .form-col {
          flex: 1;
          min-width: 0;
        }
        @media (max-width: 700px) {
          .modern-form .form-row {
            flex-direction: column;
            gap: 0;
          }
        }
        .datepicker-input {
          width: 100%;
          padding: 10px;
          margin-bottom: 15px;
          border: 1px solid #ccc;
          border-radius: 8px;
          font-size: 14px;
          outline: none;
          transition: border 0.3s;
        }
        .datepicker-input:focus {
          border: 1px solid #5563DE;
        }
      `}</style>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(120deg, #f8fafc 0%, #e0e7ff 100%)",
    padding: "20px",
  },
  form: {
    background: "#fff",
    padding: "30px",
    borderRadius: "16px",
    boxShadow: "0 8px 32px rgba(85,99,222,0.12)",
    width: "100%",
    maxWidth: "520px",
    transition: "box-shadow 0.3s",
  },
  title: {
    textAlign: "center",
    marginBottom: "24px",
    fontSize: "24px",
    fontWeight: "bold",
    color: "#5563DE",
    letterSpacing: "1px",
  },
  label: {
    display: "block",
    marginBottom: "6px",
    fontWeight: "500",
    color: "#555",
    marginTop: "10px",
  },
  select: {
    width: "100%",
    padding: "10px",
    marginBottom: "15px",
    border: "1px solid #ccc",
    borderRadius: "8px",
    fontSize: "14px",
    background: "#f8fafc",
    outline: "none",
    transition: "border 0.3s",
  },
  input: {
    width: "100%",
    padding: "10px",
    marginBottom: "15px",
    border: "1px solid #ccc",
    borderRadius: "8px",
    fontSize: "14px",
    background: "#f8fafc",
    outline: "none",
    transition: "border 0.3s",
  },
  button: {
    width: "100%",
    padding: "14px",
    background: "linear-gradient(90deg, #4a90e2 0%, #6ee7b7 100%)",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
    marginTop: "10px",
    boxShadow: "0 2px 8px rgba(85,99,222,0.08)",
    transition: "background 0.3s",
  },
};

export default Report;
