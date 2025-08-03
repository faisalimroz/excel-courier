import { createBrowserRouter } from "react-router-dom";
import Layout from "../layout/layout";
import ProtectedRoute from "../Components/ProtectedRoute";
import Login from "../Pages/Login/Login";
import Register from "../Pages/Register/Register";
import CustomerDashboard from "../Pages/Customer/CustomerDashboard";
import BookParcel from "../Pages/Customer/BookParcel";
import BookingHistory from "../Pages/Customer/BookingHistory";
import TrackParcel from "../Pages/Customer/TrackParcel";
import AgentDashboard from "../Pages/Agent/AgentDashboard";
import AssignedParcels from "../Pages/Agent/AssignedParcels";
import UpdateParcelStatus from "../Pages/Agent/UpdateParcelStatus";
import QRScanner from "../Pages/Agent/QRScanner";
import OptimizedRoute from "../Pages/Agent/OptimizedRoute";
import AdminDashboard from "../Pages/Admin/AdminDashboard";
import ManageParcels from "../Pages/Admin/ManageParcels";
import ManageAgents from "../Pages/Admin/ManageAgents";
import ManageCustomers from "../Pages/Admin/ManageCustomers";
import CreateAgent from "../Pages/Admin/CreateAgent";
import Reports from "../Pages/Admin/Reports";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <Layout />,
    children: [
      { path: "register", element: <Register /> },
      { path: "", element: <Login /> },
    ],
  },
  
  {
    path: "/customer",
    element: (
      <ProtectedRoute allowedRoles={['customer']}>
        <CustomerDashboard />
      </ProtectedRoute>
    ),
    children: [
      { path: "dashboard", element: <CustomerDashboard /> },
      { path: "book-parcel", element: <BookParcel /> },
      { path: "booking-history", element: <BookingHistory /> },
      { path: "track-parcel", element: <TrackParcel /> },
    ],
  },
  {
    path: "/agent",
    element: (
      <ProtectedRoute allowedRoles={['agent']}>
        <AgentDashboard />
      </ProtectedRoute>
    ),
    children: [
      { path: "dashboard", element: <AgentDashboard /> },
      { path: "assigned-parcels", element: <AssignedParcels /> },
      { path: "update-status/:parcelId", element: <UpdateParcelStatus /> },
      { path: "qr-scanner", element: <QRScanner /> },
      { path: "optimized-route", element: <OptimizedRoute /> },
    ],
  },
  {
    path: "/admin",
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <AdminDashboard />
      </ProtectedRoute>
    ),
    children: [
      { path: "dashboard", element: <AdminDashboard /> },
      { path: "manage-parcels", element: <ManageParcels /> },
      { path: "manage-agents", element: <ManageAgents /> },
      { path: "manage-customers", element: <ManageCustomers /> },
      { path: "create-agent", element: <CreateAgent /> },
      { path: "reports", element: <Reports /> },
    ],
  },
  {
    path: "/",
    element: <ProtectedRoute><CustomerDashboard /></ProtectedRoute>,
  },
]);