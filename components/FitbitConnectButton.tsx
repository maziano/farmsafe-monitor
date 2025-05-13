import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View, ActivityIndicator } from 'react-native';
import { useMyDataHelps } from '@/providers/MyDataHelpsProvider';

export default function FitbitConnectButton() {
  const { connectFitbit, isFitbitConnected, refreshFitbitData } = useMyDataHelps();
  const [isLoading, setIsLoading] = React.useState(false);

  const handleConnect = async () => {
    setIsLoading(true);
    try {
      await connectFitbit();
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      await refreshFitbitData();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {isFitbitConnected ? (
        <View style={styles.connectedContainer}>
          <View style={styles.statusContainer}>
            <View style={styles.statusIndicator} />
            <Text style={styles.connectedText}>Fitbit Connected</Text>
          </View>
          <TouchableOpacity 
            style={styles.refreshButton}
            onPress={handleRefresh}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text style={styles.refreshButtonText}>Refresh Data</Text>
            )}
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity 
          style={styles.connectButton}
          onPress={handleConnect}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Text style={styles.connectButtonText}>Connect Fitbit</Text>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  connectedContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10b981',
    marginRight: 8,
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
