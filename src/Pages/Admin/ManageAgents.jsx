import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getAgents } from '../../store/slices/userSlice';

const ManageAgents = () => {
  const dispatch = useDispatch();
  const { agents, loading } = useSelector((state) => state.users);

  useEffect(() => {
    dispatch(getAgents());
  }, [dispatch]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading agents...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Manage Agents</h2>
        <div className="text-sm text-gray-600">
          Total: {agents.length} agents
        </div>
      </div>

      {agents.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">No agents found.</div>
        </div>
      ) : (
        <div className="grid gap-6">
          {agents.map((agent) => (
            <div key={agent._id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{agent.name}</h3>
                  <p className="text-sm text-gray-600">{agent.email}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Created: {new Date(agent.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  Agent
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageAgents; 