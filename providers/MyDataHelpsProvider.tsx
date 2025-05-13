import React, { createContext, useState, useContext, useEffect } from 'react';
import { Alert, Platform, Linking } from 'react-native';
import { MDH_CONFIG } from '../constants/MyDataHelpsConfig';

// The MyDataHelps SDK is browser-based, so we need to use a different approach for React Native
// We'll implement our own client for the MyDataHelps API
import axios from 'axios';
import * as WebBrowser from 'expo-web-browser';
import * as SecureStore from 'expo-secure-store';

// Define constants for secure storage
const PARTICIPANT_ID_KEY = 'mdh_participant_id';
const AUTH_TOKEN_KEY = 'mdh_auth_token';
const REFRESH_TOKEN_KEY = 'mdh_refresh_token';

// Define Fitbit data types for better type safety
interface FitbitHeartRateData {
  timestamp: string;
  value: number;
  zone?: string;
}

interface FitbitDailyData {
  date: string;
  steps: number;
  caloriesBurned: number;
  activeMinutes: number;
  distanceKm: number;
  sleepMinutes?: number;
}

interface FitbitData {
  heartRate: FitbitHeartRateData[];
  daily: FitbitDailyData[];
}

// MyDataHelps API client
class MyDataHelpsClient {
  projectID: string;
  baseUrl: string;
  accessToken: string | null = null;
  participantID: string | null = null;
  
  constructor(projectID: string, environment: 'production' | 'sandbox' = 'production') {
    this.projectID = projectID;
    this.baseUrl = environment === 'production' 
      ? 'https://api.mydatahelps.org/v1'
      : 'https://api-sandbox.mydatahelps.org/v1';
  }
  
  async initialize() {
    // Load stored access token and participant ID
    try {
      this.accessToken = await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
      this.participantID = await SecureStore.getItemAsync(PARTICIPANT_ID_KEY);
      console.log('Initialized with token:', this.accessToken ? 'Present' : 'Not present');
      console.log('Initialized with participant ID:', this.participantID);
    } catch (error: unknown) {
      console.error('Error loading stored credentials:', error instanceof Error ? error.message : String(error));
    }
  }
  
  async getSession() {
    // Check if we have a valid participant session
    if (this.participantID && this.accessToken) {
      return { participantID: this.participantID };
    }
    return null;
  }
  
  // Authenticate using participant access token via Netlify Function
  async authenticate() {
    try {
      console.log('Authenticating with MyDataHelps Embeddables...');
      
      // Generate a unique user identifier (in a real app, this would be a user ID from your auth system)
      // For demo purposes, we'll generate a random ID or get one from secure storage
      let userIdentifier = await SecureStore.getItemAsync('user_identifier');
      if (!userIdentifier) {
        userIdentifier = 'user-' + Math.random().toString(36).substring(2, 10);
        await SecureStore.setItemAsync('user_identifier', userIdentifier);
      }
      
      console.log('Requesting participant token for user:', userIdentifier);
      
      // In development, we'd connect to our local Netlify dev server
      // In production, this would be your deployed Netlify function URL
      const functionUrl = __DEV__ 
        ? 'http://localhost:8888/.netlify/functions/get-participant-token'
        : 'https://your-netlify-app.netlify.app/.netlify/functions/get-participant-token';
      
      // Request a participant token from our Netlify function
      const response = await axios.post(functionUrl, {
        userIdentifier
      });
      
      if (response.data.success) {
        console.log('Received participant ID:', response.data.participantId);
        console.log('Received access token (truncated):', 
          response.data.accessToken ? response.data.accessToken.substring(0, 10) + '...' : 'null');
        
        // Store the token and participant ID
        this.accessToken = response.data.accessToken || null;
        this.participantID = response.data.participantId || null;
        
        if (this.accessToken) {
          await SecureStore.setItemAsync(AUTH_TOKEN_KEY, this.accessToken);
        }
        
        if (this.participantID) {
          await SecureStore.setItemAsync(PARTICIPANT_ID_KEY, this.participantID);
        }
        
        // Initialize MyDataHelps SDK if we had it imported
        // MyDataHelps.initialize({ accessToken: this.accessToken });
        
        return { success: true, participantID: this.participantID };
      } else {
        console.error('Failed to get participant token');
        return { success: false };
      }
    } catch (error: unknown) {
      // During development or when Netlify functions aren't running yet, 
      // fall back to simulation mode
      if (axios.isAxiosError(error) && (error.code === 'ECONNREFUSED' || error.response?.status === 404)) {
        console.log('Netlify function not available, using simulation mode');
        
        // Simulate a successful response
        const simulatedParticipantID = 'simulated-' + Math.random().toString(36).substring(2, 10);
        const simulatedAccessToken = 'simulated-token-' + Math.random().toString(36).substring(2, 15);
        
        console.log('Simulated participant ID:', simulatedParticipantID);
        console.log('Simulated access token (truncated):', simulatedAccessToken.substring(0, 10) + '...');
        
        this.accessToken = simulatedAccessToken;
        this.participantID = simulatedParticipantID;
        
        await SecureStore.setItemAsync(AUTH_TOKEN_KEY, this.accessToken);
        await SecureStore.setItemAsync(PARTICIPANT_ID_KEY, this.participantID);
        
        return { success: true, participantID: simulatedParticipantID };
      }
      
      console.error('Authentication error:', error instanceof Error ? error.message : String(error));
      return { success: false };
    }
  }
  
  async signOut() {
    // Clear saved data
    this.accessToken = null;
    this.participantID = null;
    
    // Remove stored tokens and participant ID
    await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
    await SecureStore.deleteItemAsync(PARTICIPANT_ID_KEY);
  }
  
  async callApi(endpoint: string, method = 'GET', data?: any) {
    if (!this.accessToken) {
      throw new Error('Not authenticated');
    }
    
    try {
      const response = await axios({
        method,
        url: `${this.baseUrl}${endpoint}`,
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        data: method !== 'GET' ? data : undefined,
        params: method === 'GET' ? data : undefined,
      });
      
      return response;
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        // Token expired, need to re-authenticate
        console.error('Access token expired, please log in again');
        throw new Error('Session expired, please log in again');
      }
      
      throw error;
    }
  }
  
  // In Embeddables approach, we don't directly refresh tokens
  // The server manages tokens and we would request a new one when needed
  
  async connectExternalAccount(provider: string) {
    try {
      if (!this.accessToken || !this.participantID) {
        console.error('Not authenticated');
        return { success: false };
      }

      console.log(`Initiating connection to ${provider}...`);
      
      // In the Embeddables approach, we would use the SDK to connect to external accounts
      // MyDataHelps JavaScript SDK would look like:
      // await MyDataHelps.connectExternalAccount(provider);
      
      // Since we don't have the actual SDK initialized with a real token,
      // we'll simulate the API call
      
      console.log(`Simulating connection to ${provider}...`);
      const simulatedSuccess = Math.random() > 0.3; // 70% chance of success for simulation
      
      // In a real implementation, the SDK would handle the OAuth flow for the external provider
      // and we wouldn't have to manage redirects ourselves
      
      if (simulatedSuccess) {
        console.log(`Successfully connected to ${provider} (simulated)`);
        return { success: true };
      } else {
        console.error(`Failed to connect to ${provider} (simulated)`);
        return { success: false };
      }
    } catch (error: unknown) {
      console.error(`Error connecting to ${provider}:`, error instanceof Error ? error.message : String(error));
      return { success: false };
    }
  }
  
  async getExternalAccountStatus(provider: string) {
    if (!this.accessToken || !this.participantID) {
      return 'Disconnected';
    }
    
    try {
      // In a real implementation, we would use the SDK:
      // const accounts = await MyDataHelps.getExternalAccounts();
      // const account = accounts.find(a => a.provider === provider);
      // return account ? account.status : 'Disconnected';
      
      // For simulation, we'll use our API client
      const response = await this.callApi(`/participants/${this.participantID}/externalaccounts/${provider}`);
      return response.data.status;
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        // Account not found, consider it disconnected
        return 'Disconnected';
      }
      return 'Disconnected'; // Default to disconnected on error
    }
  }
  
  async getAllExternalAccounts() {
    if (!this.accessToken || !this.participantID) {
      return [];
    }
    
    try {
      // In a real implementation with the SDK:
      // return await MyDataHelps.getExternalAccounts();
      
      // For simulation, use our API client
      const response = await this.callApi(`/participants/${this.participantID}/externalaccounts`);
      return response.data.map((account: { provider: string; status: string }) => ({
        provider: account.provider,
        status: account.status
      }));
    } catch (error: unknown) {
      console.error('Error getting external accounts:', error instanceof Error ? error.message : String(error));
      return [];
    }
  }
  
  async queryResource(resourceName: string, parameters: Record<string, string>) {
    if (!this.accessToken || !this.participantID) {
      throw new Error('Not authenticated');
    }
    
    try {
      // In a real implementation with the SDK:
      // return await MyDataHelps.queryResource(resourceName, parameters);
      
      // For simulation, use our API client
      const response = await this.callApi(`/participants/${this.participantID}/resources/${resourceName}`, 'GET', parameters);
      return response.data;
    } catch (error: unknown) {
      console.error(`Error querying resource ${resourceName}:`, error instanceof Error ? error.message : String(error));
      throw error;
    }
  }
}

type MyDataHelpsContextType = {
  isAuthenticated: boolean;
  participantID: string | null;
  connectFitbit: () => void;
  isFitbitConnected: boolean;
  fitbitData: FitbitData | null;
  refreshFitbitData: () => Promise<void>;
  logout: () => void;
};

const initialContext: MyDataHelpsContextType = {
  isAuthenticated: false,
  participantID: null,
  connectFitbit: () => {},
  isFitbitConnected: false,
  fitbitData: null,
  refreshFitbitData: async () => {},
  logout: () => {},
};

const MyDataHelpsContext = createContext<MyDataHelpsContextType>(initialContext);

export const useMyDataHelps = () => useContext(MyDataHelpsContext);

// Create a client instance
const myDataHelpsClient = new MyDataHelpsClient(
  MDH_CONFIG.projectID,
  MDH_CONFIG.environment as 'production' | 'sandbox'
);

export const MyDataHelpsProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [participantID, setParticipantID] = useState<string | null>(null);
  const [isFitbitConnected, setIsFitbitConnected] = useState(false);
  const [fitbitData, setFitbitData] = useState<FitbitData | null>(null);

  // Initialize our custom MyDataHelps client
  useEffect(() => {
    const initializeClient = async () => {
      try {
        console.log('Initializing MyDataHelps client for FarmSafe app...');
        
        // Initialize our client
        await myDataHelpsClient.initialize();
        
        console.log('MyDataHelps client initialized successfully');
        
        // Check if user is already authenticated
        const session = await myDataHelpsClient.getSession();
        if (session && session.participantID) {
          console.log('User already authenticated with ID:', session.participantID);
          setIsAuthenticated(true);
          setParticipantID(session.participantID);
          checkFitbitConnection();
        } else {
          console.log('User not authenticated');
        }
      } catch (error) {
        console.error('Error initializing MyDataHelps:', error);
        Alert.alert('Error', 'Failed to initialize health data services');
      }
    };

    initializeClient();
  }, []);

  // Connect Fitbit account
  const connectFitbit = async () => {
    try {
      if (!isAuthenticated) {
        // If not authenticated, first authenticate with MyDataHelps
        const authResult = await myDataHelpsClient.authenticate();
        if (authResult.success && authResult.participantID) {
          setIsAuthenticated(true);
          setParticipantID(authResult.participantID);
        } else {
          Alert.alert('Authentication Failed', 'Please try again');
          return;
        }
      }

      // Request authorization for Fitbit
      const fitbitAuthResult = await myDataHelpsClient.connectExternalAccount('Fitbit');
      
      if (fitbitAuthResult.success) {
        Alert.alert('Success', 'Fitbit connected successfully');
        setIsFitbitConnected(true);
        await refreshFitbitData();
      } else {
        Alert.alert('Error', 'Failed to connect Fitbit account');
      }
    } catch (error: unknown) {
      console.error('Error connecting Fitbit:', error instanceof Error ? error.message : String(error));
      Alert.alert('Error', 'Failed to connect Fitbit account');
    }
  };

  // Check if Fitbit is connected
  const checkFitbitConnection = async () => {
    try {
      const accounts = await myDataHelpsClient.getAllExternalAccounts();
      const fitbitAccount = accounts.find((account: { provider: string; status: string }) => 
        account.provider === 'Fitbit'
      );
      const isConnected = !!fitbitAccount && fitbitAccount.status === 'Connected';
      setIsFitbitConnected(isConnected);
      
      if (isConnected) {
        console.log('Fitbit account is connected');
        // Automatically refresh Fitbit data if connected
        refreshFitbitData();
      } else {
        console.log('Fitbit account is not connected');
      }
    } catch (error: unknown) {
      console.error('Error checking Fitbit connection:', error instanceof Error ? error.message : String(error));
    }
  };

  // Refresh Fitbit data
  const refreshFitbitData = async () => {
    if (!isFitbitConnected) {
      console.log('Cannot refresh data: Fitbit not connected');
      return;
    }
    
    try {
      console.log('Refreshing Fitbit data...');
      // Get the last 7 days of Fitbit data
      const today = new Date();
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(today.getDate() - 7);
      
      // Format dates for API
      const startDate = sevenDaysAgo.toISOString().split('T')[0];
      const endDate = today.toISOString().split('T')[0];
      
      console.log(`Fetching Fitbit data from ${startDate} to ${endDate}`);
      
      // Get daily data
      const dailyData = await myDataHelpsClient.queryResource('FitbitDailyData', {
        startDate,
        endDate
      }) as FitbitDailyData[];
      
      // Get heart rate data
      const heartRateData = await myDataHelpsClient.queryResource('FitbitHeartRateData', {
        startDate,
        endDate
      }) as FitbitHeartRateData[];
      
      console.log(`Retrieved ${heartRateData.length} heart rate records and ${dailyData.length} daily activity records`);
      
      // Update state with typed data
      setFitbitData({
        daily: dailyData,
        heartRate: heartRateData
      });
    } catch (error: unknown) {
      console.error('Error fetching Fitbit data:', error instanceof Error ? error.message : String(error));
      Alert.alert('Error', 'Failed to fetch Fitbit data');
    }
  };

  // Login function
  const login = async () => {
    try {
      const result = await myDataHelpsClient.authenticate();
      if (result.success && result.participantID) {
        setIsAuthenticated(true);
        setParticipantID(result.participantID);
        checkFitbitConnection();
      }
    } catch (error: unknown) {
      console.error('Error logging in:', error instanceof Error ? error.message : String(error));
      Alert.alert('Error', 'Failed to log in');
    }
  };

  // Logout from MyDataHelps
  const logout = async () => {
    try {
      await myDataHelpsClient.signOut();
      setIsAuthenticated(false);
      setParticipantID(null);
      setIsFitbitConnected(false);
      setFitbitData(null);
    } catch (error: unknown) {
      console.error('Error logging out:', error instanceof Error ? error.message : String(error));
    }
  };

  return (
    <MyDataHelpsContext.Provider
      value={{
        isAuthenticated,
        participantID,
        connectFitbit,
        isFitbitConnected,
        fitbitData,
        refreshFitbitData,
        logout
      }}
    >
      {children}
    </MyDataHelpsContext.Provider>
  );
};
