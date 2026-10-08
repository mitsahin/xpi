import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import { api, type AuthUser } from "./src/api";
import { AuthScreen } from "./src/screens/AuthScreen";
import { HomeScreen } from "./src/screens/HomeScreen";
import { LessonScreen } from "./src/screens/LessonScreen";
import { ProfileScreen } from "./src/screens/ProfileScreen";
import type { RootStackParamList } from "./src/types";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator<RootStackParamList>();

function Tabs({
  user,
  onLogout,
  onUser,
}: {
  user: AuthUser;
  onLogout: () => void;
  onUser: (u: AuthUser) => void;
}) {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#58cc02",
        tabBarInactiveTintColor: "#afafaf",
        tabBarLabelStyle: { fontWeight: "800", fontSize: 12 },
      }}
    >
      <Tab.Screen name="Learn">
        {() => <HomeScreen user={user} />}
      </Tab.Screen>
      <Tab.Screen name="Profile">
        {() => (
          <ProfileScreen user={user} onLogout={onLogout} onUser={onUser} />
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

export default function App() {
  const [booting, setBooting] = useState(true);
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    AsyncStorage.getItem("xpi_token").then(async (t) => {
      if (!t) {
        setBooting(false);
        return;
      }
      try {
        const me = await api.me();
        setUser(me.user);
      } catch {
        await AsyncStorage.removeItem("xpi_token");
      } finally {
        setBooting(false);
      }
    });
  }, []);

  if (booting) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator color="#58cc02" size="large" />
      </View>
    );
  }

  if (!user) {
    return (
      <>
        <StatusBar style="dark" />
        <AuthScreen onAuth={(_t, u) => setUser(u)} />
      </>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      <Stack.Navigator>
        <Stack.Screen name="MainTabs" options={{ headerShown: false }}>
          {() => (
            <Tabs
              user={user}
              onLogout={() => setUser(null)}
              onUser={setUser}
            />
          )}
        </Stack.Screen>
        <Stack.Screen
          name="Lesson"
          component={LessonScreen}
          options={{ headerShown: false, presentation: "fullScreenModal" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
