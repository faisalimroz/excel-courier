import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getAssignedParcels, updateParcelStatus } from '../../store/slices/parcelSlice';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';

const AssignedParcels = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { assignedParcels, loading } = useSelector((state) => state.parcels);
  const [selectedParcel, setSelectedParcel] = useState(null);
  const [statusUpdate, setStatusUpdate] = useState('');

  useEffect(() => {
    dispatch(getAssignedParcels());
  }, [dispatch]);

  const handleStatusUpdate = async (parcelId) => {
    if (!statusUpdate) return;
    
    try {
      const result = await dispatch(updateParcelStatus({ parcelId, status: statusUpdate }));
      
      if (!result.error) {
        toast.success(`Status updated to ${statusUpdate}`);
        setStatusUpdate('');
        setSelectedParcel(null);
      } else {
        toast.error('Failed to update status');
      }
    } catch (error) {
      toast.error('Error updating status');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Booked': return 'bg-blue-100 text-blue-800';
      case 'Picked Up': return 'bg-yellow-100 text-yellow-800';
      case 'In Transit': return 'bg-purple-100 text-purple-800';
      case 'Delivered': return 'bg-green-100 text-green-800';
      case 'Failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading assigned parcels...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Assigned Parcels</h2>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="text-sm text-gray-600">
            Total: {assignedParcels.length} parcels
          </div>
          <button
            onClick={() => navigate('/agent/optimized-route')}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm"
          >
            View Optimized Route
          </button>
        </div>
      </div>

      {assignedParcels.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">No parcels assigned to you yet.</div>
        </div>
      ) : (
        <div className="grid gap-6">
          {assignedParcels.map((parcel) => (
            <div key={parcel._id} className="bg-white rounded-lg shadow-md p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-start mb-4 gap-3">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Tracking: {parcel.trackingNumber}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Customer: {parcel.customerName} ({parcel.customerEmail})
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(parcel.status)}`}>
                  {parcel.status}
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Pickup Address</h4>
                  <p className="text-sm text-gray-600 break-words">{parcel.pickupAddress}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Delivery Address</h4>
                  <p className="text-sm text-gray-600 break-words">{parcel.deliveryAddress}</p>
                  {parcel.location && parcel.location.lat && parcel.location.lng && (
                    <p className="text-xs text-gray-500 mt-1">
                      📍 Coordinates: {parcel.location.lat.toFixed(4)}, {parcel.location.lng.toFixed(4)}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div>
                  <span className="text-sm font-medium text-gray-700">Size:</span>
                  <p className="text-sm text-gray-600 capitalize">{parcel.parcelSize}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Type:</span>
                  <p className="text-sm text-gray-600 break-words">{parcel.parcelType}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Payment:</span>
                  <p className="text-sm text-gray-600">{parcel.paymentType}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Amount:</span>
                  <p className="text-sm text-gray-600">৳{parcel.amount}</p>
                </div>
              </div>

              {parcel.paymentType === 'COD' && (
                <div className="mb-4">
                  <span className="text-sm font-medium text-gray-700">COD Amount:</span>
                  <p className="text-sm text-gray-600">৳{parcel.codAmount}</p>
                </div>
              )}

              {parcel.notes && (
                <div className="mb-4">
                  <span className="text-sm font-medium text-gray-700">Notes:</span>
                  <p className="text-sm text-gray-600 break-words">{parcel.notes}</p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="text-sm text-gray-500">
                  Created: {new Date(parcel.createdAt).toLocaleDateString()}
                </div>
                
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                  {selectedParcel === parcel._id ? (
                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                      <select
                        value={statusUpdate}
                        onChange={(e) => setStatusUpdate(e.target.value)}
                        className="px-3 py-1 border border-gray-300 rounded-md text-sm flex-1 sm:flex-none"
                      >
                        <option value="">Select Status</option>
                        <option value="Picked Up">Picked Up</option>
                        <option value="In Transit">In Transit</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Failed">Failed</option>
                      </select>
                      <button
                        onClick={() => handleStatusUpdate(parcel._id)}
                        disabled={!statusUpdate}
                        className="px-4 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 disabled:bg-gray-400 flex-1 sm:flex-none"
                      >
                        Update
                      </button>
                      <button
                        onClick={() => setSelectedParcel(null)}
                        className="px-4 py-1 bg-gray-600 text-white rounded-md text-sm hover:bg-gray-700 flex-1 sm:flex-none"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setSelectedParcel(parcel._id)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm w-full sm:w-auto"
                    >
                      Update Status
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AssignedParcels; 