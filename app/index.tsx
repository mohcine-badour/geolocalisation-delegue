import React, { useState, useEffect, useRef } from "react";
import { View, ActivityIndicator, Alert, StyleSheet, Text } from "react-native";
import * as Location from "expo-location";
import MapView, { Marker, Polyline } from "react-native-maps";

export default function Index() {
  const [location, setLocation] =
    useState<Location.LocationObjectCoords | null>(null);
  const [loading, setLoading] = useState(false);
  const [destination, setDestination] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [route, setRoute] = useState<any[]>([]); // Stocke l'itinéraire
  const [distanceToDestination, setDistanceToDestination] = useState<number>(0);
  const mapRef = useRef(null);

  // Région par défaut sur le Maroc
  const initialRegion = {
    latitude: 31.7917, // 🇲🇦 Maroc
    longitude: -7.0926,
    latitudeDelta: 5,
    longitudeDelta: 5,
  };

  useEffect(() => {
    fetchLocation();
  }, []);

  useEffect(() => {
    const watchPosition = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Erreur", "Permission de localisation refusée.");
        return;
      }

      const locationWatcher = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 1000, // Mise à jour toutes les secondes
          distanceInterval: 1, // Mise à jour tous les 1 mètre
        },
        (newLocation) => {
          setLocation(newLocation.coords);

          // Recalculer la distance à la destination
          if (destination) {
            const distance = calculateDistance(
              newLocation.coords.latitude,
              newLocation.coords.longitude,
              destination.latitude,
              destination.longitude
            );
            setDistanceToDestination(distance);
          }

          // Animer la carte pour centrer sur la position de l'utilisateur
          if (mapRef.current) {
            mapRef.current.animateToRegion(
              {
                latitude: newLocation.coords.latitude,
                longitude: newLocation.coords.longitude,
                latitudeDelta: 0.01, // Zoom proche
                longitudeDelta: 0.01,
              },
              1000
            );
          }
        }
      );

      return locationWatcher;
    };

    const watcher = watchPosition();

    return () => watcher.then((w) => w.remove());
  }, [destination]);

  const fetchLocation = async () => {
    setLoading(true);

    // Timeout de 3 secondes pour éviter un chargement long
    const timeout = setTimeout(() => {
      setLoading(false);
      Alert.alert(
        "Info",
        "Impossible d'obtenir la localisation. Affichage du Maroc."
      );
    }, 3000);

    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Erreur", "Permission de localisation refusée.");
      setLoading(false);
      return;
    }

    try {
      let loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      clearTimeout(timeout);
      setLocation(loc.coords);

      // Animer la carte pour centrer sur la position de l'utilisateur
      if (mapRef.current) {
        mapRef.current.animateToRegion(
          {
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
            latitudeDelta: 0.01, // Zoom proche
            longitudeDelta: 0.01,
          },
          1000
        ); // 1000ms pour animer la transition
      }
    } catch (error) {
      Alert.alert("Erreur", "Problème de récupération de la localisation.");
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour gérer le clic sur la carte
  const handleMapPress = (e: any) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setDestination({ latitude, longitude }); // Enregistrer la destination
    console.log(latitude);
    console.log(longitude);
    // Appeler la fonction pour calculer l'itinéraire
    fetchRoute(location?.latitude, location?.longitude, latitude, longitude);
  };

  const fetchRoute = async (
    startLat: number | undefined,
    startLng: number | undefined,
    endLat: number,
    endLng: number
  ) => {
    if (!startLat || !startLng) {
      Alert.alert("Erreur", "Position de départ invalide.");
      return;
    }

    // Exemple d'itinéraire avec OpenRouteService (ou tu peux utiliser une autre API comme OSRM)
    const endpoint = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=5b3ce3597851110001cf6248dea42d04f87c4425ba6362d4c007d104&start=${startLng},${startLat}&end=${endLng},${endLat}`;

    try {
      const response = await fetch(endpoint);
      const data = await response.json(); // Convertir la réponse en JSON

      // Vérifier la structure de la réponse et afficher un message d'erreur détaillé
      if (data && data.features && data.features.length > 0) {
        const routePoints = data.features[0].geometry.coordinates.map(
          (coord: any) => ({
            latitude: coord[1],
            longitude: coord[0],
          })
        );

        setRoute(routePoints); // Mettre à jour l'itinéraire
      } else {
        Alert.alert("Erreur", "Impossible de récupérer l'itinéraire.");
      }
    } catch (error) {
      console.error("Erreur de récupération de l'itinéraire : ", error);
      Alert.alert("Erreur", "Erreur lors de la récupération de l'itinéraire.");
    }
  };

  // Fonction pour calculer la distance entre deux points (en mètres)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const toRad = (value) => (value * Math.PI) / 180;

    const R = 6371e3; // Rayon de la Terre en mètres
    const φ1 = toRad(lat1);
    const φ2 = toRad(lat2);
    const Δφ = toRad(lat2 - lat1);
    const Δλ = toRad(lon2 - lon1);

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) *
      Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distance = R * c; // Distance en mètres
    return distance;
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={initialRegion} // Carte du Maroc par défaut
        ref={mapRef} // Référence de la carte pour animation
        onPress={handleMapPress} // Cliquer sur la carte pour choisir une nouvelle destination
      >
        {location && (
          <Marker
            coordinate={{
              latitude: location.latitude,
              longitude: location.longitude,
            }}
            title="Votre Position"
            pinColor="red"
          />
        )}

        {/* Affichage de la destination choisie */}
        {destination && (
          <Marker
            coordinate={destination}
            title="Destination choisie"
            pinColor="green"
          />
        )}

        {/* Affichage de l'itinéraire */}
        {route.length > 0 && (
          <Polyline coordinates={route} strokeColor="blue" strokeWidth={4} />
        )}
      </MapView>

      {loading && (
        <ActivityIndicator
          size="large"
          color="blue"
          style={styles.loadingIndicator}
        />
      )}
      {/* Affichage de la distance à la destination */}
      {destination && (
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            Distance à la destination : {Math.round(distanceToDestination)} mètres
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, // Plein écran
  },
  map: {
    flex: 1, // Plein écran
  },
  loadingIndicator: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -25 }, { translateY: -25 }],
  },
  distanceContainer: {
    position: "absolute",
    bottom: 20,
    left: 20,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    padding: 10,
    borderRadius: 5,
  },
  distanceText: {
    color: "white",
    fontSize: 16,
  },

  infoContainer: {
    position: "absolute",
    bottom: 20,
    left: 20,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    padding: 10,
    borderRadius: 10,
  },
  infoText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
