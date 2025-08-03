import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Outlet } from 'react-router-dom';
import { logoutUser } from '../../store/slices/authSlice';
import { getDashboardStats, getAllParcels } from '../../store/slices/parcelSlice';
import { getAgents, getCustomers } from '../../store/slices/userSlice';

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { parcels } = useSelector((state) => state.parcels);
  const { agents, customers } = useSelector((state) => state.users);
  const [stats, setStats] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([
        dispatch(getDashboardStats()),
        dispatch(getAllParcels()),
        dispatch(getAgents()),
        dispatch(getCustomers())
      ]);
    };
    fetchData();
  }, [dispatch]);

  useEffect(() => {
 
    if (parcels.length > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const todayBookings = parcels.filter(p => new Date(p.createdAt) >= today).length;
      const failedDeliveries = parcels.filter(p => p.status === 'Failed').length;
      const codAmount = parcels
        .filter(p => p.paymentType === 'COD')
        .reduce((sum, p) => sum + (p.codAmount || 0), 0);

      setStats({
        totalParcels: parcels.length,
        todayBookings,
        failedDeliveries,
        codAmount
      });
    }
  }, [parcels]);

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/login');
  };

  const menuItems = [
    { name: 'Dashboard', path: '/admin/dashboard' },
    { name: 'Manage Parcels', path: '/admin/manage-parcels' },
    { name: 'Manage Agents', path: '/admin/manage-agents' },
    { name: 'Manage Customers', path: '/admin/manage-customers' },
    { name: 'Create Agent', path: '/admin/create-agent' },
    { name: 'Reports', path: '/admin/reports' },
  ];


  const isOnDashboard = window.location.pathname === '/admin/dashboard';

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-purple-100">

      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
          
              {!isOnDashboard && (
                <button
                  onClick={toggleSidebar}
                  className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 mr-3"
                  aria-label="Toggle sidebar"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              )}
              <h1 className="text-2xl font-bold text-gray-900">Excel Courier</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-purple-700  hidden sm:block">Admin: {user?.name}</span>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isOnDashboard ? (
          <div className="space-y-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Welcome to Admin Dashboard</h2>
            
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Parcels</h3>
                  <p className="text-3xl font-bold text-blue-600">{stats.totalParcels}</p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Today's Bookings</h3>
                  <p className="text-3xl font-bold text-green-600">{stats.todayBookings}</p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed Deliveries</h3>
                  <p className="text-3xl font-bold text-red-600">{stats.failedDeliveries}</p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Total COD Amount</h3>
                  <p className="text-3xl font-bold text-purple-600">৳{stats.codAmount}</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">System Overview</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Agents:</span>
                    <span className="font-semibold">{agents.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Customers:</span>
                    <span className="font-semibold">{customers.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Active Parcels:</span>
                    <span className="font-semibold">
                      {parcels.filter(p => p.status !== 'Delivered' && p.status !== 'Failed').length}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => navigate('/admin/manage-parcels')}
                    className="w-full p-3 text-left bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                  >
                    <div className="font-medium text-gray-900">Manage Parcels</div>
                    <div className="text-sm text-gray-600">Assign agents and track deliveries</div>
                  </button>
                  
                  <button
                    onClick={() => navigate('/admin/create-agent')}
                    className="w-full p-3 text-left bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                  >
                    <div className="font-medium text-gray-900">Create Agent</div>
                    <div className="text-sm text-gray-600">Add new delivery agents</div>
                  </button>
                  
                  <button
                    onClick={() => navigate('/admin/reports')}
                    className="w-full p-3 text-left bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
                  >
                    <div className="font-medium text-gray-900">View Reports</div>
                    <div className="text-sm text-gray-600">Analytics and exports</div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex">
          
            {sidebarOpen && (
              <div 
                className="fixed inset-0 bg-gray-600 bg-opacity-75 z-40 lg:hidden"
                onClick={closeSidebar}
              ></div>
            )}

          
            <div className={`
              fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 lg:shadow-md lg:rounded-lg
              ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
              <div className="flex items-center justify-between p-4 border-b lg:hidden">
                <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
                <button
                  onClick={closeSidebar}
                  className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  aria-label="Close sidebar"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <nav className="p-4 space-y-2 max-h-screen overflow-y-auto">
                {menuItems.map((item) => (
                  <button
                    key={item.path}
                    onClick={() => {
                      navigate(item.path);
                      closeSidebar();
                    }}
                    className={`w-full text-left px-4 py-3 rounded-md transition-colors ${
                      window.location.pathname === item.path
                        ? 'bg-blue-100 text-blue-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {item.name}
                  </button>
                ))}
              </nav>
            </div>

         
            <div className="flex-1 lg:ml-8">
              <Outlet />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard; 