import * as Location from "expo-location";
import { Alert } from "react-native";
import { calculateDistance } from "../utils/utils";

export const getLocation = async (setLocation: any, setLoading: any) => {
  setLoading(true);
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== "granted") {
    Alert.alert("Erreur", "Permission de localisation refusée.");
    setLoading(false);
    return;
  }

  try {
    const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
    setLocation(loc.coords);
  } catch (error) {
    Alert.alert("Erreur", "Problème de récupération de la localisation.");
  } finally {
    setLoading(false);
  }
};

export const watchLocation = (setLocation: any, setDistance: any, destination: any, mapRef: any) => {
  const watchPosition = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Erreur", "Permission de localisation refusée.");
      return;
    }

    const locationWatcher = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 1000,
        distanceInterval: 1,
      },
      (newLocation) => {
        setLocation(newLocation.coords);
        if (destination) {
          const distance = calculateDistance(
            newLocation.coords.latitude,
            newLocation.coords.longitude,
            destination.latitude,
            destination.longitude
          );
          setDistance(distance);
        }
        if (mapRef.current) {
          mapRef.current.animateToRegion({
            latitude: newLocation.coords.latitude,
            longitude: newLocation.coords.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          });
        }
      }
    );
    return locationWatcher;
  };

  return watchPosition;
};
