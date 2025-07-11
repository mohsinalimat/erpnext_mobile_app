import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { theme } from '@/constants/theme';
import { Search as SearchIcon, X, Filter, Tag, Clock } from 'lucide-react-native';
import { searchERPNextData } from '@/services/api';

const docTypes = [
  'All',
  'Sales Order',
  'Customer',
  'Item',
  'Invoice',
  'Quotation',
  'Task',
  'Project',
  'Employee',
];

// Sample recent searches
const recentSearches = [
  'SINV-00001',
  'Acme Inc.',
  'John Smith',
  'Project Alpha',
  'SO-00123',
];

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDocType, setActiveDocType] = useState('All');
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [showRecents, setShowRecents] = useState(true);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setSearching(true);
    setShowRecents(false);
    
    try {
      const results = await searchERPNextData(searchQuery, activeDocType);
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowRecents(true);
  };

  const selectDocType = (docType) => {
    setActiveDocType(docType);
    if (searchQuery.trim()) {
      handleSearch();
    }
  };

  const selectRecentSearch = (query) => {
    setSearchQuery(query);
    setSearching(true);
    setShowRecents(false);
    
    // Simulate API call
    setTimeout(() => {
      setSearching(false);
      // Sample results for demo
      setSearchResults([
        { id: '1', title: 'SINV-00001', subtitle: 'Invoice for Acme Inc.', type: 'Invoice' },
        { id: '2', title: 'Acme Inc.', subtitle: 'Customer', type: 'Customer' },
      ]);
    }, 500);
  };

  const renderResultItem = ({ item }) => (
    <TouchableOpacity style={styles.resultItem}>
      <View style={styles.resultContent}>
        <Text style={styles.resultTitle}>{item.title}</Text>
        <Text style={styles.resultSubtitle}>{item.subtitle}</Text>
      </View>
      <View style={styles.resultTypeContainer}>
        <Text style={styles.resultTypeText}>{item.type}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <SearchIcon size={20} color={theme.colors.gray[400]} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search ERPNext..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
            placeholderTextColor={theme.colors.gray[400]}
            autoFocus
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={clearSearch}>
              <X size={20} color={theme.colors.gray[400]} />
            </TouchableOpacity>
          )}
        </View>
        
        <TouchableOpacity 
          style={styles.searchButton} 
          onPress={handleSearch}
          disabled={!searchQuery.trim()}
        >
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filtersContainer}>
        <FlatList
          data={docTypes}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterChip,
                activeDocType === item && styles.activeFilterChip,
              ]}
              onPress={() => selectDocType(item)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  activeDocType === item && styles.activeFilterChipText,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.filtersList}
        />
      </View>

      {searching ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary[500]} />
          <Text style={styles.loadingText}>Searching...</Text>
        </View>
      ) : (
        <>
          {showRecents ? (
            <View style={styles.recentsContainer}>
              <View style={styles.recentsHeader}>
                <View style={styles.recentsHeaderLeft}>
                  <Clock size={16} color={theme.colors.gray[500]} />
                  <Text style={styles.recentsTitle}>Recent Searches</Text>
                </View>
                <TouchableOpacity>
                  <Text style={styles.clearRecentsText}>Clear</Text>
                </TouchableOpacity>
              </View>
              
              {recentSearches.map((search, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.recentItem}
                  onPress={() => selectRecentSearch(search)}
                >
                  <Clock size={16} color={theme.colors.gray[400]} />
                  <Text style={styles.recentItemText}>{search}</Text>
                </TouchableOpacity>
              ))}
              
              <View style={styles.searchTipsContainer}>
                <Text style={styles.searchTipsTitle}>Search Tips</Text>
                <Text style={styles.searchTipText}>
                  • Use quotes for exact matches: "Product X"
                </Text>
                <Text style={styles.searchTipText}>
                  • Include document type: SO-00123
                </Text>
                <Text style={styles.searchTipText}>
                  • Search by ID or name: CUST-001 or John Smith
                </Text>
              </View>
            </View>
          ) : (
            <>
              {searchResults.length > 0 ? (
                <FlatList
                  data={searchResults}
                  renderItem={renderResultItem}
                  keyExtractor={(item) => item.id}
                  contentContainerStyle={styles.resultsList}
                  ListHeaderComponent={
                    <View style={styles.resultsHeader}>
                      <Text style={styles.resultsCount}>
                        {searchResults.length} results found
                      </Text>
                      <TouchableOpacity style={styles.sortButton}>
                        <Filter size={16} color={theme.colors.text.secondary} />
                        <Text style={styles.sortButtonText}>Sort</Text>
                      </TouchableOpacity>
                    </View>
                  }
                />
              ) : (
                <View style={styles.noResultsContainer}>
                  <SearchIcon size={48} color={theme.colors.gray[300]} />
                  <Text style={styles.noResultsTitle}>No results found</Text>
                  <Text style={styles.noResultsText}>
                    Try changing your search terms or filters
                  </Text>
                  
                  <View style={styles.suggestionsContainer}>
                    <Text style={styles.suggestionsTitle}>Suggestions:</Text>
                    <Text style={styles.suggestionText}>• Check for typos</Text>
                    <Text style={styles.suggestionText}>• Use fewer keywords</Text>
                    <Text style={styles.suggestionText}>• Try a different document type</Text>
                  </View>
                </View>
              )}
            </>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: theme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[200],
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.gray[100],
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
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
  searchButton: {
    marginLeft: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: theme.colors.primary[500],
    borderRadius: 8,
  },
  searchButtonText: {
    fontFamily: 'Inter-Medium',
    color: theme.colors.white,
    fontSize: 14,
  },
  filtersContainer: {
    backgroundColor: theme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[200],
    paddingVertical: 8,
  },
  filtersList: {
    paddingHorizontal: 16,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: theme.colors.gray[100],
    borderRadius: 16,
    marginRight: 8,
  },
  activeFilterChip: {
    backgroundColor: theme.colors.primary[500],
  },
  filterChipText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  activeFilterChipText: {
    color: theme.colors.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: theme.colors.text.secondary,
  },
  recentsContainer: {
    flex: 1,
    padding: 16,
  },
  recentsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  recentsHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recentsTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: theme.colors.text.primary,
    marginLeft: 8,
  },
  clearRecentsText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: theme.colors.primary[500],
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[100],
  },
  recentItemText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: theme.colors.text.primary,
    marginLeft: 12,
  },
  searchTipsContainer: {
    marginTop: 24,
    padding: 16,
    backgroundColor: theme.colors.gray[50],
    borderRadius: 8,
  },
  searchTipsTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: theme.colors.text.primary,
    marginBottom: 8,
  },
  searchTipText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginBottom: 6,
  },
  resultsList: {
    padding: 16,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  resultsCount: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.gray[200],
  },
  sortButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginLeft: 8,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.white,
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.gray[200],
  },
  resultContent: {
    flex: 1,
  },
  resultTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  resultSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  resultTypeContainer: {
    backgroundColor: theme.colors.gray[100],
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  resultTypeText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: theme.colors.text.secondary,
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  noResultsTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: theme.colors.text.primary,
    marginTop: 16,
    marginBottom: 8,
  },
  noResultsText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  suggestionsContainer: {
    alignSelf: 'stretch',
    backgroundColor: theme.colors.gray[50],
    padding: 16,
    borderRadius: 8,
  },
  suggestionsTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: theme.colors.text.primary,
    marginBottom: 8,
  },
  suggestionText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginBottom: 6,
  },
});