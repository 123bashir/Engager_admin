import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import { useState, useEffect, useContext } from "react";
import { AuthContext } from "./context/AuthContext";
import Loader from "./Components/Loader";
import Reports from "./routes/Report";
import Login from "./routes/Login";
import Setting from "./routes/Setting";
import Transactions from "./routes/Transactions";
import Dashboard from "./routes/Dashboard";
import ViewTransaction from "./routes/ViewTransaction";
import ViewProject from "./routes/ViewProject";
import AdminProducts from "./routes/AdminProducts";
import AddEditProduct from "./routes/AddEditProduct";
import Orders from "./routes/Orders";
import Staff from "./routes/Staff";
import AddEditStaff from "./routes/AddEditStaff";
import Email from "./routes/Email";
import NotFound from "./routes/NotFound";

// ProtectedRoute uses AuthContext
const ProtectedRoute = ({ element }) => {
  const { currentUser } = useContext(AuthContext);

  return currentUser ? element : <Navigate to="/" replace />;
};

// Super Admin Only Route
const SuperAdminRoute = ({ element }) => {
  const { currentUser } = useContext(AuthContext);

  // Safe JSON parsing
  let user = {};
  try {
    user = JSON.parse(sessionStorage.getItem('user') || '{}');
  } catch (e) {
    console.error('Failed to parse user data');
    sessionStorage.removeItem('user');
  }

  if (!currentUser) {
    return <Navigate to="/" replace />;
  }

  if (user.role !== 'super-admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return element;
};

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const router = createBrowserRouter([
    { path: "/", element: <Login /> },
    {
      path: "*",
      element: <ProtectedRoute element={<NotFound />} />,
    },
    {
      path: "/dashboard",
      element: <ProtectedRoute element={<Dashboard />} />,
    },
    {
      path: "/add",
      element: <ProtectedRoute element={<Reports />} />,
    },
    {
      path: "/admin-products",
      element: <ProtectedRoute element={<AdminProducts />} />,
    },
    {
      path: "/add-product",
      element: <ProtectedRoute element={<AddEditProduct />} />,
    },
    {
      path: "/edit-product/:id",
      element: <ProtectedRoute element={<AddEditProduct />} />,
    },
    {
      path: "/projects", // Order Transaction history
      element: <ProtectedRoute element={<Orders />} />,
    },
    {
      path: "/viewProject/:id",
      loader: ({ params }) => {
        window.location.href = `/projects/view/${params.id}`;
        return null;
      },
      element: <div>Redirecting...</div>,
    },
    {
      path: "/projects/view/:id",
      element: <ProtectedRoute element={<ViewProject />} />,
    },
    {
      path: "/staff",
      element: <SuperAdminRoute element={<Staff />} />,
    },
    {
      path: "/add-staff",
      element: <SuperAdminRoute element={<AddEditStaff />} />,
    },
    {
      path: "/edit-staff/:id",
      element: <SuperAdminRoute element={<AddEditStaff />} />,
    },
    {
      path: "/email",
      element: <ProtectedRoute element={<Email />} />,
    },
    {
      path: "/settings",
      element: <ProtectedRoute element={<Setting />} />,
    },
  ]);

  return (
    <>
      {loading ? (
        <Loader />
      ) : (
        <RouterProvider router={router} />
      )}
    </>
  );
}

export default App;
