import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../lib/supabase';

export const AdminScreen = () => {
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [category, setCategory] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const uploadImage = async () => {
    if (!image || !brand || !model || !category) {
      Alert.alert('Error', 'Please fill in all fields and select an image');
      return;
    }

    try {
      setUploading(true);

      // Convert image URI to blob
      const response = await fetch(image);
      const blob = await response.blob();

      // Upload to Supabase Storage
      const fileName = `${brand.toLowerCase()}-${model.toLowerCase()}.jpg`;
      const { error: uploadError, data } = await supabase.storage
        .from('shoe-images')
        .upload(fileName, blob);

      if (uploadError) throw uploadError;

      // Get the public URL using the newer method
      const { data: { publicUrl } } = supabase.storage
        .from('shoe-images')
        .getPublicUrl(fileName);

      console.log('Public URL:', publicUrl); // Debug log

      // Construct the full URL with your Supabase project URL
      const SUPABASE_PROJECT_URL = supabase.supabaseUrl;
      const fullImageUrl = `${SUPABASE_PROJECT_URL}/storage/v1/object/public/shoe-images/${fileName}`;
      
      console.log('Full Image URL:', fullImageUrl); // Debug log

      // Add to shoe catalog with the full URL
      const { error: insertError } = await supabase
        .from('shoe_catalog')
        .insert([
          {
            brand,
            model,
            category,
            image_url: fullImageUrl,
          },
        ]);

      if (insertError) throw insertError;

      Alert.alert('Success', 'Shoe added successfully!');
      setBrand('');
      setModel('');
      setCategory('');
      setImage(null);
    } catch (error) {
      console.error('Upload error:', error); // Debug log
      Alert.alert('Error', 'Failed to upload shoe');
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add New Shoe</Text>

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

      <TextInput
        style={styles.input}
        placeholder="Category"
        value={category}
        onChangeText={setCategory}
      />

      <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
        <Text style={styles.buttonText}>Select Image</Text>
      </TouchableOpacity>

      {image && (
        <View style={styles.imagePreview}>
          <Image source={{ uri: image }} style={styles.preview} />
        </View>
      )}

      <TouchableOpacity 
        style={[styles.uploadButton, uploading && styles.uploadingButton]}
        onPress={uploadImage}
        disabled={uploading}
      >
        <Text style={styles.buttonText}>
          {uploading ? 'Uploading...' : 'Upload Shoe'}
        </Text>
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 5,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  imageButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 5,
    marginBottom: 15,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  imagePreview: {
    alignItems: 'center',
    marginBottom: 15,
  },
  preview: {
    width: 200,
    height: 200,
    borderRadius: 5,
  },
  uploadButton: {
    backgroundColor: '#34C759',
    padding: 15,
    borderRadius: 5,
  },
  uploadingButton: {
    opacity: 0.7,
  },
}); 