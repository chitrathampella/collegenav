export const mapLatLonToSvg = (lat, lon) => {
    const bounds = {
      topLeft: { lat: 17.260800, lon: 78.589900 },
      bottomRight: { lat: 17.259200, lon: 78.591300 },
    };
  
    const svgWidth = 800;
    const svgHeight = 600;
  
    const x = ((lon - bounds.topLeft.lon) / (bounds.bottomRight.lon - bounds.topLeft.lon)) * svgWidth;
    const y = ((bounds.topLeft.lat - lat) / (bounds.topLeft.lat - bounds.bottomRight.lat)) * svgHeight;
  
    return { x, y };
  };
  