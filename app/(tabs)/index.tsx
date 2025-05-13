import { View, Text, StyleSheet, ScrollView, Image, Platform } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
// Properly type the icons to avoid TypeScript errors
import { Heart, Thermometer, Clock, Battery } from 'lucide-react-native';
import type { LucideProps } from 'lucide-react-native';
import FitbitConnectButton from '@/components/FitbitConnectButton';
import { useMyDataHelps } from '@/providers/MyDataHelpsProvider';

export default function Dashboard() {
  const { fitbitData, isFitbitConnected } = useMyDataHelps();
  
  // Use Fitbit data if available, otherwise use sample data
  const heartRateData = {
    labels: ['9AM', '10AM', '11AM', '12PM', '1PM', '2PM'],
    datasets: [
      {
        data: fitbitData?.heartRate?.slice(0, 6).map(hr => hr.value) || [75, 78, 82, 85, 80, 77],
      },
    ],
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Image
          source={{ uri: 'https://images.pexels.com/photos/2382665/pexels-photo-2382665.jpeg' }}
          style={styles.headerImage}
        />
        <View style={styles.headerOverlay}>
          <Text style={styles.greeting}>Good morning, John</Text>
          <Text style={styles.date}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</Text>
        </View>
      </View>
      
      {/* Fitbit Connect Button */}
      <FitbitConnectButton />

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Heart size={24} stroke="#ef4444" />
          <Text style={styles.statValue}>75 BPM</Text>
          <Text style={styles.statLabel}>Heart Rate</Text>
        </View>
        <View style={styles.statCard}>
          <Thermometer size={24} stroke="#3b82f6" />
          <Text style={styles.statValue}>98.6°F</Text>
          <Text style={styles.statLabel}>Temperature</Text>
        </View>
        <View style={styles.statCard}>
          <Clock size={24} stroke="#10b981" />
          <Text style={styles.statValue}>6h 30m</Text>
          <Text style={styles.statLabel}>Work Time</Text>
        </View>
        <View style={styles.statCard}>
          <Battery size={24} stroke="#f59e0b" />
          <Text style={styles.statValue}>85%</Text>
          <Text style={styles.statLabel}>Device Battery</Text>
        </View>
      </View>

      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Heart Rate Trend</Text>
        <LineChart
          data={heartRateData}
          width={350}
          height={200}
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#ffffff',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
            style: {
              borderRadius: 16,
            },
          }}
          bezier
          style={Platform.OS === 'web' ? {...styles.chart, alignSelf: 'center'} : styles.chart}
        />
      </View>

      <View style={styles.alertContainer}>
        <Text style={styles.alertTitle}>Recent Alerts</Text>
        <View style={styles.alert}>
          <Text style={styles.alertText}>High heart rate detected during field work</Text>
          <Text style={styles.alertTime}>2 hours ago</Text>
        </View>
        <View style={styles.alert}>
          <Text style={styles.alertText}>Extended exposure to high temperature</Text>
          <Text style={styles.alertTime}>4 hours ago</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    height: 200,
    position: 'relative',
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  headerOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  greeting: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  date: {
    color: '#ffffff',
    fontSize: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 16,
  },
  statCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    width: '45%',
    alignItems: 'center',
    ...(Platform.OS === 'ios' ? {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    } : Platform.OS === 'android' ? {
      elevation: 3,
    } : {
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    }),
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 8,
    color: '#1f2937',
  },
  statLabel: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  chartContainer: {
    backgroundColor: '#ffffff',
    margin: 16,
    padding: 16,
    borderRadius: 16,
    ...(Platform.OS === 'ios' ? {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    } : Platform.OS === 'android' ? {
      elevation: 3,
    } : {
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    }),
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#1f2937',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  alertContainer: {
    margin: 16,
    marginTop: 0,
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#1f2937',
  },
  alert: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    ...(Platform.OS === 'ios' ? {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    } : Platform.OS === 'android' ? {
      elevation: 3,
    } : {
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    }),
  },
  alertText: {
    fontSize: 16,
    color: '#1f2937',
  },
  alertTime: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
});
