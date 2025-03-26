import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LoginScreen } from '../screens/LoginScreen';
import { AddShoeScreen } from '../screens/AddShoeScreen';
import { RecommendationScreen } from '../screens/RecommendationScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { useAuth } from '../contexts/AuthContext';

const Stack = createNativeStackNavigator();

export const Navigation = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return null; // Or a loading screen
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {!user ? (
          <Stack.Screen 
            name="Login" 
            component={LoginScreen} 
            options={{ headerShown: false }}
          />
        ) : (
          <>
            <Stack.Screen 
              name="Recommendation" 
              component={RecommendationScreen}
              options={{ title: 'Size Recommendation' }}
            />
            <Stack.Screen 
              name="Profile" 
              component={ProfileScreen}
              options={{ title: 'My Profile' }}
            />
            <Stack.Screen 
              name="AddShoe" 
              component={AddShoeScreen}
              options={{ title: 'Add New Shoe' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}; 