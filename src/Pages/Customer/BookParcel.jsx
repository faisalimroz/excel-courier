import React, { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { bookParcel } from "../../store/slices/parcelSlice";
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import JsBarcode from 'jsbarcode';

const BookParcel = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { loading, error } = useSelector((state) => state.parcels);
  const [showBarcode, setShowBarcode] = useState(false);
  const [barcodeData, setBarcodeData] = useState(null);
  const canvasRef = useRef(null);

  const [formData, setFormData] = useState({
    pickupAddress: "",
    deliveryAddress: "",
    parcelSize: "small",
    parcelType: "",
    paymentType: "COD",
    codAmount: 0,
    notes: "",
  });

  const [amount, setAmount] = useState(80); 

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "parcelSize") {
      const sizeAmount = value === "small" ? 80 : value === "medium" ? 120 : 200;
      setAmount(sizeAmount);
    }

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const generateBarcode = (trackingNumber) => {
    if (canvasRef.current) {
      JsBarcode(canvasRef.current, trackingNumber, {
        format: "CODE128",
        width: 2,
        height: 100,
        displayValue: true,
        fontSize: 16,
        margin: 10
      });
    }
  };

  const downloadBarcode = () => {
    if (canvasRef.current) {
      const link = document.createElement('a');
      link.download = `barcode-${barcodeData.trackingNumber}.png`;
      link.href = canvasRef.current.toDataURL();
      link.click();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const parcelData = {
      ...formData,
      amount,
      codAmount: formData.paymentType === 'COD' ? formData.codAmount : 0,
    };

    const result = await dispatch(bookParcel(parcelData));
    
    if (!result.error) {
      await Swal.fire({
        icon: 'success',
        title: 'Parcel Booked Successfully!',
        text: `Your parcel has been booked with tracking number: ${result.payload.parcel.trackingNumber}`,
        confirmButtonText: 'Generate Barcode',
        showCancelButton: true,
        cancelButtonText: 'Close'
      });

      setBarcodeData(result.payload.parcel);
      setShowBarcode(true);
      

      setFormData({
        pickupAddress: "",
        deliveryAddress: "",
        parcelSize: "small",
        parcelType: "",
        paymentType: "COD",
        codAmount: 0,
        notes: "",
      });
      setAmount(80);
    } else {
      toast.error(result.payload?.message || 'Failed to book parcel');
    }
  };

  useEffect(() => {
    if (barcodeData && canvasRef.current) {
      generateBarcode(barcodeData.trackingNumber);
    }
  }, [barcodeData]);

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-900">Book a Parcel Pickup</h2>
      
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {!showBarcode ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-3">Customer Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={user?.name || ""}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={user?.email || ""}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                />
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pickup Address
              </label>
              <textarea
                name="pickupAddress"
                value={formData.pickupAddress}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows="3"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Delivery Address
              </label>
              <textarea
                name="deliveryAddress"
                value={formData.deliveryAddress}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows="3"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Parcel Size
              </label>
              <select
                name="parcelSize"
                value={formData.parcelSize}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="small">Small (৳80)</option>
                <option value="medium">Medium (৳120)</option>
                <option value="large">Large (৳200)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Parcel Type
              </label>
              <input
                type="text"
                name="parcelType"
                value={formData.parcelType}
                onChange={handleChange}
                placeholder="e.g., Documents, Electronics, Clothing"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-3">Payment Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Type
                </label>
                <select
                  name="paymentType"
                  value={formData.paymentType}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="COD">Cash on Delivery (COD)</option>
                  <option value="prepaid">Prepaid</option>
                </select>
              </div>

              {formData.paymentType === 'COD' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    COD Amount
                  </label>
                  <input
                    type="number"
                    name="codAmount"
                    value={formData.codAmount}
                    onChange={handleChange}
                    placeholder="Amount to collect"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              )}
            </div>
          </div>

 
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Special Instructions (Optional)
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Any special instructions for delivery..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows="3"
            />
          </div>

  
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Delivery Charge:</span>
                <span className="font-semibold">৳{amount}</span>
              </div>
              {formData.paymentType === 'COD' && (
                <div className="flex justify-between">
                  <span>COD Amount:</span>
                  <span className="font-semibold">৳{formData.codAmount}</span>
                </div>
              )}
              <div className="border-t pt-2">
                <div className="flex justify-between font-bold">
                  <span>Total Amount:</span>
                  <span>৳{formData.paymentType === 'COD' ? amount + parseInt(formData.codAmount) : amount}</span>
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold"
          >
            {loading ? "Booking..." : "Book Parcel"}
          </button>
        </form>
      ) : (
        <div className="text-center">
          <div className="bg-green-50 p-6 rounded-lg border-2 border-green-200">
            <div className="text-green-600 text-2xl mb-4">✅</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Parcel Booked Successfully!</h3>
            <p className="text-gray-600 mb-4">
              Your parcel has been booked. Please save the barcode below for delivery.
            </p>
            
            <div className="bg-white p-6 rounded-lg border border-gray-200 mb-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Tracking Barcode</h4>
              <div className="mb-4">
                <canvas ref={canvasRef} className="mx-auto border border-gray-300 rounded p-2" />
              </div>
              <div className="text-sm text-gray-600 mb-4">
                <strong>Tracking Number:</strong> {barcodeData.trackingNumber}
              </div>
              <div className="text-xs text-gray-500">
                <p>• Save this barcode on your device or take a screenshot</p>
                <p>• Show this barcode to the delivery agent when receiving your parcel</p>
                <p>• The agent will scan this barcode to confirm delivery</p>
              </div>
            </div>

            <div className="flex space-x-4 justify-center">
              <button
                onClick={downloadBarcode}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 font-medium"
              >
                Download Barcode
              </button>
              <button
                onClick={() => setShowBarcode(false)}
                className="bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-700 font-medium"
              >
                Book Another Parcel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookParcel;