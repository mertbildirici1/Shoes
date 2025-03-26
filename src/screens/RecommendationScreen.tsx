import React, { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Alert, FlatList } from 'react-native';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Shoe, SizeRecommendation } from '../types';
import { useNavigation } from '@react-navigation/native';

export const RecommendationScreen = () => {
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [recommendation, setRecommendation] = useState<SizeRecommendation | null>(null);
  const [userShoes, setUserShoes] = useState<Shoe[]>([]);
  const { user } = useAuth();
  const navigation = useNavigation();

  useEffect(() => {
    fetchUserShoes();
  }, []);

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
      Alert.alert('Error', error.message);
    }
  };

  const getRecommendation = () => {
    if (!brand || !model) {
      Alert.alert('Error', 'Please enter both brand and model');
      return;
    }

    // Find exact matches
    const exactMatches = userShoes.filter(
      shoe => shoe.brand.toLowerCase() === brand.toLowerCase() &&
      shoe.model.toLowerCase() === model.toLowerCase()
    );

    if (exactMatches.length > 0) {
      const perfectFit = exactMatches.find(shoe => shoe.fit === 'perfect');
      if (perfectFit) {
        setRecommendation({
          recommendedSize: perfectFit.size,
          confidence: 0.9,
          basedOn: [perfectFit],
        });
        return;
      }
    }

    // Find brand matches
    const brandMatches = userShoes.filter(
      shoe => shoe.brand.toLowerCase() === brand.toLowerCase()
    );

    if (brandMatches.length > 0) {
      const perfectFits = brandMatches.filter(shoe => shoe.fit === 'perfect');
      if (perfectFits.length > 0) {
        const avgSize = perfectFits.reduce((acc, shoe) => acc + parseFloat(shoe.size), 0) / perfectFits.length;
        setRecommendation({
          recommendedSize: avgSize.toFixed(1),
          confidence: 0.7,
          basedOn: perfectFits,
        });
        return;
      }
    }

    setRecommendation({
      recommendedSize: 'Unknown',
      confidence: 0,
      basedOn: [],
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Get Size Recommendation</Text>
        <TouchableOpacity 
          style={styles.profileButton}
          onPress={() => navigation.navigate('Profile')}
        >
          <Text style={styles.profileButtonText}>Profile</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Brand"
        value={brand}
        onChangeText={setBrand}
      />
      <TextInput
        style={styles.input}
        placeholder="Model"
        value={model}
        onChangeText={setModel}
      />
      <TouchableOpacity style={styles.button} onPress={getRecommendation}>
        <Text style={styles.buttonText}>Get Recommendation</Text>
      </TouchableOpacity>

      {recommendation && (
        <View style={styles.recommendationContainer}>
          <Text style={styles.recommendationTitle}>Recommended Size</Text>
          <Text style={styles.recommendationSize}>{recommendation.recommendedSize}</Text>
          <Text style={styles.confidenceText}>
            Confidence: {Math.round(recommendation.confidence * 100)}%
          </Text>
        </View>
      )}

      <TouchableOpacity 
        style={[styles.button, styles.addButton]} 
        onPress={() => navigation.navigate('AddShoe')}
      >
        <Text style={styles.buttonText}>Add New Shoe</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Your Shoe Collection</Text>
      <FlatList
        data={userShoes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.shoeItem}>
            <Text style={styles.shoeBrand}>{item.brand}</Text>
            <Text style={styles.shoeModel}>{item.model}</Text>
            <Text style={styles.shoeSize}>Size: {item.size}</Text>
            <Text style={styles.shoeFit}>Fit: {item.fit}</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  profileButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
  },
  profileButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 5,
    marginBottom: 20,
  },
  addButton: {
    backgroundColor: '#34C759',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  recommendationContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 5,
    marginBottom: 20,
    alignItems: 'center',
  },
  recommendationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  recommendationSize: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  confidenceText: {
    marginTop: 10,
    color: '#666',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  shoeItem: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
  },
  shoeBrand: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  shoeModel: {
    fontSize: 14,
    color: '#666',
  },
  shoeSize: {
    marginTop: 5,
  },
  shoeFit: {
    marginTop: 5,
    color: '#007AFF',
  },
}); 