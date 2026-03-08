import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../Components/Sidebar";
import Header from "../Components/Header";
import Footer from "../Components/Footer";
import { projectAPI, formatCurrency, formatDate, getStatusClass } from "../utils/api";
import { useNotification } from "../context/NotificationContext";
import "./ViewProject.css";

export default function ViewProject({ onNavigate, activePage }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { notifySuccess, notifyError } = useNotification();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    fetchProject();
  }, [id]);

  const fetchProject = async () => {
    try {
      setLoading(true);
      setError("");

      const result = await projectAPI.getById(id);

      if (result.success) {
        // Parse milestones if it's a string
        const projectData = result.project;
        if (typeof projectData.milestones === 'string') {
          projectData.milestones = JSON.parse(projectData.milestones || '[]');
        }
        // Parse team members if string
        if (typeof projectData.team_members === 'string') {
          projectData.team_members = projectData.team_members.split(',').map(m => m.trim()).filter(m => m);
        }
        setProject(projectData);
      }
    } catch (err) {
      console.error("Failed to fetch project:", err);
      setError("Failed to load project details.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete "${project.name}"?`)) {
      try {
        const result = await projectAPI.delete(id);

        if (result.success) {
          notifySuccess("Project deleted successfully!");
          setTimeout(() => navigate('/projects'), 1500);
        }
      } catch (err) {
        console.error("Failed to delete project:", err);
        notifyError("Failed to delete project. Please try again.");
      }
    }
  };

  if (loading) {
    return (
      <div>
        <Sidebar onNavigate={onNavigate} activePage={activePage} />
        <div className="dashboard-main">
          <Header />
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading project...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div>
        <Sidebar onNavigate={onNavigate} activePage={activePage} />
        <div className="dashboard-main">
          <Header />
          <div className="not-found-project">
            <i className="bi bi-exclamation-triangle"></i>
            <h2>{error || "Project Not Found"}</h2>
            <button onClick={() => navigate('/projects')} className="btn-back">
              Back to Projects
            </button>
          </div>
        </div>
      </div>
    );
  }

  const budgetPercentage = (project.spent_budget / project.total_budget) * 100;
  const teamMembers = project.team_members || [];
  const milestones = project.milestones || [];

  return (
    <div>
      <Sidebar onNavigate={onNavigate} activePage={activePage} />

      <div className="dashboard-main">
        <Header />

        <main className="view-project-container">
          {/* Hero Section */}
          <div className="project-hero">
            <img src={project.image_url} alt={project.name} className="hero-image" />
            <div className="hero-overlay"></div>
            <div className="hero-content">
              <button className="btn-back-hero" onClick={() => navigate('/projects')}>
                <i className="bi bi-arrow-left"></i>
                Back to Projects
              </button>
              <h1 className="hero-title">{project.name}</h1>
              <div className="hero-meta">
                <span className={`hero-badge ${getStatusClass(project.status)}`}>
                  {project.status}
                </span>
                <span className="hero-type">
                  <i className="bi bi-tag"></i>
                  {project.type}
                </span>
                <span className="hero-location">
                  <i className="bi bi-geo-alt"></i>
                  {project.location}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="quick-stats">
            <div className="stat-box">
              <div className="stat-icon progress-icon">
                <i className="bi bi-graph-up-arrow"></i>
              </div>
              <div className="stat-info">
                <span className="stat-label">Completion</span>
                <span className="stat-value">{project.completion_percentage}%</span>
              </div>
            </div>
            <div className="stat-box">
              <div className="stat-icon budget-icon">
                <i className="bi bi-cash-stack"></i>
              </div>
              <div className="stat-info">
                <span className="stat-label">Total Budget</span>
                <span className="stat-value">{formatCurrency(project.total_budget)}</span>
              </div>
            </div>
            <div className="stat-box">
              <div className="stat-icon manager-icon">
                <i className="bi bi-person-badge"></i>
              </div>
              <div className="stat-info">
                <span className="stat-label">Project Manager</span>
                <span className="stat-value">{project.project_manager}</span>
              </div>
            </div>
            <div className="stat-box">
              <div className="stat-icon date-icon">
                <i className="bi bi-calendar-check"></i>
              </div>
              <div className="stat-info">
                <span className="stat-label">Target Completion</span>
                <span className="stat-value">{formatDate(project.end_date)}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="project-actions-top">
            <button
              className="btn-edit-project"
              onClick={() => navigate(`/edit-project/${project.id}`)}
            >
              <i className="bi bi-pencil-square"></i>
              Edit Project
            </button>
            <button
              className="btn-delete-project"
              onClick={handleDelete}
            >
              <i className="bi bi-trash"></i>
              Delete Project
            </button>
          </div>

          {/* Tabs */}
          <div className="project-tabs">
            <button
              className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              <i className="bi bi-info-circle"></i>
              Overview
            </button>
            <button
              className={`tab-btn ${activeTab === 'timeline' ? 'active' : ''}`}
              onClick={() => setActiveTab('timeline')}
            >
              <i className="bi bi-clock-history"></i>
              Timeline
            </button>
            <button
              className={`tab-btn ${activeTab === 'budget' ? 'active' : ''}`}
              onClick={() => setActiveTab('budget')}
            >
              <i className="bi bi-wallet2"></i>
              Budget
            </button>
            <button
              className={`tab-btn ${activeTab === 'team' ? 'active' : ''}`}
              onClick={() => setActiveTab('team')}
            >
              <i className="bi bi-people"></i>
              Team
            </button>
          </div>

          {/* Tab Content */}
          <div className="tab-content">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="tab-panel overview-panel">
                <div className="panel-section">
                  <h2 className="section-title">Project Details</h2>
                  <div className="details-grid">
                    <div className="detail-item">
                      <label>Client</label>
                      <value>{project.client}</value>
                    </div>
                    <div className="detail-item">
                      <label>Location</label>
                      <value>{project.location}</value>
                    </div>
                    <div className="detail-item">
                      <label>Address</label>
                      <value>{project.address || 'N/A'}</value>
                    </div>
                    <div className="detail-item">
                      <label>Start Date</label>
                      <value>{formatDate(project.start_date)}</value>
                    </div>
                    <div className="detail-item">
                      <label>End Date</label>
                      <value>{formatDate(project.end_date)}</value>
                    </div>
                    <div className="detail-item">
                      <label>Project Type</label>
                      <value>{project.type}</value>
                    </div>
                  </div>
                </div>

                <div className="panel-section">
                  <h2 className="section-title">Description</h2>
                  <p className="project-description">{project.description || 'No description provided.'}</p>
                </div>

                <div className="panel-section">
                  <h2 className="section-title">Progress Overview</h2>
                  <div className="progress-container">
                    <div className="progress-header-large">
                      <span>Overall Completion</span>
                      <span className="progress-percent-large">{project.completion_percentage}%</span>
                    </div>
                    <div className="progress-bar-large">
                      <div
                        className="progress-fill-large"
                        style={{ width: `${project.completion_percentage}%` }}
                      >
                        <span className="progress-text">{project.completion_percentage}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Timeline Tab */}
            {activeTab === 'timeline' && (
              <div className="tab-panel timeline-panel">
                <h2 className="section-title">Project Milestones</h2>
                {milestones.length > 0 ? (
                  <div className="timeline">
                    {milestones.map((milestone, index) => (
                      <div key={index} className={`timeline-item ${milestone.completed ? 'completed' : 'pending'}`}>
                        <div className="timeline-marker">
                          <i className={`bi ${milestone.completed ? 'bi-check-circle-fill' : 'bi-circle'}`}></i>
                        </div>
                        <div className="timeline-content">
                          <h3 className="milestone-name">{milestone.name}</h3>
                          <p className="milestone-date">
                            <i className="bi bi-calendar3"></i>
                            {formatDate(milestone.date)}
                          </p>
                          <span className={`milestone-status ${milestone.completed ? 'status-done' : 'status-pending'}`}>
                            {milestone.completed ? 'Completed' : 'Pending'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="empty-message">No milestones defined for this project.</p>
                )}
              </div>
            )}

            {/* Budget Tab */}
            {activeTab === 'budget' && (
              <div className="tab-panel budget-panel">
                <h2 className="section-title">Budget Breakdown</h2>

                <div className="budget-cards">
                  <div className="budget-card total">
                    <div className="budget-card-icon">
                      <i className="bi bi-wallet"></i>
                    </div>
                    <div className="budget-card-info">
                      <span className="budget-card-label">Total Budget</span>
                      <span className="budget-card-value">{formatCurrency(project.total_budget)}</span>
                    </div>
                  </div>
                  <div className="budget-card spent">
                    <div className="budget-card-icon">
                      <i className="bi bi-credit-card"></i>
                    </div>
                    <div className="budget-card-info">
                      <span className="budget-card-label">Amount Spent</span>
                      <span className="budget-card-value">{formatCurrency(project.spent_budget)}</span>
                    </div>
                  </div>
                  <div className="budget-card remaining">
                    <div className="budget-card-icon">
                      <i className="bi bi-piggy-bank"></i>
                    </div>
                    <div className="budget-card-info">
                      <span className="budget-card-label">Remaining</span>
                      <span className="budget-card-value">{formatCurrency(project.total_budget - project.spent_budget)}</span>
                    </div>
                  </div>
                </div>

                <div className="budget-progress-section">
                  <h3>Budget Utilization</h3>
                  <div className="budget-progress-bar">
                    <div
                      className="budget-progress-fill"
                      style={{ width: `${budgetPercentage}%` }}
                    >
                      <span>{budgetPercentage.toFixed(1)}%</span>
                    </div>
                  </div>
                  <div className="budget-progress-labels">
                    <span>₦0</span>
                    <span>{formatCurrency(project.total_budget)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Team Tab */}
            {activeTab === 'team' && (
              <div className="tab-panel team-panel">
                <h2 className="section-title">Project Team</h2>

                <div className="team-grid">
                  <div className="team-card manager">
                    <div className="team-avatar">
                      <i className="bi bi-person-circle"></i>
                    </div>
                    <div className="team-info">
                      <h3>{project.project_manager}</h3>
                      <p>Project Manager</p>
                      <span className="team-badge">Lead</span>
                    </div>
                  </div>

                  {teamMembers.map((member, index) => (
                    <div key={index} className="team-card">
                      <div className="team-avatar">
                        <i className="bi bi-person-circle"></i>
                      </div>
                      <div className="team-info">
                        <h3>{member}</h3>
                        <p>Team Member</p>
                      </div>
                    </div>
                  ))}

                  {teamMembers.length === 0 && (
                    <p className="empty-message">No additional team members assigned.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>

        <div className="dashboard-footer">
          <Footer />
        </div>
      </div>
    </div>
  );
}