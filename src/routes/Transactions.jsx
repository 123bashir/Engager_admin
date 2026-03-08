import React, { useState, useEffect } from "react";
import { FaFolder, FaCog, FaCheckCircle, FaEye, FaPencilAlt, FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Sidebar from "../Components/Sidebar";
import Header from "../Components/Header";
import Footer from "../Components/Footer";
import { projectAPI, formatCurrency, getStatusClass, projectTypes, projectStatuses } from "../utils/api";
import "./Projects.css";

export default function Projects({ onNavigate, activePage }) {
  const [popup, setPopup] = useState({ show: false, message: "" });
  const [confirmDelete, setConfirmDelete] = useState({ show: false, id: null, name: "" });
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("DESC");

  // Fetch projects from backend
  useEffect(() => {
    fetchProjects();
  }, [statusFilter, typeFilter, searchQuery, sortBy, sortOrder]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError("");

      const filters = {
        status: statusFilter,
        type: typeFilter,
        search: searchQuery,
        sort: sortBy,
        order: sortOrder
      };

      const result = await projectAPI.getAll(filters);

      if (result.success) {
        setProjects(result.projects);
        setFilteredProjects(result.projects);
      }
    } catch (err) {
      console.error("Failed to fetch projects:", err);
      setError("Failed to load projects. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    setConfirmDelete({ show: true, id, name });
  };

  // Calculate statistics
  const stats = {
    total: filteredProjects.length,
    inProgress: filteredProjects.filter(p => p.status === "In Progress").length,
    completed: filteredProjects.filter(p => p.status === "Completed").length
  };

  return (
    <div>
      {/* Custom Confirmation Modal */}
      {confirmDelete.show && (
        <div className="custom-popup-overlay">
          <div className="custom-popup">
            <p>Are you sure you want to delete "{confirmDelete.name}"?</p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1rem' }}>
              <button className="btn-action" onClick={async () => {
                try {
                  const result = await projectAPI.delete(confirmDelete.id);
                  if (result.success) {
                    fetchProjects();
                    setPopup({ show: true, message: "Project deleted successfully!" });
                  } else {
                    setPopup({ show: true, message: "Failed to delete project. Please try again." });
                  }
                } catch {
                  setPopup({ show: true, message: "Failed to delete project. Please try again." });
                }
                setConfirmDelete({ show: false, id: null, name: "" });
              }}>Delete</button>
              <button className="btn-action" onClick={() => setConfirmDelete({ show: false, id: null, name: "" })}>Cancel</button>
            </div>
          </div>
        </div>
      )}
      {/* Custom Popup Modal */}
      {popup.show && (
        <div className="custom-popup-overlay">
          <div className="custom-popup">
            <p>{popup.message}</p>
            <button onClick={() => setPopup({ show: false, message: "" })} className="btn-action">OK</button>
          </div>
        </div>
      )}
      <Sidebar onNavigate={onNavigate} activePage={activePage} />
      <div className="dashboard-main">
        <Header />
        <main className="projects-container">
          {/* Header Section */}
          <div className="projects-header">
            <div className="header-left">
              <h1 className="page-title">Order Transactions</h1>
              <p className="page-subtitle">Track and manage all customer NFC device orders</p>
            </div>
            <div className="header-right">
              <button
                className="btn-add-project"
                onClick={() => navigate('/add-project')}
              >
                <i className="bi bi-plus-circle"></i>
                Add New Project
              </button>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="stats-cards">
            <div className="stat-card total">
              <div className="stat-icon">
                <FaFolder size={28} />
              </div>
              <div className="stat-info">
                <span className="stat-value">{stats.total}</span>
                <span className="stat-label">Total Projects</span>
              </div>
            </div>
            <div className="stat-card progress">
              <div className="stat-icon">
                <FaCog size={28} />
              </div>
              <div className="stat-info">
                <span className="stat-value">{stats.inProgress}</span>
                <span className="stat-label">In Progress</span>
              </div>
            </div>
            <div className="stat-card completed">
              <div className="stat-icon">
                <FaCheckCircle size={28} />
              </div>
              <div className="stat-info">
                <span className="stat-value">{stats.completed}</span>
                <span className="stat-label">Completed</span>
              </div>
            </div>
          </div>

          {/* Filters and Controls */}
          <div className="projects-controls">
            <div className="search-box">
              <i className="bi bi-search"></i>
              <input
                type="text"
                placeholder="Search projects by name, client, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="filter-group">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="filter-select"
              >
                <option value="">All Status</option>
                {projectStatuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="filter-select"
              >
                <option value="">All Types</option>
                {projectTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>

              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [sort, order] = e.target.value.split('-');
                  setSortBy(sort);
                  setSortOrder(order);
                }}
                className="filter-select"
              >
                <option value="created_at-DESC">Newest First</option>
                <option value="created_at-ASC">Oldest First</option>
                <option value="name-ASC">Name (A-Z)</option>
                <option value="name-DESC">Name (Z-A)</option>
                <option value="start_date-DESC">Start Date (Latest)</option>
                <option value="total_budget-DESC">Budget (Highest)</option>
                <option value="completion_percentage-DESC">Completion (Highest)</option>
              </select>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Loading projects...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="error-container">
              <i className="bi bi-exclamation-triangle"></i>
              <p>{error}</p>
              <button onClick={fetchProjects} className="btn-retry">
                <i className="bi bi-arrow-clockwise"></i>
                Retry
              </button>
            </div>
          )}

          {/* Projects Grid */}
          {!loading && !error && (
            <>
              {filteredProjects.length === 0 ? (
                <div className="empty-state">
                  <i className="bi bi-folder-x"></i>
                  <h3>No Projects Found</h3>
                  <p>No projects match your current filters. Try adjusting your search criteria.</p>
                  <button
                    className="btn-add-project"
                    onClick={() => navigate('/add-project')}
                  >
                    <i className="bi bi-plus-circle"></i>
                    Create Your First Project
                  </button>
                </div>
              ) : (
                <div className="projects-grid">
                  {filteredProjects.map(project => (
                    <div key={project.id} className="project-card">
                      <div className="project-image">
                        <img
                          src={(() => {
                            let images = [];
                            if (Array.isArray(project.images)) images = project.images;
                            else if (project.images) {
                              try { images = JSON.parse(project.images); } catch { images = []; }
                            }
                            return images[0] || project.image_url || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop';
                          })()}
                          alt={project.name}
                        />
                        <span className={`status-badge ${getStatusClass(project.status)}`}>
                          {project.status}
                        </span>
                      </div>

                      <div className="project-content">
                        <div className="project-header">
                          <h3 className="project-name">{project.name}</h3>
                          <span className="project-type">{project.type}</span>
                        </div>

                        <div className="project-details">
                          <div className="detail-item">
                            <i className="bi bi-building"></i>
                            <span>{project.client}</span>
                          </div>
                          <div className="detail-item">
                            <i className="bi bi-geo-alt"></i>
                            <span>{project.location}</span>
                          </div>
                          <div className="detail-item">
                            <i className="bi bi-person"></i>
                            <span>{project.project_manager}</span>
                          </div>
                        </div>

                        <div className="project-progress">
                          <div className="progress-header">
                            <span>Progress</span>
                            <span className="progress-percentage">{project.completion_percentage}%</span>
                          </div>
                          <div className="progress-bar">
                            <div
                              className="progress-fill"
                              style={{ width: `${project.completion_percentage}%` }}
                            ></div>
                          </div>
                        </div>

                        <div className="project-budget">
                          <div className="budget-item">
                            <span className="budget-label">Total Budget</span>
                            <span className="budget-value">{formatCurrency(project.total_budget)}</span>
                          </div>
                          <div className="budget-item">
                            <span className="budget-label">Spent</span>
                            <span className="budget-value spent">{formatCurrency(project.spent_budget)}</span>
                          </div>
                        </div>

                        <div className="project-actions">
                          <button
                            className="btn-action btn-view"
                            onClick={() => navigate(`/viewProject/${project.id}`)}
                          >
                            <FaEye /> View
                          </button>
                          <button
                            className="btn-action btn-edit"
                            onClick={() => navigate(`/edit-project/${project.id}`)}
                          >
                            <FaPencilAlt /> Edit
                          </button>
                          <button
                            className="btn-action btn-delete"
                            onClick={() => handleDelete(project.id, project.name)}
                          >
                            <FaTrash /> Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </main>

        <div className="dashboard-footer">
          <Footer />
        </div>
      </div>
    </div>
  );
}
