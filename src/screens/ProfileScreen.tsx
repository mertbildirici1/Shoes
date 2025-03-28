import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Shoe } from '../types';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { PostgrestError } from '@supabase/supabase-js';

export const ProfileScreen = () => {
  const { user, signOut } = useAuth();
  const navigation = useNavigation();
  const [userShoes, setUserShoes] = useState<Shoe[]>([]);

  const fetchUserShoes = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('shoes')
        .select('*')
        .eq('user_id', user.id)
        .order('brand');

      if (error) throw error;
      setUserShoes(data || []);
    } catch (error) {
      Alert.alert('Error', (error as PostgrestError).message);
    }
  };

  // Fetch shoes when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      fetchUserShoes();
    }, [user])
  );

  const handleSignOut = async () => {
    try {
      await signOut();
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to sign out');
    }
  };

  const handleDeleteShoe = async (shoeId: string) => {
    try {
      const { error } = await supabase
        .from('shoes')
        .delete()
        .eq('id', shoeId);

      if (error) throw error;
      fetchUserShoes(); // Refresh the list after deletion
    } catch (error) {
      Alert.alert('Error', (error as PostgrestError).message);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Profile</Text>
      </View>

      <Text style={styles.email}>{user?.email}</Text>

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('AddShoe')}
      >
        <Text style={styles.buttonText}>Add New Shoe to Collection</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.adminButton}
        onPress={() => navigation.navigate('Admin')}
      >
        <Text style={styles.adminButtonText}>Add New Shoe to Catalog</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>My Shoe Collection</Text>
      
      <View style={styles.listContainer}>
        <FlatList
          data={userShoes}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.shoeItem}>
              <View style={styles.shoeInfo}>
                <Text style={styles.shoeBrand}>{item.brand}</Text>
                <Text style={styles.shoeModel}>{item.model}</Text>
                <Text style={styles.shoeDetails}>Size: {item.size}</Text>
                <Text style={styles.shoeDetails}>Size Type: {item.size_type}</Text>
                <Text style={styles.shoeDetails}>Fit: {item.fit}</Text>
              </View>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteShoe(item.id)}
              >
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No shoes in your collection yet</Text>
          }
        />
      </View>

      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
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
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  email: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  addButton: {
    backgroundColor: '#34C759',
    padding: 15,
    borderRadius: 5,
    marginBottom: 20,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  listContainer: {
    flex: 1,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  shoeItem: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  shoeInfo: {
    flex: 1,
  },
  shoeBrand: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  shoeModel: {
    fontSize: 14,
    color: '#666',
  },
  shoeDetails: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    padding: 8,
    borderRadius: 5,
  },
  deleteButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 20,
  },
  adminButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 5,
    marginBottom: 20,
    alignItems: 'center',
  },
  adminButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  signOutButton: {
    backgroundColor: '#FF3B30',
    padding: 15,
    borderRadius: 5,
    marginTop: 'auto',
  },
  signOutText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
}); 