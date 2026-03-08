import React, { useState } from "react";
import "./AddGeneric.css";

function generateGenericId() {
  return "PR" + Math.floor(100000 + Math.random() * 900000);
}

export default function AddGeneric() {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [genericId] = useState(generateGenericId());

  const handleSubmit = e => {
    e.preventDefault();
    alert(`Submitted: ${name}, ${genericId}, ${category}`);
  };

  return (
    <div className="addgeneric-bg">
      <h2 className="addgeneric-title">Generic</h2>
      <div className="addgeneric-card">
        <h3 className="addgeneric-subtitle">Add Generic</h3>
        <form className="addgeneric-form" onSubmit={handleSubmit}>
          <label className="addgeneric-label">
            Name
            <input
              type="text"
              className="addgeneric-input"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </label>
          <div className="addgeneric-row">
            <label className="addgeneric-label" style={{ flex: 1 }}>
              Generic #ID
              <input
                type="text"
                className="addgeneric-input"
                value={genericId}
                readOnly
                style={{ background: "#f3f4f6" }}
              />
            </label>
            <label className="addgeneric-label" style={{ flex: 1 }}>
              Category
              <select
                className="addgeneric-input"
                name="category"
                id="addProductCategory"
                value={category}
                onChange={e => setCategory(e.target.value)}
                required
              >
                <option value="">Choose..</option>
                <option>Poison Box</option>
                <option>Consumables</option>
                <option>Tablets &amp; Caps</option>
                <option>Syrup</option>
                <option>Cream</option>
                <option>Eye Drops</option>
                <option>Injectables</option>
              </select>
            </label>
          </div>
          <button className="addgeneric-btn" type="submit">
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}