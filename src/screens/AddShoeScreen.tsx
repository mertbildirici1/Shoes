import React, { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Alert, FlatList } from 'react-native';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { PostgrestError } from '@supabase/supabase-js';
import { useNavigation } from '@react-navigation/native';

interface ShoeCatalog {
  id: string;
  brand: string;
  model: string;
  category: string;
}

export const AddShoeScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [size, setSize] = useState('');
  const [fit, setFit] = useState<'too small' | 'perfect' | 'too large'>('perfect');
  const [shoeCatalog, setShoeCatalog] = useState<ShoeCatalog[]>([]);
  const [selectedShoe, setSelectedShoe] = useState<ShoeCatalog | null>(null);
  const { user } = useAuth();
  const navigation = useNavigation();

  useEffect(() => {
    fetchShoeCatalog();
  }, []);

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

  const handleAddShoe = async () => {
    if (!user || !selectedShoe) {
      Alert.alert('Error', 'Please select a shoe first');
      return;
    }

    if (!size) {
      Alert.alert('Error', 'Please enter a size');
      return;
    }

    try {
      const { error } = await supabase
        .from('shoes')
        .insert([
          {
            user_id: user.id,
            brand: selectedShoe.brand,
            model: selectedShoe.model,
            size,
            fit,
          },
        ]);

      if (error) throw error;

      Alert.alert('Success', 'Shoe added to your collection!');
      navigation.goBack();
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
      <Text style={styles.title}>Add New Shoe</Text>
      
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
        <View style={styles.formContainer}>
          <TextInput
            style={styles.input}
            placeholder="Size"
            value={size}
            onChangeText={setSize}
            keyboardType="numeric"
          />
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
          <TouchableOpacity style={styles.addButton} onPress={handleAddShoe}>
            <Text style={styles.buttonText}>Add to Collection</Text>
          </TouchableOpacity>
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
  formContainer: {
    marginTop: 20,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 5,
  },
  input: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 5,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ddd',
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
  addButton: {
    backgroundColor: '#34C759',
    padding: 15,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
}); 