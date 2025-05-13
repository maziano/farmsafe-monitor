import React, { useState, useEffect } from 'react';
import { Button, Text, ActivityIndicator, View, StyleSheet, Alert } from 'react-native';
import * as SecureStore from 'expo-secure-store';

// Import MyDataHelps with type assertion to accommodate any missing types
const MyDataHelps = require('@careevolution/mydatahelps-js') as any;

interface FitbitConnectButtonProps {
  style?: object;
}

export default function FitbitConnectButton({ style }: FitbitConnectButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isFitbitConnected, setIsFitbitConnected] = useState(false);
  
  useEffect(() => {
    // Check if Fitbit is connected when the component mounts
    checkFitbitConnection();
  }, []);
  
  const checkFitbitConnection = async () => {
    try {
      // Get all external accounts
      const accounts = await MyDataHelps.getExternalAccounts();
      
      // Check if Fitbit is in the list and connected
      const fitbitAccount = accounts.find((account: any) => 
        account.provider.toString() === 'Fitbit'
      );
      
      // Check the connection status
      const isConnected = fitbitAccount && 
        (fitbitAccount.status?.toString() === 'Connected');
        
      setIsFitbitConnected(!!isConnected);
      console.log('Fitbit connection status:', isConnected ? 'Connected' : 'Not connected');
    } catch (error: unknown) {
      console.error('Error checking Fitbit connection:', error instanceof Error ? error.message : String(error));
      setIsFitbitConnected(false);
    }
  };

  const handleConnect = async () => {
    setIsLoading(true);
    try {
      // Using the official SDK to connect to Fitbit
      await MyDataHelps.connectExternalAccount('Fitbit');
      await checkFitbitConnection();
      if (isFitbitConnected) {
        Alert.alert('Success', 'Fitbit connected successfully');
      }
    } catch (error: unknown) {
      console.error('Error connecting to Fitbit:', error instanceof Error ? error.message : String(error));
      Alert.alert('Error', `Failed to connect: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      // In a real implementation, you would query Fitbit data here
      // This is just a placeholder for now
      const today = new Date();
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(today.getDate() - 7);
      
      // Format dates for the API
      const startDate = sevenDaysAgo.toISOString().split('T')[0];
      const endDate = today.toISOString().split('T')[0];
      
      // Using properly typed query parameters
      const params = {
        startDate: startDate,
        endDate: endDate
      };
      
      // Query Fitbit data
      const fitbitData = await MyDataHelps.queryResource('FitbitDailyData', params);
      
      console.log('Retrieved Fitbit data:', fitbitData);
      Alert.alert('Success', 'Fitbit data refreshed');
    } catch (error: unknown) {
      console.error('Error refreshing Fitbit data:', error instanceof Error ? error.message : String(error));
      Alert.alert('Error', `Failed to refresh data: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={[styles.container, style]}>
      {isLoading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : isFitbitConnected ? (
        <View>
          <Text style={styles.statusText}>Fitbit Connected</Text>
          <Button title="Refresh Data" onPress={handleRefresh} />
        </View>
      ) : (
        <View>
          <Text style={styles.statusText}>Fitbit Not Connected</Text>
          <Button title="Connect Fitbit" onPress={handleConnect} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  statusText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333333',
    textAlign: 'center',
  },
  connectedText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
  },
  connectButton: {
    backgroundColor: '#ef4444',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  connectButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  refreshButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  refreshButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
});
