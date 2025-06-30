import axios from 'axios';

export const reverseGeocode = async (coordinates) => {
  try {
    const [longitude, latitude] = coordinates;
    const response = await axios.get(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json`,
      {
        params: {
          access_token: process.env.MAPBOX_TOKEN
        }
      }
    );
    
    return response.data.features[0]?.place_name || 'Unknown location';
  } catch (err) {
    console.error('Geocoding error:', err);
    return 'Location unavailable';
  }
};