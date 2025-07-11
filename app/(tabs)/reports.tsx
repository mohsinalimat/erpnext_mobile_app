import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { theme } from '@/constants/theme';
import { ChevronRight, Calendar, Download, Search, ChartBar as BarChart3, ChartPie as PieChart, TrendingUp, Table, Filter } from 'lucide-react-native';

const reportCategories = [
  {
    title: 'Financial',
    reports: [
      'Profit and Loss Statement',
      'Balance Sheet',
      'Cash Flow Statement',
      'Accounts Receivable',
      'Accounts Payable',
    ],
  },
  {
    title: 'Sales',
    reports: [
      'Sales by Customer',
      'Sales by Item',
      'Sales by Territory',
      'Sales by Sales Person',
      'Sales Order Analysis',
    ],
  },
  {
    title: 'Inventory',
    reports: [
      'Stock Balance',
      'Stock Ledger',
      'Stock Projected Qty',
      'Item Shortage',
      'Item Price',
    ],
  },
  {
    title: 'Human Resources',
    reports: [
      'Employee Birthday',
      'Monthly Attendance Sheet',
      'Employee Leave Balance',
      'Employee Information',
      'Monthly Salary Register',
    ],
  },
];

const popularReports = [
  {
    title: 'Sales Analytics',
    description: 'Analyze your sales performance',
    icon: BarChart3,
    color: theme.colors.blue[500],
  },
  {
    title: 'Expense Breakdown',
    description: 'Visualize expense distribution',
    icon: PieChart,
    color: theme.colors.red[500],
  },
  {
    title: 'Profit Trends',
    description: 'Track profit growth over time',
    icon: TrendingUp,
    color: theme.colors.green[500],
  },
  {
    title: 'Inventory Status',
    description: 'Current inventory levels',
    icon: Table,
    color: theme.colors.purple[500],
  },
];

export default function ReportsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState(null);

  const handleRunReport = (reportName) => {
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      console.log(`Running report: ${reportName}`);
    }, 1500);
  };

  const toggleCategory = (title) => {
    setExpandedCategory(expandedCategory === title ? null : title);
  };

  const filteredCategories = searchQuery
    ? reportCategories.map(category => ({
        ...category,
        reports: category.reports.filter(report =>
          report.toLowerCase().includes(searchQuery.toLowerCase())
        ),
      })).filter(category => category.reports.length > 0)
    : reportCategories;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.searchContainer}>
        <Search size={20} color={theme.colors.gray[400]} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search reports..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={theme.colors.gray[400]}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Text style={styles.clearButton}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.filterContainer}>
        <TouchableOpacity style={styles.filterButton}>
          <Calendar size={16} color={theme.colors.text.secondary} />
          <Text style={styles.filterButtonText}>Date Range</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.filterButton}>
          <Filter size={16} color={theme.colors.text.secondary} />
          <Text style={styles.filterButtonText}>Filters</Text>
        </TouchableOpacity>
      </View>

      {!searchQuery && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Popular Reports</Text>
          <View style={styles.popularContainer}>
            {popularReports.map((report, index) => (
              <TouchableOpacity
                key={index}
                style={styles.popularCard}
                onPress={() => handleRunReport(report.title)}
              >
                <View style={[styles.popularIcon, { backgroundColor: report.color }]}>
                  <report.icon size={24} color={theme.colors.white} />
                </View>
                <Text style={styles.popularTitle}>{report.title}</Text>
                <Text style={styles.popularDescription}>{report.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>All Reports</Text>
        
        {filteredCategories.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No reports found matching "{searchQuery}"</Text>
          </View>
        ) : (
          filteredCategories.map((category, index) => (
            <View key={index} style={styles.categoryContainer}>
              <TouchableOpacity
                style={styles.categoryHeader}
                onPress={() => toggleCategory(category.title)}
              >
                <Text style={styles.categoryTitle}>{category.title}</Text>
                <ChevronRight
                  size={20}
                  color={theme.colors.text.secondary}
                  style={{
                    transform: [
                      { rotate: expandedCategory === category.title ? '90deg' : '0deg' },
                    ],
                  }}
                />
              </TouchableOpacity>
              
              {(expandedCategory === category.title || searchQuery) && (
                <View style={styles.reportsList}>
                  {category.reports.map((report, reportIndex) => (
                    <TouchableOpacity
                      key={reportIndex}
                      style={styles.reportItem}
                      onPress={() => handleRunReport(report)}
                    >
                      <Text style={styles.reportTitle}>{report}</Text>
                      <View style={styles.reportActions}>
                        {loading ? (
                          <ActivityIndicator size="small" color={theme.colors.primary[500]} />
                        ) : (
                          <>
                            <TouchableOpacity style={styles.reportActionButton}>
                              <Download size={18} color={theme.colors.text.secondary} />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.runButton}>
                              <Text style={styles.runButtonText}>Run</Text>
                            </TouchableOpacity>
                          </>
                        )}
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.colors.gray[200],
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontFamily: 'Inter-Regular',
    color: theme.colors.text.primary,
  },
  clearButton: {
    fontFamily: 'Inter-Medium',
    color: theme.colors.primary[500],
    paddingHorizontal: 8,
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 12,
    borderWidth: 1,
    borderColor: theme.colors.gray[200],
  },
  filterButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginLeft: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: theme.colors.text.primary,
    marginBottom: 16,
  },
  popularContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  popularCard: {
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    width: '48%',
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  popularIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  popularTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  popularDescription: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: theme.colors.text.secondary,
  },
  categoryContainer: {
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.gray[200],
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  categoryTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: theme.colors.text.primary,
  },
  reportsList: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray[200],
  },
  reportItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[100],
  },
  reportTitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.text.primary,
  },
  reportActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reportActionButton: {
    padding: 8,
    marginRight: 8,
  },
  runButton: {
    backgroundColor: theme.colors.primary[500],
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  runButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: theme.colors.white,
  },
  emptyState: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.gray[200],
  },
  emptyStateText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
});