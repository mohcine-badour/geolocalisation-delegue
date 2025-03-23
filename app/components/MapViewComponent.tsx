import React from "react";
import { View, StyleSheet, Text, ActivityIndicator } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";

interface MapViewComponentProps {
  location: { latitude: number; longitude: number } | null;
  destination: { latitude: number; longitude: number } | null;
  route: any[];
  onMapPress: (e: any) => void;
  loading: boolean;
  distanceToDestination: number;
}

const MapViewComponent: React.FC<MapViewComponentProps> = ({
  location,
  destination,
  route,
  onMapPress,
  loading,
  distanceToDestination,
}) => (
  <View style={styles.container}>
    <MapView
      style={styles.map}
      initialRegion={{
        latitude: 31.7917,
        longitude: -7.0926,
        latitudeDelta: 5,
        longitudeDelta: 5,
      }}
      onPress={onMapPress}
    >
      {location && (
        <Marker
          coordinate={{ latitude: location.latitude, longitude: location.longitude }}
          title="Votre Position"
          pinColor="red"
        />
      )}
      {destination && (
        <Marker coordinate={destination} title="Destination choisie" pinColor="green" />
      )}
      {route.length > 0 && <Polyline coordinates={route} strokeColor="blue" strokeWidth={4} />}
    </MapView>
    {loading && <ActivityIndicator size="large" color="blue" style={styles.loadingIndicator} />}
    {destination && (
      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>
          Distance à la destination : {Math.round(distanceToDestination)} mètres
        </Text>
      </View>
    )}
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  loadingIndicator: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -25 }, { translateY: -25 }],
  },
  infoContainer: {
    position: "absolute",
    bottom: 20,
    left: 20,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    padding: 10,
    borderRadius: 10,
  },
  infoText: { color: "white", fontSize: 16, fontWeight: "bold" },
});

export default MapViewComponent;
