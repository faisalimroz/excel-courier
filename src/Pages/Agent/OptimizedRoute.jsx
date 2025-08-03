import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { GoogleMap, LoadScript, DirectionsRenderer, Marker } from '@react-google-maps/api';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';

const OptimizedRoute = () => {
  const navigate = useNavigate();
  const { assignedParcels } = useSelector((state) => state.parcels);
  const [directions, setDirections] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedParcels, setSelectedParcels] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false);

  const mapContainerStyle = {
    width: '100%',
    height: '400px'
  };

  const center = {
    lat: 23.8103, 
    lng: 90.4125
  };

  useEffect(() => {

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          toast.success('Location detected successfully');
        },
        (error) => {
          console.error('Error getting location:', error);
          setError('Unable to get current location');
          toast.error('Unable to get current location');
        }
      );
    } else {
      toast.warning('Geolocation not supported by browser');
    }
  }, []);

  const onGoogleMapsLoad = () => {
    setIsGoogleMapsLoaded(true);
    toast.success('Google Maps loaded successfully');
  };

  const calculateOptimizedRoute = async () => {
    if (selectedParcels.length < 2) {
      toast.error('Please select at least 2 parcels for route optimization');
      return;
    }

    if (!isGoogleMapsLoaded) {
      toast.error('Google Maps is still loading. Please wait.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const directionsService = new window.google.maps.DirectionsService();
      
     
      const waypoints = selectedParcels.map(parcel => ({
        location: parcel.deliveryAddress,
        stopover: true
      }));

      
      const origin = currentLocation 
        ? `${currentLocation.lat},${currentLocation.lng}`
        : selectedParcels[0].pickupAddress;

      
      const destination = selectedParcels[selectedParcels.length - 1].deliveryAddress;

      const request = {
        origin: origin,
        destination: destination,
        waypoints: waypoints.slice(0, -1), 
        optimizeWaypoints: true,
        travelMode: window.google.maps.TravelMode.DRIVING
      };

      directionsService.route(request, (result, status) => {
        if (status === 'OK') {
          setDirections(result);
          toast.success('Route calculated successfully!');
        } else {
          setError('Failed to calculate route. Please check addresses.');
          toast.error('Failed to calculate route. Please check addresses.');
        }
        setLoading(false);
      });
    } catch (error) {
      setError('Error calculating route');
      setLoading(false);
      toast.error('Error calculating route');
    }
  };

  const handleParcelToggle = (parcelId) => {
    setSelectedParcels(prev => {
      const isSelected = prev.find(p => p._id === parcelId);
      if (isSelected) {
        const parcel = assignedParcels.find(p => p._id === parcelId);
        toast.info(`Removed ${parcel.trackingNumber} from route`);
        return prev.filter(p => p._id !== parcelId);
      } else {
        const parcel = assignedParcels.find(p => p._id === parcelId);
        toast.info(`Added ${parcel.trackingNumber} to route`);
        return [...prev, parcel];
      }
    });
  };

  const clearSelection = () => {
    setSelectedParcels([]);
    setDirections(null);
    toast.info('Selection cleared');
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

  return (
    <div className="max-w-6xl mx-auto bg-white p-4 sm:p-8 rounded-lg shadow-md">
      <h2 className="text-xl sm:text-2xl font-bold mb-6 text-gray-900">Optimized Delivery Route</h2>
      
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      
        <div className="xl:col-span-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Parcels for Route</h3>
          
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-3">
              Select parcels to include in the optimized delivery route:
            </p>
            
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {assignedParcels
                .filter(parcel => parcel.status !== 'Delivered' && parcel.status !== 'Failed')
                .map((parcel) => {
                  const isSelected = selectedParcels.find(p => p._id === parcel._id);
                  return (
                    <div
                      key={parcel._id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        isSelected 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleParcelToggle(parcel._id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 truncate">
                            {parcel.trackingNumber}
                          </div>
                          <div className="text-sm text-gray-600 truncate">
                            {parcel.customerName}
                          </div>
                          <div className="text-xs text-gray-500 truncate">
                            {parcel.deliveryAddress}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 ml-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(parcel.status)}`}>
                            {parcel.status}
                          </span>
                          {isSelected && (
                            <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={calculateOptimizedRoute}
              disabled={loading || selectedParcels.length < 2 || !isGoogleMapsLoaded}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Calculating Route...' : 'Calculate Optimized Route'}
            </button>
            
            <button
              onClick={clearSelection}
              className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700"
            >
              Clear Selection
            </button>
          </div>

          {selectedParcels.length > 0 && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Selected Parcels ({selectedParcels.length})</h4>
              <div className="space-y-1">
                {selectedParcels.map((parcel, index) => (
                  <div key={parcel._id} className="text-sm text-blue-800 truncate">
                    {index + 1}. {parcel.trackingNumber} - {parcel.customerName}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Map */}
        <div className="xl:col-span-2">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Route Map</h3>
          
          <LoadScript 
            googleMapsApiKey="AIzaSyCnapboODXV2Ap-eMuBJ6ZsoBsrditSE4w"
            onLoad={onGoogleMapsLoad}
          >
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={center}
              zoom={12}
            >
              {currentLocation && isGoogleMapsLoaded && (
                <Marker
                  position={currentLocation}
                  icon={{
                    url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
                    scaledSize: new window.google.maps.Size(30, 30)
                  }}
                  title="Your Location"
                />
              )}
              
              {directions && (
                <DirectionsRenderer
                  directions={directions}
                  options={{
                    suppressMarkers: false,
                    polylineOptions: {
                      strokeColor: '#3B82F6',
                      strokeWeight: 4
                    }
                  }}
                />
              )}
            </GoogleMap>
          </LoadScript>

          {!isGoogleMapsLoaded && (
            <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">
              <div className="text-center">
                <div className="text-lg text-gray-600 mb-2">Loading Google Maps...</div>
                <div className="text-sm text-gray-500">Please wait while the map loads</div>
              </div>
            </div>
          )}

          {directions && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Route Summary</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <div><strong>Total Distance:</strong> {directions.routes[0].legs.reduce((total, leg) => total + leg.distance.text, 0)}</div>
                <div><strong>Estimated Time:</strong> {directions.routes[0].legs.reduce((total, leg) => total + leg.duration.text, 0)}</div>
                <div><strong>Stops:</strong> {selectedParcels.length}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 flex space-x-4">
        <button
          onClick={() => navigate('/agent/assigned-parcels')}
          className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
        >
          Back to Parcels
        </button>
      </div>
    </div>
  );
};

export default OptimizedRoute; 