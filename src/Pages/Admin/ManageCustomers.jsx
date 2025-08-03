import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getCustomers } from '../../store/slices/userSlice';

const ManageCustomers = () => {
  const dispatch = useDispatch();
  const { customers, loading } = useSelector((state) => state.users);

  useEffect(() => {
    dispatch(getCustomers());
  }, [dispatch]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading customers...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Manage Customers</h2>
        <div className="text-sm text-gray-600">
          Total: {customers.length} customers
        </div>
      </div>

      {customers.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">No customers found.</div>
        </div>
      ) : (
        <div className="grid gap-6">
          {customers.map((customer) => (
            <div key={customer._id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{customer.name}</h3>
                  <p className="text-sm text-gray-600">{customer.email}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Created: {new Date(customer.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  Customer
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageCustomers; 