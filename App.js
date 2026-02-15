import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RepositoryProvider } from './context/RepositoryContext';

// Import all screens
import TopicsListScreen from './screens/TopicsListScreen';
import TopicScreen from './screens/TopicScreen';
import ArchiveVault from './screens/ArchiveVault';
import SearchModal from './screens/SearchModal';
import DispatchReader from './screens/DispatchReader';
import ManuscriptReader from './screens/ManuscriptReader';
import LibrisEditor from './screens/LibrisEditor';
import PortfolioScreen from './screens/PortfolioScreen';
import PointsOfInterestScreen from './screens/PointsScreen';
import HighlightsScreen from './screens/HighlightsScreen';
import FictionScreen from './screens/FictionScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <RepositoryProvider>
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
            <Stack.Screen name="Points" component={PointsOfInterestScreen} />
            <Stack.Screen name="Highlights" component={HighlightsScreen} />
            <Stack.Screen name="Fiction" component={FictionScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </RepositoryProvider>
    </SafeAreaProvider>
  );
}