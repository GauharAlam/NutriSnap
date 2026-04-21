import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator, Alert } from 'react-native';
import { Camera, CameraView } from 'expo-camera';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Fonts, Radius } from '../lib/colors';
import { apiClient } from '../lib/api';

export default function BarcodeScannerScreen() {
  const router = useRouter();
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [productData, setProductData] = useState(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = async ({ type, data }) => {
    setScanned(true);
    setLoading(true);
    
    try {
      // Query OpenFoodFacts API
      const res = await fetch(`https://world.openfoodfacts.org/api/v0/product/${data}.json`);
      const json = await res.json();

      if (json.status !== 1 || !json.product) {
        Alert.alert('Not Found', 'Could not find nutrition data for this barcode.', [
          { text: 'Try Again', onPress: () => setScanned(false) },
        ]);
        setLoading(false);
        return;
      }

      const p = json.product;
      const nutriments = p.nutriments || {};
      
      // Usually per 100g or 100ml. We will just use the default returned value for a "serving" or 100g.
      setProductData({
        title: p.product_name || 'Unknown Product',
        brand: p.brands || 'Unknown Brand',
        calories: nutriments['energy-kcal_100g'] || nutriments['energy-kcal_serving'] || 0,
        protein: nutriments['proteins_100g'] || nutriments['proteins_serving'] || 0,
        carbs: nutriments['carbohydrates_100g'] || nutriments['carbohydrates_serving'] || 0,
        fats: nutriments['fat_100g'] || nutriments['fat_serving'] || 0,
      });

    } catch (err) {
      console.log('Barcode fetch error:', err);
      Alert.alert('Error', 'Failed to fetch barcode info.', [
        { text: 'Try Again', onPress: () => setScanned(false) },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const logProduct = async () => {
    if (!productData) return;
    try {
      setLoading(true);
      await apiClient.post('/meals', {
        title: productData.title,
        mealType: 'snack', // Default to snack
        foodItems: [productData.title],
        eatenAt: new Date().toISOString(),
        nutrition: {
          calories: Math.round(productData.calories),
          protein: Math.round(productData.protein),
          carbs: Math.round(productData.carbs),
          fats: Math.round(productData.fats),
          sugar: Math.round(productData.carbs * 0.2), // Rough estimate
        },
        source: 'manual', // could be 'barcode' if supported tracking-wise
      });
      router.back();
    } catch (e) {
      console.log('Error logging scanned meal', e);
      Alert.alert('Error', 'Could not save the food item.');
      setLoading(false);
    }
  };

  if (hasPermission === null) {
    return <View style={styles.center}><ActivityIndicator size="large" color={Colors.neonBlue} /></View>;
  }
  if (hasPermission === false) {
    return (
      <View style={styles.center}>
        <Text style={{ color: Colors.text }}>No access to camera</Text>
        <Pressable onPress={() => router.back()} style={{ marginTop: 20 }}>
          <Text style={{ color: Colors.neonBlue }}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backTxt}>✕ Cancel</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Scan Barcode</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.cameraFrame}>
        {!scanned ? (
          <CameraView 
            style={StyleSheet.absoluteFillObject}
            facing="back"
            barcodeScannerSettings={{
              barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'qr'],
            }}
            onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          />
        ) : (
          <View style={[StyleSheet.absoluteFillObject, { backgroundColor: '#111' }]} />
        )}
        
        {/* Scanner Overlay UI */}
        {!scanned && (
          <View style={styles.overlay}>
             <View style={styles.scanBox} />
             <Text style={styles.scanInst}>Align barcode within the frame</Text>
          </View>
        )}
      </View>

      {loading && !productData && (
        <View style={styles.loadingBox}>
           <ActivityIndicator size="large" color={Colors.neonBlue} />
           <Text style={styles.loadingText}>Fetching Nutrition Info...</Text>
        </View>
      )}

      {productData && !loading && (
        <View style={styles.resultBox}>
          <Text style={styles.brandText}>{productData.brand}</Text>
          <Text style={styles.productName}>{productData.title}</Text>
          
          <View style={styles.macroGrid}>
            <View style={styles.macroItem}><Text style={[styles.macVal, { color: Colors.neonOrange }]}>{Math.round(productData.calories)}</Text><Text style={styles.macLbl}>kcal</Text></View>
            <View style={styles.macroItem}><Text style={[styles.macVal, { color: Colors.neonBlue }]}>{Math.round(productData.protein)}g</Text><Text style={styles.macLbl}>Protein</Text></View>
            <View style={styles.macroItem}><Text style={[styles.macVal, { color: Colors.neonGreen }]}>{Math.round(productData.carbs)}g</Text><Text style={styles.macLbl}>Carbs</Text></View>
            <View style={styles.macroItem}><Text style={[styles.macVal, { color: Colors.neonPink }]}>{Math.round(productData.fats)}g</Text><Text style={styles.macLbl}>Fat</Text></View>
          </View>

          <Pressable onPress={logProduct}>
            <LinearGradient colors={Colors.gradientBlue} style={styles.logBtn} start={{ x:0, y:0 }} end={{ x:1, y:0 }}>
               <Text style={styles.logBtnText}>✅ Log This Food</Text>
            </LinearGradient>
          </Pressable>

          <Pressable onPress={() => { setScanned(false); setProductData(null); }} style={styles.rescanBtn}>
            <Text style={styles.rescanTxt}>Scan Another Item</Text>
          </Pressable>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, backgroundColor: Colors.bg, justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1, backgroundColor: Colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  backBtn: { padding: 8 },
  backTxt: { color: Colors.textSec, ...Fonts.medium },
  headerTitle: { color: Colors.text, fontSize: 16, ...Fonts.semibold },
  cameraFrame: { flex: 1, overflow: 'hidden', borderBottomLeftRadius: 30, borderBottomRightRadius: 30, position: 'relative' },
  overlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  scanBox: { width: 250, height: 150, borderWidth: 2, borderColor: Colors.neonGreen, borderRadius: 16, backgroundColor: 'transparent' },
  scanInst: { color: '#fff', marginTop: 24, fontSize: 12, ...Fonts.medium },
  loadingBox: { position: 'absolute', bottom: 40, left: 16, right: 16, alignItems: 'center', backgroundColor: Colors.bgCardSolid, padding: 24, borderRadius: 24 },
  loadingText: { color: Colors.text, marginTop: 12, ...Fonts.medium },
  resultBox: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: Colors.bgCardSolid, borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 24 },
  brandText: { fontSize: 12, color: Colors.textSec, textTransform: 'uppercase', letterSpacing: 1 },
  productName: { fontSize: 20, color: Colors.text, ...Fonts.display, marginTop: 4, marginBottom: 20 },
  macroGrid: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  macroItem: { flex: 1, backgroundColor: Colors.bgInput, borderRadius: 12, padding: 12, alignItems: 'center' },
  macVal: { fontSize: 16, ...Fonts.bold },
  macLbl: { fontSize: 10, color: Colors.textMuted, marginTop: 4 },
  logBtn: { paddingVertical: 16, borderRadius: Radius.full, alignItems: 'center' },
  logBtnText: { color: '#fff', ...Fonts.bold, fontSize: 16 },
  rescanBtn: { paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  rescanTxt: { color: Colors.textSec, ...Fonts.medium },
});
