import React, { useEffect, useState } from 'react';
import {
  Button,
  InteractionManager,
  PermissionsAndroid,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Camera, Map, UserLocation } from '@maplibre/maplibre-react-native';
import { getClosestStop } from './StopFinder';
const STYLE_URL = 'https://tiles.openfreemap.org/styles/liberty';

async function requestLocationPermission(): Promise<boolean> {
  if (Platform.OS !== 'android') return true;
  const granted = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
  );
  return granted === PermissionsAndroid.RESULTS.GRANTED;
}

export default function App() {
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [boxText, setBoxText] = useState('No stop selected');

  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(() => {
      requestLocationPermission().then(granted => {
        if (!granted) {
          setError('Location permission denied');
        } else {
          setPermissionGranted(true);
        }
      });
    });
    return () => task.cancel();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.toolbar}>
        <Text style={styles.box}>{boxText}</Text>
        <Button
          title="Go"
          onPress={async () => {
            const result = await getClosestStop(33.78183, -118.189384);
            setBoxText(result);
          }}
        />
      </View>
      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : (
        <Map style={styles.map} mapStyle={STYLE_URL}>
          {permissionGranted && (
            <>
              <Camera
                trackUserLocation="default"
                initialViewState={{ zoom: 14 }}
              />
              <UserLocation visible />
            </>
          )}
        </Map>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    gap: 8,
    backgroundColor: '#fff',
  },
  box: {
    flex: 1,
    fontSize: 16,
    padding: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
  },
  map: {
    flex: 1,
  },
  error: {
    flex: 1,
    textAlign: 'center',
    textAlignVertical: 'center',
    fontSize: 16,
    color: '#f44',
  },
});
