import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import { Provider, useDispatch, useSelector } from "react-redux";
import { store } from "../redux/store";
import { bootstrapAuth, getMe } from "../redux/slices/authslice";
import { useEffect } from "react";
import SimpleLoadingScreen from "../screens/loadingscreen";

export default function RootLayout() {
  return (
    <Provider store={store}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <KeyboardProvider>
          <SafeAreaProvider>
            <StatusBar style="dark" />
            <AppNavigator />
          </SafeAreaProvider>
        </KeyboardProvider>
      </GestureHandlerRootView>
    </Provider>
  );
}

function AppNavigator() {
  const dispatch = useDispatch();
  const isLogin = false;
  const { isLoggedIn, isLoading, role, token } = useSelector(
    (state) => state.auth
  );
  useEffect(() => {
    dispatch(bootstrapAuth());
    // dispatch(getMe(token));
  }, []);

  if (isLoading) {
    return <SimpleLoadingScreen />;
  }
  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "fade",
          contentStyle: { backgroundColor: "#fff" },
        }}
      >
        <Stack.Protected guard={isLoggedIn}>
          <Stack.Screen name="(app)" />
        </Stack.Protected>

        <Stack.Protected guard={!isLoggedIn}>
          <Stack.Screen name="(auth)" />
        </Stack.Protected>
      </Stack>
    </View>
  );
}
