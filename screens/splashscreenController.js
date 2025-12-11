import { useEffect } from "react";
import { SplashScreen } from "expo-router";
import { useSelector } from "react-redux";

SplashScreen.preventAutoHideAsync();

export default function SplashScreenController({ children }) {
  // ✅ Use 'isLoading' not 'loading'
  const { isLoading } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync();
    }
  }, [isLoading]);

  return <>{children}</>;
}
