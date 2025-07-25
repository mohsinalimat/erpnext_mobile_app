import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { theme } from '@/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';

interface ChartData {
  month: string;
  value: number;
}

interface DashboardChartProps {
  data: ChartData[];
}

const DashboardChart: React.FC<DashboardChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>No sales data available.</Text>
      </View>
    );
  }

  const maxValue = Math.max(...data.map(item => item.value), 0);
  const chartWidth = Dimensions.get('window').width - 64;
  const chartHeight = 200;
  const barWidth = data.length > 0 ? chartWidth / data.length * 0.6 : 0;
  const barSpacing = data.length > 0 ? chartWidth / data.length * 0.4 : 0;

  return (
    <View style={styles.container}>
      <View style={styles.chartContainer}>
        {data.map((item, index) => {
          const barHeight = maxValue > 0 ? (item.value / maxValue) * chartHeight : 0;
          
          return (
            <View key={index} style={styles.barContainer}>
              <View style={styles.barLabelContainer}>
                <Text style={styles.barValue}>${(item.value / 1000).toFixed(1)}k</Text>
              </View>
              <LinearGradient
                colors={[theme.colors.primary[400], theme.colors.primary[600]]}
                style={[
                  styles.bar,
                  {
                    height: barHeight,
                    width: barWidth,
                    marginLeft: barSpacing / 2,
                    marginRight: barSpacing / 2,
                  },
                ]}
              >
                <View style={styles.barTop} />
              </LinearGradient>
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
  centered: {
    height: 240,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: theme.colors.error[500],
    fontFamily: 'Inter-Medium',
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
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    justifyContent: 'flex-end',
  },
  barTop: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
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
