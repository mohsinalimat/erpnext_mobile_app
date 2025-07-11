import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { theme } from '@/constants/theme';

const DashboardChart: React.FC = () => {
  // Mock data for the chart
  const data = [
    { month: 'Jan', value: 12000 },
    { month: 'Feb', value: 19000 },
    { month: 'Mar', value: 15000 },
    { month: 'Apr', value: 22000 },
    { month: 'May', value: 18000 },
    { month: 'Jun', value: 25000 },
  ];

  // Get the maximum value for scaling
  const maxValue = Math.max(...data.map(item => item.value));
  
  // Chart dimensions
  const chartWidth = Dimensions.get('window').width - 64; // Full width minus padding
  const chartHeight = 200;
  const barWidth = chartWidth / data.length * 0.6;
  const barSpacing = chartWidth / data.length * 0.4;

  return (
    <View style={styles.container}>
      <View style={styles.chartContainer}>
        {data.map((item, index) => {
          // Calculate bar height based on value
          const barHeight = (item.value / maxValue) * chartHeight;
          
          return (
            <View key={index} style={styles.barContainer}>
              <View style={styles.barLabelContainer}>
                <Text style={styles.barValue}>${(item.value / 1000).toFixed(1)}k</Text>
              </View>
              <View 
                style={[
                  styles.bar, 
                  { 
                    height: barHeight, 
                    width: barWidth,
                    marginLeft: barSpacing / 2,
                    marginRight: barSpacing / 2,
                    backgroundColor: theme.colors.primary[500],
                  }
                ]} 
              />
              <Text style={styles.monthLabel}>{item.month}</Text>
            </View>
          );
        })}
      </View>
      
      <View style={styles.chartFooter}>
        <View style={styles.legend}>
          <View style={[styles.legendIndicator, { backgroundColor: theme.colors.primary[500] }]} />
          <Text style={styles.legendText}>Sales</Text>
        </View>
        <View style={styles.chartActions}>
          <Text style={styles.chartActionText}>Monthly</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  chartContainer: {
    height: 240,
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingTop: 20,
  },
  barContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: '100%',
  },
  barLabelContainer: {
    position: 'absolute',
    top: 0,
    width: '100%',
    alignItems: 'center',
  },
  barValue: {
    fontSize: 10,
    fontFamily: 'Inter-Medium',
    color: theme.colors.text.secondary,
  },
  bar: {
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  monthLabel: {
    marginTop: 8,
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: theme.colors.text.secondary,
  },
  chartFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray[100],
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.text.secondary,
  },
  chartActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chartActionText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: theme.colors.primary[500],
  },
});

export default DashboardChart;