import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, ActivityIndicator, Alert, ScrollView, TouchableOpacity, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { createItem } from '@/services/offline';
import { useNetwork } from '@/context/NetworkContext';
import { theme } from '@/constants/theme';
import { router, useLocalSearchParams } from 'expo-router';
import DropDownPicker from 'react-native-dropdown-picker';
import { get_list, uploadFile } from '@/services/erpnext';

interface Item {
  label: string;
  value: string;
}

export default function NewItemScreen() {
  const { create } = useLocalSearchParams();
  const { isConnected } = useNetwork();
  const [itemName, setItemName] = useState('');
  const [itemCode, setItemCode] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [itemGroupOpen, setItemGroupOpen] = useState(false);
  const [itemGroupValue, setItemGroupValue] = useState(null);
  const [itemGroups, setItemGroups] = useState<Item[]>([]);

  const [uomOpen, setUomOpen] = useState(false);
  const [uomValue, setUomValue] = useState('Unit');
  const [uoms, setUoms] = useState<Item[]>([]);

  const [itemTypeOpen, setItemTypeOpen] = useState(false);
  const [itemTypeValue, setItemTypeValue] = useState(null);
  const [itemTypes, setItemTypes] = useState<Item[]>([
    { label: 'Paper CUP', value: 'Paper CUP' },
    { label: 'Paper Cup Lid', value: 'Paper Cup Lid' },
    { label: 'Paper Cup Jacket', value: 'Paper Cup Jacket' },
    { label: 'Paper Cup Holder', value: 'Paper Cup Holder' },
    { label: 'Outer BOX', value: 'Outer BOX' },
    { label: 'Bags', value: 'Bags' },
    { label: 'Table Matt', value: 'Table Matt' },
    { label: 'Food Tray', value: 'Food Tray' },
    { label: 'Food Wrapping Paper', value: 'Food Wrapping Paper' },
    { label: 'Sticker', value: 'Sticker' },
    { label: 'Cone', value: 'Cone' },
    { label: 'Leaflet', value: 'Leaflet' },
    { label: 'Business Card', value: 'Business Card' },
    { label: 'Hang Tag', value: 'Hang Tag' },
    { label: 'Envelope', value: 'Envelope' },
    { label: 'Invoice', value: 'Invoice' },
    { label: 'File Folder', value: 'File Folder' },
    { label: 'Brochure', value: 'Brochure' },
    { label: 'Calendar', value: 'Calendar' },
    { label: 'Food Menu Card', value: 'Food Menu Card' },
    { label: 'Diery', value: 'Diery' },
    { label: 'Notebook', value: 'Notebook' },
  ]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const itemGroupRes = await get_list({ doctype: 'Item Group', fields: ['name'] });
        setItemGroups(itemGroupRes.data.map((g: any) => ({ label: g.name, value: g.name })));
        const uomRes = await get_list({ doctype: 'UOM', fields: ['name'], limit_page_length: 1000 });
        setUoms(uomRes.data.map((u: any) => ({ label: u.name, value: u.name })));
      } catch (error) {
        Alert.alert('Error', 'Failed to fetch data for dropdowns.');
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (create) {
      handleCreateItem();
    }
  }, [create]);

  const handleCreateItem = async () => {
    if (isConnected === null) {
      Alert.alert('Error', 'Cannot create item while network status is unknown.');
      return;
    }
    if (!itemName || !itemCode || !itemGroupValue || !uomValue || !itemTypeValue) {
      Alert.alert('Error', 'Please fill all required fields.');
      return;
    }
    setLoading(true);
    try {
      let imageUrl = '';
      if (image) {
        const response = await uploadFile({
          uri: image,
          type: 'image/jpeg',
          name: `${itemCode || 'new-item'}.jpg`,
        });
        imageUrl = response.message.file_url;
      }

      const result = await createItem(isConnected, {
        item_name: itemName,
        item_code: itemCode,
        description: description,
        item_group: itemGroupValue,
        stock_uom: uomValue,
        item_type: itemTypeValue,
        image: imageUrl,
      });
      if (result.offline) {
        Alert.alert('Success', 'Item data saved locally and will be synced when online.');
      } else {
        Alert.alert('Success', 'Item created successfully.');
      }
      router.back();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create item.');
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
          {image ? (
            <Image source={{ uri: image }} style={styles.image} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.plusSign}>+</Text>
            </View>
          )}
        </TouchableOpacity>
        <Text style={styles.label}>Item Name</Text>
      <TextInput
        style={styles.input}
        value={itemName}
        onChangeText={(text) => {
          setItemName(text);
          setItemCode(text);
        }}
        placeholder="Enter item name"
      />
      <Text style={styles.label}>Item Code</Text>
      <TextInput
        style={styles.input}
        value={itemCode}
        onChangeText={setItemCode}
        placeholder="Enter item code"
      />
      <Text style={styles.label}>Description</Text>
      <TextInput
        style={styles.input}
        value={description}
        onChangeText={setDescription}
        placeholder="Enter description"
        multiline
        numberOfLines={4}
        textAlignVertical="top"
      />
      <Text style={styles.label}>Item Group</Text>
      <DropDownPicker
        open={itemGroupOpen}
        value={itemGroupValue}
        items={itemGroups}
        setOpen={setItemGroupOpen}
        setValue={setItemGroupValue}
        setItems={setItemGroups}
        searchable={true}
        placeholder="Select an item group"
        style={styles.dropdown}
        containerStyle={styles.dropdownContainer}
        zIndex={3000}
        zIndexInverse={1000}
        listMode="MODAL"
      />
      <Text style={styles.label}>Default Unit of Measure</Text>
      <DropDownPicker
        open={uomOpen}
        value={uomValue}
        items={uoms}
        setOpen={setUomOpen}
        setValue={setUomValue}
        setItems={setUoms}
        searchable={true}
        placeholder="Select a UOM"
        style={styles.dropdown}
        containerStyle={styles.dropdownContainer}
        zIndex={2000}
        zIndexInverse={2000}
        listMode="MODAL"
      />
      <Text style={styles.label}>Item Type</Text>
      <DropDownPicker
        open={itemTypeOpen}
        value={itemTypeValue}
        items={itemTypes}
        setOpen={setItemTypeOpen}
        setValue={setItemTypeValue}
        setItems={setItemTypes}
        searchable={true}
        placeholder="Select an item type"
        style={styles.dropdown}
        containerStyle={styles.dropdownContainer}
        zIndex={1000}
        zIndexInverse={3000}
        listMode="MODAL"
      />
      {loading && <ActivityIndicator size="large" color={theme.colors.primary[500]} />}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    padding: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    backgroundColor: theme.colors.white,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 16,
  },
  dropdown: {
    backgroundColor: theme.colors.white,
    borderColor: '#ccc',
  },
  dropdownContainer: {
    marginBottom: 16,
  },
  buttonContainer: {
    marginTop: 20,
  },
  button: {
    backgroundColor: theme.colors.primary[500],
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  imagePicker: {
    width: 150,
    height: 150,
    borderRadius: 8,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 20,
  },
  imagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  plusSign: {
    fontSize: 50,
    color: '#9e9e9e',
  },
});
