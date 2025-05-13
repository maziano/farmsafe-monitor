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
  authToken: string | null = null;
  refreshToken: string | null = null;
  
  constructor(projectID: string, environment: 'production' | 'sandbox' = 'production') {
    this.projectID = projectID;
    this.baseUrl = environment === 'production' 
      ? 'https://api.mydatahelps.org'
      : 'https://api-sandbox.mydatahelps.org';
  }
  
  async initialize() {
    // Load stored tokens
    try {
      this.authToken = await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
      this.refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
    } catch (error: unknown) {
      console.error('Error loading stored tokens:', error instanceof Error ? error.message : String(error));
    }
  }
  
  async getSession() {
    const participantID = await SecureStore.getItemAsync(PARTICIPANT_ID_KEY);
    if (participantID && this.authToken) {
      return { participantID };
    }
    return null;
  }
  
  async authenticate() {
    try {
      // Generate a random state value for security
      const state = Math.random().toString(36).substring(2, 15);
      
      // Build the authorization URL
      const authUrl = `${MDH_CONFIG.oauth.authUrl}?` +
        `client_id=${encodeURIComponent(MDH_CONFIG.oauth.accountName)}` +
        `&redirect_uri=${encodeURIComponent(MDH_CONFIG.oauth.redirectUri)}` +
        `&response_type=code` +
        `&state=${encodeURIComponent(state)}`;
      
      // Open the authentication page in a browser
      const result = await WebBrowser.openAuthSessionAsync(authUrl, MDH_CONFIG.oauth.redirectUri);
      
      if (result.type === 'success' && result.url) {
        // Parse the URL to get the authorization code
        const url = new URL(result.url);
        const code = url.searchParams.get('code');
        const returnedState = url.searchParams.get('state');
        
        // Verify state to prevent CSRF attacks
        if (state !== returnedState) {
          throw new Error('State mismatch in authentication response');
        }
        
        if (code) {
          // Exchange the code for tokens
          const tokenResponse = await axios.post(MDH_CONFIG.oauth.tokenUrl, {
            grant_type: 'authorization_code',
            code,
            client_id: MDH_CONFIG.oauth.accountName,
            redirect_uri: MDH_CONFIG.oauth.redirectUri,
          }, {
            headers: {
              'Content-Type': 'application/json',
            }
          });
          
          // Store the tokens
          this.authToken = tokenResponse.data.access_token;
          this.refreshToken = tokenResponse.data.refresh_token;
          
          await SecureStore.setItemAsync(AUTH_TOKEN_KEY, this.authToken);
          await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, this.refreshToken);
          
          // Get participant ID
          const userResponse = await this.callApi('/v1/participants/me');
          const participantID = userResponse.data.id;
          
          await SecureStore.setItemAsync(PARTICIPANT_ID_KEY, participantID);
          
          return { success: true, participantID };
        }
      }
      
      return { success: false };
    } catch (error: unknown) {
      console.error('Authentication error:', error instanceof Error ? error.message : String(error));
      return { success: false };
    }
  }
  
  async signOut() {
    this.authToken = null;
    this.refreshToken = null;
    
    // Remove stored tokens and participant ID
    await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    await SecureStore.deleteItemAsync(PARTICIPANT_ID_KEY);
  }
  
  async callApi(endpoint: string, method = 'GET', data?: any) {
    if (!this.authToken) {
      throw new Error('Not authenticated');
    }
    
    try {
      const response = await axios({
        method,
        url: `${this.baseUrl}${endpoint}`,
        headers: {
          'Authorization': `Bearer ${this.authToken}`,
          'Content-Type': 'application/json',
        },
        data: method !== 'GET' ? data : undefined,
        params: method === 'GET' ? data : undefined,
      });
      
      return response;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        // Token expired, try to refresh
        await this.refreshAuthToken();
        
        // Retry the request with the new token
        const response = await axios({
          method,
          url: `${this.baseUrl}${endpoint}`,
          headers: {
            'Authorization': `Bearer ${this.authToken}`,
            'Content-Type': 'application/json',
          },
          data: method !== 'GET' ? data : undefined,
          params: method === 'GET' ? data : undefined,
        });
        
        return response;
      }
      
      throw error;
    }
  }
  
  async refreshAuthToken() {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }
    
    try {
      const response = await axios.post(MDH_CONFIG.oauth.tokenUrl, {
        grant_type: 'refresh_token',
        refresh_token: this.refreshToken,
        client_id: MDH_CONFIG.oauth.accountName,
      }, {
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      this.authToken = response.data.access_token;
      this.refreshToken = response.data.refresh_token;
      
      await SecureStore.setItemAsync(AUTH_TOKEN_KEY, this.authToken);
      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, this.refreshToken);
    } catch (error) {
      // If refresh fails, clear tokens and force re-authentication
      await this.signOut();
      throw new Error('Failed to refresh authentication token');
    }
  }
  
  async connectExternalAccount(provider: string) {
    try {
      // Build the authorization URL for the external provider
      const authUrl = `${this.baseUrl}/v1/participants/me/externalaccounts/${provider}/authorize`;
      
      // Make API call to get authorization URL
      const response = await this.callApi(
        `/v1/participants/me/externalaccounts/${provider}/authorize`, 
        'POST'
      );
      
      if (response.data && response.data.authorizationUrl) {
        // Open the authorization URL in a browser
        const result = await WebBrowser.openAuthSessionAsync(
          response.data.authorizationUrl, 
          MDH_CONFIG.oauth.redirectUri
        );
        
        if (result.type === 'success') {
          // Check if connection was successful
          const accountStatus = await this.getExternalAccountStatus(provider);
          return { success: accountStatus === 'Connected' };
        }
      }
      
      return { success: false };
    } catch (error: unknown) {
      console.error(`Error connecting to ${provider}:`, error instanceof Error ? error.message : String(error));
      return { success: false };
    }
  }
  
  async getExternalAccountStatus(provider: string) {
    try {
      const response = await this.callApi(`/v1/participants/me/externalaccounts/${provider}`);
      return response.data.status;
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        // Account not found, consider it disconnected
        return 'Disconnected';
      }
      throw error;
    }
  }
  
  async getAllExternalAccounts() {
    try {
      const response = await this.callApi('/v1/participants/me/externalaccounts');
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
    try {
      const response = await this.callApi(`/v1/participants/me/resources/${resourceName}`, 'GET', parameters);
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
