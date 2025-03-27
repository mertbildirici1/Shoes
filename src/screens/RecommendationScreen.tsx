import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { PostgrestError } from '@supabase/supabase-js';
import { Ionicons } from '@expo/vector-icons';

interface ShoeCatalog {
  id: string;
  brand: string;
  model: string;
  category: string;
}

interface Shoe {
  id: string;
  brand: string;
  model: string;
  size: string;
  fit: 'too small' | 'perfect' | 'too large';
}

export const RecommendationScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [shoeCatalog, setShoeCatalog] = useState<ShoeCatalog[]>([]);
  const [selectedShoe, setSelectedShoe] = useState<ShoeCatalog | null>(null);
  const [userShoes, setUserShoes] = useState<Shoe[]>([]);
  const [recommendation, setRecommendation] = useState<{ size: string; confidence: number } | null>(null);
  const { user } = useAuth();
  const navigation = useNavigation();

  useEffect(() => {
    fetchShoeCatalog();
    if (user) {
      fetchUserShoes();
    }
  }, [user]);

  const fetchShoeCatalog = async () => {
    try {
      const { data, error } = await supabase
        .from('shoe_catalog')
        .select('*')
        .order('brand');

      if (error) throw error;
      setShoeCatalog(data || []);
    } catch (error) {
      Alert.alert('Error', (error as PostgrestError).message);
    }
  };

  const fetchUserShoes = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_shoes')
        .select(`
          shoe_id,
          shoes (
            id,
            brand,
            model,
            size,
            fit
          )
        `)
        .eq('user_id', user.id);

      if (error) throw error;
      
      const transformedData = data.map(item => ({
        id: item.shoes.id,
        brand: item.shoes.brand,
        model: item.shoes.model,
        size: item.shoes.size,
        fit: item.shoes.fit,
      }));
      
      setUserShoes(transformedData);
    } catch (error) {
      Alert.alert('Error', (error as PostgrestError).message);
    }
  };

  const getRecommendation = () => {
    if (!selectedShoe) {
      Alert.alert('Error', 'Please select a shoe first');
      return;
    }

    // Find exact matches
    const exactMatches = userShoes.filter(
      shoe => shoe.brand.toLowerCase() === selectedShoe.brand.toLowerCase() &&
      shoe.model.toLowerCase() === selectedShoe.model.toLowerCase()
    );

    if (exactMatches.length > 0) {
      const perfectFit = exactMatches.find(shoe => shoe.fit === 'perfect');
      if (perfectFit) {
        setRecommendation({
          size: perfectFit.size,
          confidence: 0.9,
        });
        return;
      }
    }

    // Find brand matches
    const brandMatches = userShoes.filter(
      shoe => shoe.brand.toLowerCase() === selectedShoe.brand.toLowerCase()
    );

    if (brandMatches.length > 0) {
      const perfectFits = brandMatches.filter(shoe => shoe.fit === 'perfect');
      if (perfectFits.length > 0) {
        const avgSize = perfectFits.reduce((acc, shoe) => acc + parseFloat(shoe.size), 0) / perfectFits.length;
        setRecommendation({
          size: avgSize.toFixed(1),
          confidence: 0.7,
        });
        return;
      }
    }

    setRecommendation({
      size: 'Unknown',
      confidence: 0,
    });
  };

  const filteredShoes = shoeCatalog.filter(shoe => 
    shoe.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
    shoe.model.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Get Size Recommendation</Text>
      
      <TextInput
        style={styles.searchInput}
        placeholder="Search shoes..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      <FlatList
        data={filteredShoes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.shoeItem,
              selectedShoe?.id === item.id && styles.selectedShoe
            ]}
            onPress={() => setSelectedShoe(item)}
          >
            <Text style={styles.shoeBrand}>{item.brand}</Text>
            <Text style={styles.shoeModel}>{item.model}</Text>
            <Text style={styles.shoeCategory}>{item.category}</Text>
          </TouchableOpacity>
        )}
      />

      {selectedShoe && (
        <View style={styles.recommendationContainer}>
          <View style={styles.recommendationHeader}>
            <Text style={styles.selectedShoeTitle}>Selected Shoe:</Text>
            <TouchableOpacity 
              onPress={() => {
                setSelectedShoe(null);
                setRecommendation(null);
              }}
              style={styles.closeButton}
            >
              <Ionicons name="close-circle" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          <Text style={styles.selectedShoeText}>{selectedShoe.brand} {selectedShoe.model}</Text>
          
          <TouchableOpacity style={styles.button} onPress={getRecommendation}>
            <Text style={styles.buttonText}>Get Size Recommendation</Text>
          </TouchableOpacity>

          {recommendation && (
            <View style={styles.resultContainer}>
              <Text style={styles.resultTitle}>Recommended Size</Text>
              <Text style={styles.resultSize}>{recommendation.size}</Text>
              <Text style={styles.confidenceText}>
                Confidence: {Math.round(recommendation.confidence * 100)}%
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  searchInput: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 5,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  shoeItem: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
  },
  selectedShoe: {
    backgroundColor: '#e3f2fd',
    borderColor: '#007AFF',
    borderWidth: 1,
  },
  shoeBrand: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  shoeModel: {
    fontSize: 14,
    color: '#666',
  },
  shoeCategory: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
  },
  recommendationContainer: {
    marginTop: 20,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 5,
  },
  recommendationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  selectedShoeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  selectedShoeText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 5,
    marginBottom: 20,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  resultContainer: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa',
    borderRadius: 5,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  resultSize: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  confidenceText: {
    marginTop: 10,
    color: '#666',
  },
  closeButton: {
    padding: 5,
  },
}); 