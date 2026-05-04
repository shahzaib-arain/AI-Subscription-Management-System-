import { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Modal, Pressable } from "react-native";
import { useRouter } from "expo-router";
import Animated, { FadeInUp } from "react-native-reanimated";
import { Plus, CreditCard as CardIcon, MoreVertical } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";

// Mock saved cards data
const mockCards = [
  {
    id: "1",
    type: "Visa",
    last4: "4242",
    expiry: "12/28",
    color: "#14ed9e",
    gradient: ["#23242f", "#15161d"] as const
  },
  {
    id: "2",
    type: "Mastercard",
    last4: "8899",
    expiry: "09/26",
    color: "#4e83ff",
    gradient: ["rgba(78, 131, 255, 0.15)", "#15161d"] as const
  }
];

export default function CardsPage() {
  const router = useRouter();
  const [cards, setCards] = useState(mockCards);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

  const handleDelete = () => {
    if (selectedCardId) {
      setCards(prev => prev.filter(c => c.id !== selectedCardId));
      setSelectedCardId(null);
    }
  };

  const handleEdit = () => {
    if (selectedCardId) {
      router.push(`/cards/edit/${selectedCardId}`);
      setSelectedCardId(null);
    }
  };

  return (
    <View style={styles.mainContainer}>
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        
        <Animated.View entering={FadeInUp.duration(400)} style={styles.header}>
          <Text style={styles.subtitle}>Manage the cards used for your automated subscriptions.</Text>
        </Animated.View>

        <Animated.View entering={FadeInUp.duration(400).delay(100)}>
          {cards.map((card, index) => (
            <View key={card.id} style={styles.cardWrapper}>
              <LinearGradient
                colors={card.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.cardItem, { borderColor: `rgba(${card.color === '#14ed9e' ? '20, 237, 158' : '78, 131, 255'}, 0.3)` }]}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.cardTypeContainer}>
                    <CardIcon size={20} color={card.color} />
                    <Text style={styles.cardType}>{card.type}</Text>
                  </View>
                  <TouchableOpacity style={styles.moreButton} onPress={() => setSelectedCardId(card.id)}>
                    <MoreVertical size={20} color="#7e828d" />
                  </TouchableOpacity>
                </View>

                <View style={styles.cardDetails}>
                  <Text style={styles.cardNumber}>•••• •••• •••• {card.last4}</Text>
                  <View style={styles.expiryContainer}>
                    <Text style={styles.expiryLabel}>EXP</Text>
                    <Text style={styles.expiryValue}>{card.expiry}</Text>
                  </View>
                </View>
              </LinearGradient>
            </View>
          ))}
        </Animated.View>

        <Animated.View entering={FadeInUp.duration(400).delay(200)}>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => router.push("/cards/add")}
          >
            <View style={styles.addButtonIcon}>
              <Plus size={24} color="#0d0e12" />
            </View>
            <Text style={styles.addButtonText}>Add New Card</Text>
          </TouchableOpacity>
        </Animated.View>

      </ScrollView>

      {/* Custom Actions Modal */}
      <Modal visible={!!selectedCardId} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setSelectedCardId(null)}>
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalIndicator} />
            <Text style={styles.modalTitle}>Card Options</Text>
            
            <TouchableOpacity style={styles.modalOption} onPress={handleEdit}>
              <Text style={styles.modalOptionText}>Edit Card Details</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.modalOption, styles.deleteOption]} onPress={handleDelete}>
              <Text style={styles.deleteText}>Remove Card</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.cancelButton} onPress={() => setSelectedCardId(null)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: "#0d0e12" },
  container: { flex: 1, backgroundColor: "#0d0e12" },
  scrollContent: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 },
  header: { marginBottom: 24 },
  subtitle: { color: "#7e828d", fontSize: 14, fontFamily: "Manrope_400Regular", lineHeight: 22 },
  
  cardWrapper: { marginBottom: 16 },
  cardItem: { 
    borderRadius: 16, 
    padding: 20, 
    borderWidth: 1,
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 24 },
  cardTypeContainer: { flexDirection: "row", alignItems: "center", gap: 8 },
  cardType: { color: "#fcfcfc", fontSize: 16, fontFamily: "Manrope_700Bold" },
  moreButton: { padding: 8, margin: -8 },
  
  cardDetails: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" },
  cardNumber: { color: "#fcfcfc", fontSize: 18, fontFamily: "Manrope_600SemiBold", letterSpacing: 2 },
  expiryContainer: { alignItems: "flex-end" },
  expiryLabel: { color: "#7e828d", fontSize: 10, fontFamily: "Manrope_600SemiBold", marginBottom: 2 },
  expiryValue: { color: "#fcfcfc", fontSize: 14, fontFamily: "Manrope_600SemiBold" },
  
  addButton: { 
    flexDirection: "row", 
    alignItems: "center", 
    backgroundColor: "rgba(20, 237, 158, 0.1)", 
    borderWidth: 1, 
    borderColor: "rgba(20, 237, 158, 0.3)", 
    borderStyle: "dashed",
    borderRadius: 16, 
    padding: 20, 
    marginTop: 8,
    gap: 16
  },
  addButtonIcon: { 
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    backgroundColor: "#14ed9e", 
    alignItems: "center", 
    justifyContent: "center" 
  },
  addButtonText: { color: "#14ed9e", fontSize: 16, fontFamily: "Manrope_700Bold" },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#15161d",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderColor: "#24252e",
  },
  modalIndicator: {
    width: 40,
    height: 4,
    backgroundColor: "#24252e",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 20,
  },
  modalTitle: {
    color: "#fcfcfc",
    fontSize: 18,
    fontFamily: "Manrope_700Bold",
    marginBottom: 20,
    textAlign: "center",
  },
  modalOption: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderColor: "#24252e",
  },
  modalOptionText: {
    color: "#fcfcfc",
    fontSize: 16,
    fontFamily: "Manrope_600SemiBold",
    textAlign: "center",
  },
  deleteOption: {
    borderBottomWidth: 0,
    marginBottom: 16,
  },
  deleteText: {
    color: "#ff4e83",
    fontSize: 16,
    fontFamily: "Manrope_600SemiBold",
    textAlign: "center",
  },
  cancelButton: {
    backgroundColor: "#23242f",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  cancelText: {
    color: "#fcfcfc",
    fontSize: 16,
    fontFamily: "Manrope_700Bold",
  }
});
