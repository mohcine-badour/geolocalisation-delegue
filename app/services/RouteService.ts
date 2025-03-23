import { Alert } from "react-native";

export const fetchRoute = async (startLat: number, startLng: number, endLat: number, endLng: number, setRoute: any) => {
    const endpoint = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=5b3ce3597851110001cf6248dea42d04f87c4425ba6362d4c007d104&start=${startLng},${startLat}&end=${endLng},${endLat}`;
  
    try {
      const response = await fetch(endpoint);
      const data = await response.json();
      if (data.features && data.features.length > 0) {
        const routePoints = data.features[0].geometry.coordinates.map((coord: any) => ({
          latitude: coord[1],
          longitude: coord[0],
        }));
        setRoute(routePoints);
      } else {
        Alert.alert("Erreur", "Impossible de récupérer l'itinéraire.");
      }
    } catch (error) {
      Alert.alert("Erreur", "Erreur lors de la récupération de l'itinéraire.");
    }
  };
  