import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getAllParcels, assignAgentToParcel } from '../../store/slices/parcelSlice';
import { getAgents } from '../../store/slices/userSlice';

const ManageParcels = () => {
  const dispatch = useDispatch();
  const { parcels, loading } = useSelector((state) => state.parcels);
  const { agents } = useSelector((state) => state.users);
  const [selectedParcel, setSelectedParcel] = useState(null);
  const [selectedAgent, setSelectedAgent] = useState('');

  useEffect(() => {
    dispatch(getAllParcels());
    dispatch(getAgents());
  }, [dispatch]);

  const handleAssignAgent = async (parcelId) => {
    if (!selectedAgent) return;
    
    await dispatch(assignAgentToParcel({ parcelId, agentId: selectedAgent }));
    setSelectedAgent('');
    setSelectedParcel(null);
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
        <div className="text-lg">Loading parcels...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Manage Parcels</h2>
        <div className="text-sm text-gray-600">
          Total: {parcels.length} parcels
        </div>
      </div>

      {parcels.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">No parcels found.</div>
        </div>
      ) : (
        <div className="grid gap-6">
          {parcels.map((parcel) => (
            <div key={parcel._id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Pickup Address</h4>
                  <p className="text-sm text-gray-600">{parcel.pickupAddress}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Delivery Address</h4>
                  <p className="text-sm text-gray-600">{parcel.deliveryAddress}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <span className="text-sm font-medium text-gray-700">Size:</span>
                  <p className="text-sm text-gray-600 capitalize">{parcel.parcelSize}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Type:</span>
                  <p className="text-sm text-gray-600">{parcel.parcelType}</p>
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

              <div className="mb-4">
                <span className="text-sm font-medium text-gray-700">Assigned Agent:</span>
                <p className="text-sm text-gray-600">
                  {parcel.agentId ? `${parcel.agentId.name} (${parcel.agentId.email})` : 'Not assigned'}
                </p>
              </div>

              {parcel.notes && (
                <div className="mb-4">
                  <span className="text-sm font-medium text-gray-700">Notes:</span>
                  <p className="text-sm text-gray-600">{parcel.notes}</p>
                </div>
              )}

              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  Created: {new Date(parcel.createdAt).toLocaleDateString()}
                </div>
                
                {selectedParcel === parcel._id ? (
                  <div className="flex items-center space-x-2">
                    <select
                      value={selectedAgent}
                      onChange={(e) => setSelectedAgent(e.target.value)}
                      className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                    >
                      <option value="">Select Agent</option>
                      {agents.map((agent) => (
                        <option key={agent._id} value={agent._id}>
                          {agent.name} ({agent.email})
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => handleAssignAgent(parcel._id)}
                      disabled={!selectedAgent}
                      className="px-4 py-1 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 disabled:bg-gray-400"
                    >
                      Assign
                    </button>
                    <button
                      onClick={() => setSelectedParcel(null)}
                      className="px-4 py-1 bg-gray-600 text-white rounded-md text-sm hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setSelectedParcel(parcel._id)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                  >
                    Assign Agent
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageParcels; 