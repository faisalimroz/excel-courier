import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getDashboardStats } from '../../store/slices/parcelSlice';

const Reports = () => {
  const dispatch = useDispatch();
  const { parcels } = useSelector((state) => state.parcels);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const result = await dispatch(getDashboardStats());
        if (!result.error) {
          setStats(result.payload);
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [dispatch]);

  const exportToCSV = () => {
    const headers = [
      'Tracking Number',
      'Customer Name',
      'Customer Email',
      'Pickup Address',
      'Delivery Address',
      'Parcel Size',
      'Parcel Type',
      'Payment Type',
      'Amount',
      'COD Amount',
      'Status',
      'Assigned Agent',
      'Created Date'
    ];

    const csvData = parcels.map(parcel => [
      parcel.trackingNumber,
      parcel.customerName,
      parcel.customerEmail,
      parcel.pickupAddress,
      parcel.deliveryAddress,
      parcel.parcelSize,
      parcel.parcelType,
      parcel.paymentType,
      parcel.amount,
      parcel.codAmount,
      parcel.status,
      parcel.agentId ? parcel.agentId.name : 'Not assigned',
      new Date(parcel.createdAt).toLocaleDateString()
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `parcel-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusBreakdown = () => {
    if (!stats?.statusBreakdown) return [];
    return stats.statusBreakdown.map(item => ({
      status: item._id,
      count: item.count
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading reports...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Reports & Analytics</h2>
        <button
          onClick={exportToCSV}
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
        >
          Export to CSV
        </button>
      </div>

    
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

     
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Breakdown</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {getStatusBreakdown().map((item) => (
            <div key={item.status} className="text-center">
              <div className="text-2xl font-bold text-gray-900">{item.count}</div>
              <div className="text-sm text-gray-600 capitalize">{item.status}</div>
            </div>
          ))}
        </div>
      </div>

      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Parcels</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tracking
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {parcels.slice(0, 10).map((parcel) => (
                <tr key={parcel._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {parcel.trackingNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {parcel.customerName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      parcel.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                      parcel.status === 'Failed' ? 'bg-red-100 text-red-800' :
                      parcel.status === 'In Transit' ? 'bg-purple-100 text-purple-800' :
                      parcel.status === 'Picked Up' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {parcel.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ৳{parcel.amount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(parcel.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports; 