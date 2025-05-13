import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native';
import { Clock, Sun, Wind, Droplet, Thermometer, Timer, AlertTriangle } from 'lucide-react-native';

export default function ActivityScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Daily Activity</Text>
        <Text style={styles.subtitle}>March 14, 2024</Text>
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Today's Summary</Text>
        <View style={styles.summaryStats}>
          <View style={styles.summaryStat}>
            <Clock size={24} />
            <Text style={styles.summaryValue}>6h 30m</Text>
            <Text style={styles.summaryLabel}>Work Duration</Text>
          </View>
          <View style={styles.summaryStat}>
            <Sun size={24} />
            <Text style={styles.summaryValue}>32°C</Text>
            <Text style={styles.summaryLabel}>Peak Temperature</Text>
          </View>
        </View>
      </View>

      <View style={styles.environmentCard}>
        <Text style={styles.cardTitle}>Environmental Conditions</Text>
        <View style={styles.envGrid}>
          <View style={styles.envItem}>
            <Thermometer size={24} />
            <Text style={styles.envValue}>28°C</Text>
            <Text style={styles.envLabel}>Current Temp</Text>
          </View>
          <View style={styles.envItem}>
            <Wind size={24} />
            <Text style={styles.envValue}>12 km/h</Text>
            <Text style={styles.envLabel}>Wind Speed</Text>
          </View>
          <View style={styles.envItem}>
            <Droplet size={24} />
            <Text style={styles.envValue}>65%</Text>
            <Text style={styles.envLabel}>Humidity</Text>
          </View>
          <View style={styles.envItem}>
            <Sun size={24} />
            <Text style={styles.envValue}>High</Text>
            <Text style={styles.envLabel}>UV Index</Text>
          </View>
        </View>
      </View>

      <View style={styles.workPeriods}>
        <Text style={styles.cardTitle}>Work Periods</Text>
        <View style={styles.periodItem}>
          <View style={styles.periodHeader}>
            <Timer size={20} />
            <Text style={styles.periodTime}>7:30 AM - 10:30 AM</Text>
          </View>
          <Text style={styles.periodDescription}>Field work - Crop inspection</Text>
          <View style={styles.periodStats}>
            <Text style={styles.periodStat}>Avg Temp: 26°C</Text>
            <Text style={styles.periodStat}>Rest breaks: 2</Text>
          </View>
        </View>
        <View style={styles.periodItem}>
          <View style={styles.periodHeader}>
            <Timer size={20} />
            <Text style={styles.periodTime}>2:00 PM - 5:00 PM</Text>
          </View>
          <Text style={styles.periodDescription}>Equipment maintenance</Text>
          <View style={styles.periodStats}>
            <Text style={styles.periodStat}>Avg Temp: 30°C</Text>
            <Text style={styles.periodStat}>Rest breaks: 3</Text>
          </View>
        </View>
      </View>

      <View style={styles.alertsSection}>
        <Text style={styles.cardTitle}>Health Alerts</Text>
        <View style={styles.alertItem}>
          <AlertTriangle size={20} />
          <View style={styles.alertContent}>
            <Text style={styles.alertTitle}>High Temperature Exposure</Text>
            <Text style={styles.alertTime}>2:30 PM - Take a break in shade</Text>
          </View>
        </View>
        <View style={styles.alertItem}>
          <AlertTriangle size={20} />
          <View style={styles.alertContent}>
            <Text style={styles.alertTitle}>Extended Work Period</Text>
            <Text style={styles.alertTime}>10:30 AM - Rest recommended</Text>
          </View>
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
  summaryCard: {
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
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryStat: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  environmentCard: {
    backgroundColor: '#ffffff',
    margin: 16,
    marginTop: 0,
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
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  envGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  envItem: {
    width: '45%',
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  envValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 8,
  },
  envLabel: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  workPeriods: {
    backgroundColor: '#ffffff',
    margin: 16,
    marginTop: 0,
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
  periodItem: {
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  periodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  periodTime: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginLeft: 8,
  },
  periodDescription: {
    fontSize: 14,
    color: '#1f2937',
    marginBottom: 8,
  },
  periodStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  periodStat: {
    fontSize: 12,
    color: '#64748b',
  },
  alertsSection: {
    backgroundColor: '#ffffff',
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
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
  alertItem: {
    flexDirection: 'row',
    backgroundColor: '#fee2e2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  alertContent: {
    marginLeft: 12,
    flex: 1,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#b91c1c',
  },
  alertTime: {
    fontSize: 14,
    color: '#ef4444',
    marginTop: 2,
  },
});
