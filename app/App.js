import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { UserProvider } from './context/UserContext';
import { ThemeProvider } from './context/ThemeContext';
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import HomeScreen from './screens/HomeScreen';
import QuizScreen from './screens/QuizScreen';
import ChatbotScreen from './screens/ChatbotScreen';
import LeaderboardScreen from './screens/LeaderboardScreen';
import AlertsScreen from './screens/AlertsScreen';
import TasksScreen from './screens/TasksScreen';
import KitBuilderScreen from './screens/KitBuilderScreen';
import FloodRunnerScreen from './screens/FloodRunnerScreen';
import StoryScreen from './screens/StoryScreen';
import SettingsScreen from './screens/SettingsScreen';
import ResourceHubScreen from './screens/ResourceHubScreen';
import AudioPlayerScreen from './screens/AudioPlayerScreen';
import LearningPathScreen from './screens/LearningPathScreen';
import LessonScreen from './screens/LessonScreen';
import FirstAidScreen from './screens/FirstAidScreen';
import FirstAidGuideScreen from './screens/FirstAidGuideScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <UserProvider>
      <ThemeProvider>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Login">
            <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Log In' }} />
            <Stack.Screen name="Signup" component={SignupScreen} options={{ title: 'Sign Up' }} />
            <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Home' }} />
            <Stack.Screen name="Quiz" component={QuizScreen} options={{ title: 'Quiz' }} />
            <Stack.Screen name="Chatbot" component={ChatbotScreen} options={{ title: 'Ask DisasterReady' }} />
            <Stack.Screen name="Leaderboard" component={LeaderboardScreen} options={{ title: 'Leaderboard' }} />
            <Stack.Screen name="Alerts" component={AlertsScreen} options={{ title: 'Alerts' }} />
            <Stack.Screen name="Tasks" component={TasksScreen} options={{ title: 'Daily Tasks' }} />
            <Stack.Screen name="KitBuilder" component={KitBuilderScreen} options={{ title: 'Rescue Missions' }} />
            <Stack.Screen name="FloodRunner" component={FloodRunnerScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Story" component={StoryScreen} options={{ title: 'Story Mode' }} />
            <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
            <Stack.Screen name="Resources" component={ResourceHubScreen} options={{ title: 'Resource Hub' }} />
            <Stack.Screen name="AudioPlayer" component={AudioPlayerScreen} options={{ title: 'Listen & Learn' }} />
            <Stack.Screen name="LearningPath" component={LearningPathScreen} options={{ title: 'Learning Path' }} />
            <Stack.Screen name="Lesson" component={LessonScreen} options={{ title: 'Lesson' }} />
            <Stack.Screen name="FirstAid" component={FirstAidScreen} options={{ title: 'First Aid' }} />
            <Stack.Screen name="FirstAidGuide" component={FirstAidGuideScreen} options={{ title: 'Guide' }} />
          </Stack.Navigator>
        </NavigationContainer>
      </ThemeProvider>
    </UserProvider>
  );
}