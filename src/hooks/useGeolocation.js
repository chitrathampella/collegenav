import { useState, useEffect } from 'react';

const useGeolocation = () => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    const success = (position) => {
      setLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
      setError(null);
    };

    const failure = (err) => {
      switch (err.code) {
        case err.PERMISSION_DENIED:
          setError("Permission denied. Please allow location access.");
          break;
        case err.POSITION_UNAVAILABLE:
          setError("Location information is unavailable.");
          break;
        case err.TIMEOUT:
          setError("Timeout expired while fetching location.");
          break;
        default:
          setError("An unknown error occurred.");
          break;
      }
    };

    const geoOptions = {
      enableHighAccuracy: true,
      timeout: 15000, // Increase timeout to 15 seconds
      maximumAge: 0,
    };

    navigator.geolocation.getCurrentPosition(success, failure, geoOptions);
  }, []);

  return { location, error };
};

export default useGeolocation;
