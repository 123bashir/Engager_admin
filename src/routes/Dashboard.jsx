import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../Components/Sidebar";
import Header from "../Components/Header";
import Footer from "../Components/Footer";
import { dashboardAPI, formatCurrency } from "../utils/api";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import {
  FaBoxOpen,
  FaCog,
  FaCheckCircle,
  FaTrophy,
  FaShoppingCart,
  FaChartLine,
  FaUsers,
  FaPlusCircle,
  FaArrowRight,
  FaTag,
  FaCalendarAlt,
  FaChartBar,
  FaChartPie,
  FaClock,
  FaArrowUp,
  FaTachometerAlt,
  FaEye
} from "react-icons/fa";
import "./Dashboard.css";
import Loader from "../Components/Loader";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function Dashboard({ onNavigate, activePage }) {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Safe JSON parsing to handle corrupted sessionStorage
  let user = {};
  try {
    user = JSON.parse(sessionStorage.getItem('user') || '{}');
  } catch (e) {
    console.error('Failed to parse user data, clearing sessionStorage');
    sessionStorage.removeItem('user');
    navigate('/');
  }

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      setError("");

      const result = await dashboardAPI.getStats();

      if (result.success) {
        setStats(result.stats);
      }
    } catch (err) {
      console.error("Failed to fetch dashboard stats:", err);
      setError("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  if (error || !stats) {
    return (
      <div>
        <Sidebar onNavigate={onNavigate} activePage={activePage} />
        <div className="dashboard-main">
          <Header />
          <div className="error-container">
            <FaTachometerAlt size={50} color="#ef4444" />
            <p>{error || "Failed to load dashboard"}</p>
            <button onClick={fetchDashboardStats} className="btn-retry">
              <FaClock />
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Prepare chart data
  const ordersTrendData = {
    labels: stats.orders_by_day.map(d => d.date),
    datasets: [{
      label: 'Daily Orders',
      data: stats.orders_by_day.map(d => d.count),
      fill: true,
      backgroundColor: 'rgba(52, 168, 83, 0.1)',
      borderColor: '#34A853',
      tension: 0.4,
      pointRadius: 4,
      pointBackgroundColor: '#34A853',
    }]
  };

  const productDistributionData = {
    labels: stats.orders_by_product.map(p => p.name),
    datasets: [{
      data: stats.orders_by_product.map(p => p.count),
      backgroundColor: [
        'rgba(0, 188, 212, 0.8)',
        'rgba(52, 168, 83, 0.8)',
        'rgba(251, 188, 5, 0.8)',
        'rgba(234, 67, 53, 0.8)',
        'rgba(156, 39, 176, 0.8)',
      ],
      borderWidth: 0,
    }]
  };

  const popularityData = {
    labels: stats.product_popularity.map(p => p.name),
    datasets: [{
      label: 'Engagement (Clicks)',
      data: stats.product_popularity.map(p => p.clicks),
      backgroundColor: 'rgba(0, 188, 212, 0.8)',
      borderRadius: 6,
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#e2e8f0',
          padding: 20,
          font: { size: 12 }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#94a3b8' }
      },
      x: {
        grid: { display: false },
        ticks: { color: '#94a3b8' }
      }
    }
  };

  return (
    <div>
      <Sidebar onNavigate={onNavigate} activePage={activePage} />

      <div className="dashboard-main">
        <Header />

        <main className="dashboard-container">
          {/* Welcome Section */}
          <div className="dashboard-welcome">
            <div className="welcome-content">
              <h1>Welcome back, {user.name}! </h1>
              <p>Engager platform is growing. Here's your performance overview.</p>
            </div>
            <div className="welcome-actions">
              <button
                className="btn-add-project-dash"
                onClick={() => navigate('/admin-products')}
              >
                <FaBoxOpen />
                Products
              </button>
              <button
                className="btn-add-project-dash"
                style={{ background: '#34A853' }}
                onClick={() => navigate('/add-product')}
              >
                <FaPlusCircle />
                Add Product
              </button>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="stats-grid">
            <div className="stat-card orders-card">
              <div className="stat-card-icon" style={{ background: 'rgba(52, 168, 83, 0.2)', color: '#34A853' }}>
                <FaShoppingCart />
              </div>
              <div className="stat-card-content">
                <h3>{stats.total_orders}</h3>
                <p>Total Orders</p>
              </div>
              <div className="stat-card-trend green">
                <FaArrowUp /> 12%
              </div>
            </div>

            <div className="stat-card products-card">
              <div className="stat-card-icon+234 702 585 6080" style={{ background: 'rgba(0, 188, 212, 0.2)', color: '#00bcd4' }}>
                <FaBoxOpen />
              </div>
              <div className="stat-card-content">
                <h3>{stats.total_products}</h3>
                <p>Live Products</p>
              </div>
            </div>

            <div className="stat-card views-card">
              <div className="stat-card-icon" style={{ background: 'rgba(255, 255, 255, 0.1)', color: '#fff' }}>
                <FaEye />
              </div>
              <div className="stat-card-content">
                <h3>{stats.total_views.toLocaleString()}</h3>
                <p>Platform Visits</p>
              </div>
            </div>

            <div className="stat-card staff-card">
              <div className="stat-card-icon" style={{ background: 'rgba(156, 39, 176, 0.2)', color: '#9c27b0' }}>
                <FaUsers />
              </div>
              <div className="stat-card-content">
                <h3>{stats.total_staff}</h3>
                <p>Team Members</p>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="charts-section">
            <div className="chart-card large">
              <h2 className="chart-title">
                <FaChartLine />
                Orders Trend (7 Days)
              </h2>
              <div className="chart-container">
                <Line data={ordersTrendData} options={chartOptions} />
              </div>
            </div>

            <div className="chart-card">
              <h2 className="chart-title">
                <FaChartPie />
                Sales Distribution
              </h2>
              <div className="chart-container">
                <Doughnut data={productDistributionData} options={chartOptions} />
              </div>
            </div>

            <div className="chart-card">
              <h2 className="chart-title">
                <FaChartBar />
                Top Products
              </h2>
              <div className="chart-container">
                <Bar data={popularityData} options={chartOptions} />
              </div>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="recent-section">
            <div className="recent-header">
              <h2>
                <FaClock />
                Recent Orders
              </h2>
              <button onClick={() => navigate('/projects')} className="btn-view-all">
                View All <FaArrowRight />
              </button>
            </div>
            <div className="recent-orders-table-wrapper">
              <table className="recent-orders-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Product</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recent_orders.map(order => (
                    <tr key={order.id}>
                      <td className="order-id">#ORD-{String(order.id).padStart(5, '0')}</td>
                      <td className="customer-info">
                        <strong>{order.name}</strong>
                        <span>{order.email}</span>
                      </td>
                      <td>{order.product_name || 'NFC Product'}</td>
                      <td>{new Date(order.created_at).toLocaleDateString()}</td>
                      <td>
                        <span className="status-badge paid">Success</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>

        <div className="dashboard-footer">
          <Footer />
        </div>
      </div>
    </div>
  );
}
