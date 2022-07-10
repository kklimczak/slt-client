/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, {useCallback, useEffect, useRef, useState} from 'react';
import type {Node} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  NativeEventEmitter,
  NativeModules,
  PermissionsAndroid,
  Button,
} from 'react-native';

import BLEManager from 'react-native-ble-manager/BleManager';

import {
  Colors,
  DebugInstructions,
  Header,
  LearnMoreLinks,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';

const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

const App: () => Node = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const [discoveredPeripheral, setDiscoveredPeripheral] = useState([]);
  const stateRef = useRef();

  stateRef.current = discoveredPeripheral;

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  const handleDiscoveredPeripheral = useCallback(e => {
    if (!stateRef.current.some(peripheral => peripheral.id === e.id)) {
      setDiscoveredPeripheral(prev => [...prev, e]);
    }
  }, []);

  const requestLocationPermission = async () => {
    try {
      const granted = await PermissionsAndroid.requestMultiple(
        [
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
        ],
        {title: 'SLT', message: 'SLT access to your location'},
      );

      console.log(granted);

      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('granted');
      } else {
        console.log('not granted');
      }
    } catch (e) {
      console.log(e);
    }
  };

  const scan = () => {
    setDiscoveredPeripheral([]);
    BLEManager.scan(['58304f18-ffd1-11ec-b939-0242ac120002'], 3, false)
      .then(() => {
        console.log('scan');
      })
      .catch(e => console.log(e));
  };

  useEffect(() => {
    BLEManager.start({showAlert: false});

    bleManagerEmitter.addListener(
      'BleManagerDiscoverPeripheral',
      handleDiscoveredPeripheral,
    );

    requestLocationPermission();

    return () =>
      bleManagerEmitter.removeListener(
        'BleManagerDiscoverPeripheral',
        handleDiscoveredPeripheral,
      );
  }, []);

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={backgroundStyle}>
        <View
          style={{
            backgroundColor: isDarkMode ? Colors.black : Colors.white,
          }}>
          <Button title={'Scan'} onPress={scan} />
          {discoveredPeripheral.map((peripheral, index) => (
            <View style={styles.device} key={index}>
              <Text style={styles.deviceTitle}>{`${peripheral.id}, ${peripheral.name}\n`}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  device: {
    padding: 12,
    backgroundColor: '#ddd',
    margin: 12,
  },
  deviceTitle: {
    margin: 0,
    color: 'black',
  },
});

export default App;
