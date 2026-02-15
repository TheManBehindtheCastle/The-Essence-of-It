import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RepositoryProvider, useRepository } from './context/RepositoryContext';
import TopicsListScreen from './screens/TopicsListScreen';
import TopicScreen from './screens/TopicScreen';
import ArchiveVault from './screens/ArchiveVault';
import SearchModal from './screens/SearchModal';
import DispatchReader from './screens/DispatchReader';
import ManuscriptReader from './screens/ManuscriptReader';
import LibrisEditor from './screens/LibrisEditor';
import PortfolioScreen from './screens/PortfolioScreen';        // new
import PointsScreen from './screens/PointsScreen';              // new

const Stack = createStackNavigator();

function AppNavigator() {
  const { isLoading } = useRepository();
  if (isLoading) return null;
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="TopicsList" component={TopicsListScreen} />
        <Stack.Screen name="Topic" component={TopicScreen} />
        <Stack.Screen name="Archive" component={ArchiveVault} />
        <Stack.Screen name="Search" component={SearchModal} />
        <Stack.Screen name="DispatchReader" component={DispatchReader} />
        <Stack.Screen name="ManuscriptReader" component={ManuscriptReader} />
        <Stack.Screen name="LibrisEditor" component={LibrisEditor} />
        <Stack.Screen name="Portfolio" component={PortfolioScreen} />
        <Stack.Screen name="Points" component={PointsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <RepositoryProvider>
        <AppNavigator />
      </RepositoryProvider>
    </SafeAreaProvider>
  );
}