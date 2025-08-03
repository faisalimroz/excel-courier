import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { updateParcelStatus } from '../../store/slices/parcelSlice';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';

const UpdateParcelStatus = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { parcelId } = useParams();
  const { assignedParcels } = useSelector((state) => state.parcels);
  
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const parcel = assignedParcels.find(p => p._id === parcelId);

  useEffect(() => {
    if (!parcel) {
      setMessage('Parcel not found or not assigned to you');
      toast.error('Parcel not found or not assigned to you');
    }
  }, [parcel]);

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    if (!status) {
      toast.error('Please select a status');
      return;
    }

    try {
      const result = await Swal.fire({
        title: 'Confirm Status Update',
        text: `Are you sure you want to update the status to "${status}"?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Update Status',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33'
      });

      if (result.isConfirmed) {
        setLoading(true);
        
        const updateResult = await dispatch(updateParcelStatus({ parcelId, status }));
        
        if (!updateResult.error) {
          await Swal.fire({
            icon: 'success',
            title: 'Status Updated!',
            text: `Parcel status has been updated to ${status}`,
            confirmButtonText: 'OK'
          });
          
          toast.success('Status updated successfully!');
          setTimeout(() => {
            navigate('/agent/assigned-parcels');
          }, 2000);
        } else {
          toast.error('Failed to update status');
        }
      }
    } catch (error) {
      toast.error('Error updating status');
    } finally {
      setLoading(false);
    }
  };

  if (!parcel) {
    return (
      <div className="max-w-2xl mx-auto bg-white p-4 sm:p-8 rounded-lg shadow-md">
        <h2 className="text-xl sm:text-2xl font-bold mb-6 text-gray-900">Update Parcel Status</h2>
        <div className="text-center py-8">
          <div className="text-red-500 text-lg">{message}</div>
          <button
            onClick={() => navigate('/agent/assigned-parcels')}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Back to Assigned Parcels
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white p-4 sm:p-8 rounded-lg shadow-md">
      <h2 className="text-xl sm:text-2xl font-bold mb-6 text-gray-900">Update Parcel Status</h2>
      
      {message && (
        <div className={`mb-4 p-4 rounded ${
          message.includes('successfully') 
            ? 'bg-green-100 border border-green-400 text-green-700' 
            : 'bg-red-100 border border-red-400 text-red-700'
        }`}>
          {message}
        </div>
      )}

      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Parcel Details</h3>
        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
          <div className="break-words"><strong>Tracking Number:</strong> {parcel.trackingNumber}</div>
          <div className="break-words"><strong>Customer:</strong> {parcel.customerName}</div>
          <div className="break-words"><strong>Pickup Address:</strong> {parcel.pickupAddress}</div>
          <div className="break-words"><strong>Delivery Address:</strong> {parcel.deliveryAddress}</div>
          <div><strong>Current Status:</strong> 
            <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${
              parcel.status === 'Delivered' ? 'bg-green-100 text-green-800' :
              parcel.status === 'Failed' ? 'bg-red-100 text-red-800' :
              parcel.status === 'In Transit' ? 'bg-purple-100 text-purple-800' :
              parcel.status === 'Picked Up' ? 'bg-yellow-100 text-yellow-800' :
              'bg-blue-100 text-blue-800'
            }`}>
              {parcel.status}
            </span>
          </div>
        </div>
      </div>

      <form onSubmit={handleStatusUpdate} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Update Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">Select new status</option>
            <option value="Picked Up">Picked Up</option>
            <option value="In Transit">In Transit</option>
            <option value="Delivered">Delivered</option>
            <option value="Failed">Failed</option>
          </select>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            type="submit"
            disabled={loading || !status}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? "Updating..." : "Update Status"}
          </button>
          
          <button
            type="button"
            onClick={() => navigate('/agent/assigned-parcels')}
            className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default UpdateParcelStatus; 