import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateParcelStatus } from '../../store/slices/parcelSlice';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';

const QRScanner = () => {
  const dispatch = useDispatch();
  const { assignedParcels } = useSelector((state) => state.parcels);
  const [scanner, setScanner] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [scannedCode, setScannedCode] = useState('');
  const [message, setMessage] = useState('');
  const [actionType, setActionType] = useState('pickup'); 
  const scannerContainerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (scanner) {
        try {
          scanner.clear();
        } catch (error) {
          console.log('Scanner cleanup error:', error);
        }
      }
    };
  }, [scanner]);

  const startScanner = () => {
 
    if (scanner) {
      try {
        scanner.clear();
      } catch (error) {
        console.log('Error clearing scanner:', error);
      }
    }

    
    const scannerId = 'barcode-scanner-' + Date.now();
    if (scannerContainerRef.current) {
      scannerContainerRef.current.innerHTML = '';
      const container = document.createElement('div');
      container.id = scannerId;
      container.style.width = '100%';
      container.style.maxWidth = '500px';
      container.style.margin = '0 auto';
      
      scannerContainerRef.current.appendChild(container);
    }

    const html5QrcodeScanner = new Html5QrcodeScanner(
      scannerId,
      { 
        fps: 10, 
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0
      },
      false
    );

    html5QrcodeScanner.render(onScanSuccess, onScanFailure);
    setScanner(html5QrcodeScanner);
    setScanning(true);
    setMessage('');
    
    toast.info('Scanner started! Point camera at customer barcode');
  };

  const stopScanner = () => {
    if (scanner) {
      try {
        scanner.clear();
      } catch (error) {
        console.log('Error stopping scanner:', error);
      }
      setScanner(null);
    }
    setScanning(false);
    if (scannerContainerRef.current) {
      scannerContainerRef.current.innerHTML = '';
    }
    
    toast.info('Scanner stopped');
  };

  const onScanSuccess = (decodedText, decodedResult) => {
    setScannedCode(decodedText);
    setMessage('Barcode scanned successfully!');
    stopScanner();
    
    
    const parcel = assignedParcels.find(p => p.trackingNumber === decodedText);
    
    if (parcel) {
      handleParcelAction(parcel);
    } else {
      toast.error('Parcel not found or not assigned to you');
    }
  };

  const onScanFailure = (error) => {

  };

  const handleParcelAction = async (parcel) => {
    const actionText = actionType === 'pickup' ? 'pick up' : 'deliver';
    const statusText = actionType === 'pickup' ? 'Picked Up' : 'Delivered';
    
    try {
      const result = await Swal.fire({
        title: `Confirm ${actionType === 'pickup' ? 'Pickup' : 'Delivery'}`,
        html: `
          <div class="text-left">
            <p><strong>Tracking Number:</strong> ${parcel.trackingNumber}</p>
            <p><strong>Customer:</strong> ${parcel.customerName}</p>
            <p><strong>From:</strong> ${parcel.pickupAddress}</p>
            <p><strong>To:</strong> ${parcel.deliveryAddress}</p>
            <p><strong>Status:</strong> ${parcel.status}</p>
          </div>
        `,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: `Confirm ${actionType === 'pickup' ? 'Pickup' : 'Delivery'}`,
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33'
      });

      if (result.isConfirmed) {
        const newStatus = actionType === 'pickup' ? 'Picked Up' : 'Delivered';
        
        const updateResult = await dispatch(updateParcelStatus({
          parcelId: parcel._id,
          status: newStatus,
          location: parcel.location
        }));

        if (!updateResult.error) {
          await Swal.fire({
            icon: 'success',
            title: `${actionType === 'pickup' ? 'Pickup' : 'Delivery'} Confirmed!`,
            text: `Parcel ${parcel.trackingNumber} has been ${actionText} successfully.`,
            confirmButtonText: 'OK'
          });
          
          toast.success(`Parcel ${actionText} successfully`);
          setScannedCode('');
          setMessage('');
        } else {
          toast.error('Failed to update parcel status');
        }
      }
    } catch (error) {
      toast.error('An error occurred while processing the parcel');
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-4 sm:p-8 rounded-lg shadow-md">
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Barcode Scanner</h2>
        <p className="text-sm sm:text-base text-gray-600">
          Scan customer barcodes to confirm pickup or delivery
        </p>
      </div>

      {message && (
        <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          {message}
        </div>
      )}

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Action Type
        </label>
        <select
          value={actionType}
          onChange={(e) => setActionType(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="pickup">Pickup Confirmation</option>
          <option value="delivery">Delivery Confirmation</option>
        </select>
      </div>

      <div className="mb-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-2">Instructions:</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Select the action type (Pickup or Delivery)</li>
            <li>• Click "Start Scanner" to activate the camera</li>
            <li>• Point the camera at the customer's barcode</li>
            <li>• The system will automatically update the parcel status</li>
            <li>• Make sure the barcode is clearly visible and well-lit</li>
          </ul>
        </div>
      </div>

      <div className="mb-6">
        {!scanning ? (
          <button
            onClick={startScanner}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 font-medium"
          >
            Start Scanner
          </button>
        ) : (
          <button
            onClick={stopScanner}
            className="w-full bg-red-600 text-white py-3 px-4 rounded-md hover:bg-red-700 font-medium"
          >
            Stop Scanner
          </button>
        )}
      </div>

      
      <div ref={scannerContainerRef} className="mb-6 flex justify-center">
        {scanning && (
          <div className="text-center text-gray-500">
            <div className="text-lg">Initializing scanner...</div>
          </div>
        )}
      </div>

      {scannedCode && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-medium text-blue-900 mb-2">Scanned Code:</h3>
          <p className="text-blue-700 font-mono break-all">{scannedCode}</p>
        </div>
      )}

      <div className="mt-8 pt-6 border-t border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Scans</h3>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">
            No recent scans. Start scanning to see activity here.
          </p>
        </div>
      </div>
    </div>
  );
};

export default QRScanner; 