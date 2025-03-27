import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList, Alert, Modal } from 'react-native';
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
  sizeType: 'EU' | 'US';
  fit: 'too small' | 'perfect' | 'too large';
}

export const RecommendationScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [shoeCatalog, setShoeCatalog] = useState<ShoeCatalog[]>([]);
  const [selectedShoe, setSelectedShoe] = useState<ShoeCatalog | null>(null);
  const [userShoes, setUserShoes] = useState<Shoe[]>([]);
  const [recommendation, setRecommendation] = useState<{ size: string; confidence: number } | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [size, setSize] = useState('');
  const [fit, setFit] = useState<'too small' | 'perfect' | 'too large'>('perfect');
  const [shoeToAdd, setShoeToAdd] = useState<ShoeCatalog | null>(null);
  const { user } = useAuth();
  const navigation = useNavigation();
  const [sizeType, setSizeType] = useState<'EU' | 'US'>('EU');
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  // Add size options
  const euSizes = ['35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46', '47'];
  const usSizes = ['4', '4.5', '5', '5.5', '6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '11.5', '12'];

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
        .from('shoes')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      setUserShoes(data || []);
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

  const handleAddToCollection = (shoe: ShoeCatalog) => {
    if (!user) {
      Alert.alert('Error', 'Please log in to add shoes to your collection');
      return;
    }
    setShoeToAdd(shoe);
    setShowAddModal(true);
  };

  const handleConfirmAdd = async () => {
    if (!user || !shoeToAdd || !selectedSize) {
      Alert.alert('Error', 'Please select a size');
      return;
    }

    try {
      const { error } = await supabase
        .from('shoes')
        .insert([
          {
            user_id: user.id,
            brand: shoeToAdd.brand,
            model: shoeToAdd.model,
            size: selectedSize,
            size_type: sizeType,
            fit,
          },
        ]);

      if (error) throw error;

      Alert.alert('Success', 'Shoe added to your collection!');
      setShowAddModal(false);
      setSelectedSize(null);
      setFit('perfect');
      setShoeToAdd(null);
      fetchUserShoes();
    } catch (error) {
      Alert.alert('Error', (error as PostgrestError).message);
    }
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
            <View style={styles.shoeInfo}>
              <Text style={styles.shoeBrand}>{item.brand}</Text>
              <Text style={styles.shoeModel}>{item.model}</Text>
              <Text style={styles.shoeCategory}>{item.category}</Text>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => handleAddToCollection(item)}
              >
                <Text style={styles.addButtonText}>I have this</Text>
              </TouchableOpacity>
            </View>
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

      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Shoe to Collection</Text>
              <TouchableOpacity 
                onPress={() => setShowAddModal(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close-circle" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {shoeToAdd && (
              <View style={styles.selectedShoeInfo}>
                <Text style={styles.selectedShoeBrand}>{shoeToAdd.brand}</Text>
                <Text style={styles.selectedShoeModel}>{shoeToAdd.model}</Text>
              </View>
            )}

            <View style={styles.sizeTypeContainer}>
              <TouchableOpacity
                style={[styles.sizeTypeButton, sizeType === 'EU' && styles.selectedSizeType]}
                onPress={() => setSizeType('EU')}
              >
                <Text style={styles.sizeTypeText}>EU</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.sizeTypeButton, sizeType === 'US' && styles.selectedSizeType]}
                onPress={() => setSizeType('US')}
              >
                <Text style={styles.sizeTypeText}>US</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.sizeGrid}>
              {(sizeType === 'EU' ? euSizes : usSizes).map((size) => (
                <TouchableOpacity
                  key={size}
                  style={[
                    styles.sizeSquare,
                    selectedSize === size && styles.selectedSizeSquare
                  ]}
                  onPress={() => setSelectedSize(size)}
                >
                  <Text style={[
                    styles.sizeSquareText,
                    selectedSize === size && styles.selectedSizeSquareText
                  ]}>
                    {size}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.fitContainer}>
              <TouchableOpacity
                style={[styles.fitButton, fit === 'too small' && styles.selectedFit]}
                onPress={() => setFit('too small')}
              >
                <Text style={styles.fitButtonText}>Too Small</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.fitButton, fit === 'perfect' && styles.selectedFit]}
                onPress={() => setFit('perfect')}
              >
                <Text style={styles.fitButtonText}>Perfect</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.fitButton, fit === 'too large' && styles.selectedFit]}
                onPress={() => setFit('too large')}
              >
                <Text style={styles.fitButtonText}>Too Large</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.confirmButton} onPress={handleConfirmAdd}>
              <Text style={styles.buttonText}>Add to Collection</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 10,
  },
  shoeInfo: {
    flex: 1,
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
  addButton: {
    backgroundColor: '#34C759',
    padding: 8,
    borderRadius: 5,
    marginTop: 10,
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    minHeight: '50%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  selectedShoeInfo: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 5,
    marginBottom: 20,
  },
  selectedShoeBrand: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  selectedShoeModel: {
    fontSize: 14,
    color: '#666',
  },
  sizeTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  sizeTypeButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginHorizontal: 5,
    borderRadius: 5,
    backgroundColor: '#e0e0e0',
  },
  selectedSizeType: {
    backgroundColor: '#007AFF',
  },
  sizeTypeText: {
    fontWeight: 'bold',
    color: '#333',
  },
  sizeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 20,
  },
  sizeSquare: {
    width: 45,
    height: 45,
    margin: 5,
    borderRadius: 5,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedSizeSquare: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  sizeSquareText: {
    fontSize: 14,
    color: '#333',
  },
  selectedSizeSquareText: {
    color: 'white',
  },
  fitContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  fitButton: {
    flex: 1,
    padding: 10,
    marginHorizontal: 5,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
  },
  selectedFit: {
    backgroundColor: '#007AFF',
  },
  fitButtonText: {
    textAlign: 'center',
    color: '#333',
  },
  confirmButton: {
    backgroundColor: '#34C759',
    padding: 15,
    borderRadius: 5,
  },
}); 