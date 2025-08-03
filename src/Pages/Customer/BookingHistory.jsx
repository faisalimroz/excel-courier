import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getBookingHistory } from "../../store/slices/parcelSlice";

const BookingHistory = () => {
  const dispatch = useDispatch();
  const { bookingHistory, error, loading } = useSelector((state) => state.parcels);

  useEffect(() => {
    dispatch(getBookingHistory());
  }, [dispatch]);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-3xl font-semibold mb-6 text-center text-blue-700">📦 Booking History</h2>

      {loading && (
        <div className="text-center text-blue-500 mb-4 animate-pulse">
          Loading booking history...
        </div>
      )}

      {error && (
        <div className="bg-red-100 text-red-700 border border-red-400 p-4 rounded mb-4">
          <strong>Error:</strong> {error}
        </div>
      )}

      {!error && !loading && bookingHistory.length === 0 && (
        <div className="bg-yellow-100 text-yellow-700 border border-yellow-400 p-4 rounded mb-4">
          No bookings found or failed to fetch data from the server.
        </div>
      )}

      <div className="grid gap-4">
        {bookingHistory.map((booking) => (
          <div
            key={booking._id}
            className="bg-white shadow-md rounded-lg p-6 border hover:shadow-lg transition duration-300"
          >
            <p className="mb-2">
              <span className="font-medium text-gray-700">📍 Pickup:</span> {booking.pickupAddress}
            </p>
            <p className="mb-2">
              <span className="font-medium text-gray-700">🚚 Delivery:</span> {booking.deliveryAddress}
            </p>
             <p className="mb-2">
              <span className="font-medium text-gray-700">Date: </span> {booking.
createdAt.slice(0,10)}
            </p>
            <p className="text-sm font-semibold text-green-700">
              Status: <span className="capitalize">{booking.status}</span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BookingHistory;
