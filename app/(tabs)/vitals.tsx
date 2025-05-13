import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Heart, Thermometer, Activity, Droplet } from 'lucide-react-native';

export default function VitalsScreen() {
  const heartRateData = {
    labels: ['6AM', '9AM', '12PM', '3PM', '6PM', '9PM'],
    datasets: [{ data: [72, 75, 85, 82, 78, 74] }],
  };

  const temperatureData = {
    labels: ['6AM', '9AM', '12PM', '3PM', '6PM', '9PM'],
    datasets: [{ data: [98.1, 98.4, 99.1, 99.3, 98.8, 98.4] }],
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Vital Signs</Text>
        <Text style={styles.subtitle}>Today's Health Metrics</Text>
      </View>

      <View style={styles.vitalCard}>
        <View style={styles.vitalHeader}>
          <Heart size={24} />
          <Text style={styles.vitalTitle}>Heart Rate</Text>
        </View>
        <Text style={styles.currentValue}>75 BPM</Text>
        <LineChart
          data={heartRateData}
          width={350}
          height={180}
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#ffffff',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(239, 68, 68, ${opacity})`,
            style: { borderRadius: 16 },
          }}
          bezier
          style={Platform.OS === 'web' ? {...styles.chart, alignSelf: 'center'} : styles.chart}
        />
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Average</Text>
            <Text style={styles.statValue}>77 BPM</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Peak</Text>
            <Text style={styles.statValue}>85 BPM</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Resting</Text>
            <Text style={styles.statValue}>72 BPM</Text>
          </View>
        </View>
      </View>

      <View style={styles.vitalCard}>
        <View style={styles.vitalHeader}>
          <Thermometer size={24} />
          <Text style={styles.vitalTitle}>Body Temperature</Text>
        </View>
        <Text style={styles.currentValue}>98.6°F</Text>
        <LineChart
          data={temperatureData}
          width={350}
          height={180}
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#ffffff',
            decimalPlaces: 1,
            color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
            style: { borderRadius: 16 },
          }}
          bezier
          style={Platform.OS === 'web' ? {...styles.chart, alignSelf: 'center'} : styles.chart}
        />
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Average</Text>
            <Text style={styles.statValue}>98.7°F</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Peak</Text>
            <Text style={styles.statValue}>99.3°F</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Lowest</Text>
            <Text style={styles.statValue}>98.1°F</Text>
          </View>
        </View>
      </View>

      <View style={styles.quickStats}>
        <View style={styles.quickStat}>
          <Activity size={24} />
          <Text style={styles.quickStatValue}>Normal</Text>
          <Text style={styles.quickStatLabel}>Overall Status</Text>
        </View>
        <View style={styles.quickStat}>
          <Droplet size={24} />
          <Text style={styles.quickStatValue}>Good</Text>
          <Text style={styles.quickStatLabel}>Hydration</Text>
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
    padding: 20,
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 4,
  },
  vitalCard: {
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
  vitalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  vitalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 8,
    color: '#1f2937',
  },
  currentValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  stat: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 4,
  },
  quickStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    marginBottom: 16,
  },
  quickStat: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    width: '48%',
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
  quickStatValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 8,
  },
  quickStatLabel: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
});
