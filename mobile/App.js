import React, { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import * as NavigationBar from 'expo-navigation-bar';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import Splash from './src/screens/Splash';
import Onboarding from './src/screens/Onboarding';
import { Login, Signup } from './src/screens/Auth';
import MainTabs from './src/navigation/MainTabs';
import { useFonts } from 'expo-font';
import { PlusJakartaSans_700Bold, PlusJakartaSans_800ExtraBold } from '@expo-google-fonts/plus-jakarta-sans';
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { Caveat_700Bold } from '@expo-google-fonts/caveat';
import { Kalam_300Light } from '@expo-google-fonts/kalam';
import { applyGlobalFont } from './src/fonts';
// UI REVIEW SWITCH: true = the 3 onboarding slides show on EVERY app start so you can check them. Set to false before release.
const ALWAYS_SHOW_ONBOARDING = false;

applyGlobalFont();

const Stack = createNativeStackNavigator();

function Root() {
  const { user, ready } = useAuth();
  const [seen, setSeen] = useState(null);
  const [minDelay, setMinDelay] = useState(false);
  // Android: draw the app under the bottom navigation bar so the white strip under the art disappears.
  useEffect(() => {
    if (Platform.OS !== 'android') return;
    (async () => {
      try {
        await NavigationBar.setPositionAsync('absolute');
        await NavigationBar.setBackgroundColorAsync('#00000000');
        await NavigationBar.setButtonStyleAsync('dark');
      } catch (e) { /* not supported on this SDK/device: ignore */ }
    })();
  }, []);
  useEffect(() => {
    AsyncStorage.getItem('onboarded').then((v) => setSeen(ALWAYS_SHOW_ONBOARDING ? false : !!v));
    const t = setTimeout(() => setMinDelay(true), 1500);
    return () => clearTimeout(t);
  }, []);
  // Keep the splash until fonts are loaded (if a font fails to load we continue with system font).
  const [fontsLoaded, fontError] = useFonts({
    PlusJakartaSans_700Bold, PlusJakartaSans_800ExtraBold,
    Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Caveat_700Bold, Kalam_300Light,
  });
  if (!ready || seen === null || !minDelay || !(fontsLoaded || fontError)) return <Splash />;
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <Stack.Screen name="MainTabs" component={MainTabs} />
        ) : (
          <>
            {!seen && (
              <Stack.Screen name="Onboarding">
                {() => <Onboarding onDone={async () => { await AsyncStorage.setItem('onboarded', '1'); setSeen(true); }} />}
              </Stack.Screen>
            )}
            <Stack.Screen name="Login" component={Login} />
            <Stack.Screen name="Signup" component={Signup} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <AuthProvider><Root /></AuthProvider>
    </SafeAreaProvider>
  );
}
