import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Outlet } from 'react-router-dom';
import { logoutUser } from '../../store/slices/authSlice';
import { getAssignedParcels } from '../../store/slices/parcelSlice';

const AgentDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { assignedParcels } = useSelector((state) => state.parcels);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    dispatch(getAssignedParcels());
  }, [dispatch]);

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/login');
  };

  const menuItems = [
    { name: 'Dashboard', path: '/agent/dashboard' },
    { name: 'Assigned Parcels', path: '/agent/assigned-parcels' },
    { name: 'Barcode Scanner', path: '/agent/qr-scanner' },
    { name: 'Optimized Route', path: '/agent/optimized-route' },
  ];

 
  const isOnDashboard = window.location.pathname === '/agent/dashboard';

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
              <span className="text-purple-700  hidden sm:block">Agent: {user?.name}</span>
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
          <div className="space-y-8">
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Welcome back, {user?.name}! 👋
              </h2>
              <p className="text-gray-600">
                You have {assignedParcels.length} parcel(s) assigned to you. 
                Use the tools below to manage your deliveries efficiently.
              </p>
            </div>

           
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Assigned</p>
                    <p className="text-2xl font-semibold text-gray-900">{assignedParcels.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Pending Pickup</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {assignedParcels.filter(p => p.status === 'Booked').length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-green-100 text-green-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">In Transit</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {assignedParcels.filter(p => p.status === 'Picked Up').length}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => navigate('/agent/assigned-parcels')}
                  className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">📦</div>
                    <div className="font-semibold text-gray-900">View Assigned Parcels</div>
                    <div className="text-sm text-gray-600">Manage your deliveries</div>
                  </div>
                </button>
                
                <button
                  onClick={() => navigate('/agent/qr-scanner')}
                  className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">📱</div>
                    <div className="font-semibold text-gray-900">Barcode Scanner</div>
                    <div className="text-sm text-gray-600">Scan customer barcodes for pickup/delivery</div>
                  </div>
                </button>

                <button
                  onClick={() => navigate('/agent/optimized-route')}
                  className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">🗺️</div>
                    <div className="font-semibold text-gray-900">Optimized Route</div>
                    <div className="text-sm text-gray-600">Get optimized delivery routes</div>
                  </div>
                </button>

                <button
                  onClick={() => navigate('/agent/assigned-parcels')}
                  className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">📍</div>
                    <div className="font-semibold text-gray-900">Update Status</div>
                    <div className="text-sm text-gray-600">Mark deliveries complete</div>
                  </div>
                </button>
              </div>
            </div>

            {assignedParcels.length > 0 && (
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Parcels</h3>
                <div className="space-y-3">
                  {assignedParcels.slice(0, 5).map((parcel) => (
                    <div key={parcel._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{parcel.trackingNumber}</p>
                        <p className="text-sm text-gray-600">{parcel.customerName}</p>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          parcel.status === 'Booked' ? 'bg-yellow-100 text-yellow-800' :
                          parcel.status === 'Picked Up' ? 'bg-blue-100 text-blue-800' :
                          parcel.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {parcel.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
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

export default AgentDashboard; 