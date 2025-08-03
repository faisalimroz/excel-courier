import React, { useState, useEffect } from "react";
import { GoogleMap, Marker, LoadScript } from "@react-google-maps/api";
import io from "socket.io-client";

const TrackParcel = ({ parcelId }) => {
  const [location, setLocation] = useState({ lat: 0, lng: 0 });

useEffect(() => {
  const socket = io("http://localhost:5000");

  socket.emit("joinParcelRoom", parcelId);

  socket.on("locationUpdate", (newLocation) => {
    setLocation(newLocation);
  });

  return () => {
    socket.disconnect();
  };
}, [parcelId]);

  return (
    <div>
      <h2>Track Parcel</h2>
      <LoadScript googleMapsApiKey="AIzaSyCnapboODXV2Ap-eMuBJ6ZsoBsrditSE4w">
        <GoogleMap
          mapContainerStyle={{ width: "100%", height: "400px" }}
          center={location}
          zoom={15}
        >
          <Marker position={location} />
        </GoogleMap>
      </LoadScript>
    </div>
  );
};

export default TrackParcel;