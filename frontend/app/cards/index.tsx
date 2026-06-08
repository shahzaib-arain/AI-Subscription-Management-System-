import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Modal, Pressable } from "react-native";
import { useRouter } from "expo-router";
import Animated, { FadeInUp } from "react-native-reanimated";
import { Plus, CreditCard as CardIcon, MoreVertical, ShieldCheck, HelpCircle } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "../../context/AuthContext";

// Initial mock external funding source cards
const initialExternalCards = [
  {
    id: "ext-1",
    type: "Visa",
    last4: "4242",
    expiry: "12/28",
    color: "#4e83ff",
    gradient: ["rgba(78, 131, 255, 0.15)", "#15161d"] as const
  },
  {
    id: "ext-2",
    type: "Mastercard",
    last4: "8899",
    expiry: "09/26",
    color: "#ffd11a",
    gradient: ["rgba(255, 209, 26, 0.15)", "#15161d"] as const
  }
];

export default function CardsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [cards, setCards] = useState(initialExternalCards);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [virtualExpiry, setVirtualExpiry] = useState("12/31");

  useEffect(() => {
    const date = new Date();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const yy = String((date.getFullYear() + 5) % 100);
    setVirtualExpiry(`${mm}/${yy}`);
  }, []);

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

  const virtualLast4 = user?.virtualCardNumber 
    ? user.virtualCardNumber.replace(/\D/g, "").slice(-4) 
    : "8190";

  return (
    <View style={styles.mainContainer}>
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        
        {/* Page Subtitle */}
        <Animated.View entering={FadeInUp.duration(400)} style={styles.header}>
          <Text style={styles.subtitle}>
            Your Virtual Card pays for automated subscriptions, while your funding cards load the wallet.
          </Text>
        </Animated.View>

        {/* 1. PRIMARY VIRTUAL CARD SECTION */}
        <Animated.View entering={FadeInUp.duration(400).delay(100)} style={styles.section}>
          <Text style={styles.sectionHeader}>PRIMARY VIRTUAL CARD</Text>
          <View style={styles.cardWrapper}>
            <LinearGradient
              colors={["#0c2d1c", "#15161d"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.cardItem, { borderColor: "rgba(20, 237, 158, 0.35)", borderWidth: 1.5 }]}
            >
              <View style={styles.cardHeader}>
                <View style={styles.cardTypeContainer}>
                  <ShieldCheck size={20} color="#14ed9e" />
                  <Text style={styles.cardType}>NeuroPay Virtual Visa</Text>
                </View>
                <View style={styles.primaryBadge}>
                  <Text style={styles.primaryBadgeText}>PRIMARY</Text>
                </View>
              </View>

              <View style={styles.cardDetails}>
                <Text style={styles.cardNumber}>•••• •••• •••• {virtualLast4}</Text>
                <View style={styles.expiryContainer}>
                  <Text style={styles.expiryLabel}>EXP</Text>
                  <Text style={styles.expiryValue}>{virtualExpiry}</Text>
                </View>
              </View>
            </LinearGradient>
          </View>
        </Animated.View>

        {/* 2. EXTERNAL FUNDING SOURCES SECTION */}
        <Animated.View entering={FadeInUp.duration(400).delay(200)} style={styles.section}>
          <Text style={styles.sectionHeader}>EXTERNAL FUNDING SOURCES</Text>
          {cards.length === 0 ? (
            <View style={styles.emptyContainer}>
              <HelpCircle size={24} color="#7e828d" />
              <Text style={styles.emptyText}>No funding sources saved. Add a card to load funds.</Text>
            </View>
          ) : (
            cards.map((card) => (
              <View key={card.id} style={styles.cardWrapper}>
                <LinearGradient
                  colors={card.gradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[styles.cardItem, { borderColor: "rgba(36, 37, 46, 0.8)", borderWidth: 1 }]}
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
            ))
          )}
        </Animated.View>

        {/* Add Card Action */}
        <Animated.View entering={FadeInUp.duration(400).delay(300)}>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => router.push("/cards/add")}
          >
            <View style={styles.addButtonIcon}>
              <Plus size={24} color="#0d0e12" />
            </View>
            <Text style={styles.addButtonText}>Add Funding Card</Text>
          </TouchableOpacity>
        </Animated.View>

      </ScrollView>

      {/* Custom Actions Modal */}
      <Modal visible={!!selectedCardId} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setSelectedCardId(null)}>
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalIndicator} />
            <Text style={styles.modalTitle}>Funding Source Options</Text>
            
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
  header: { marginBottom: 20 },
  subtitle: { color: "#7e828d", fontSize: 13, fontFamily: "Manrope_400Regular", lineHeight: 20 },
  
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    color: "#7e828d",
    fontSize: 11,
    fontFamily: "Manrope_800ExtraBold",
    letterSpacing: 1,
    marginBottom: 12,
  },
  cardWrapper: { marginBottom: 12 },
  cardItem: { 
    borderRadius: 16, 
    padding: 20, 
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 24 },
  cardTypeContainer: { flexDirection: "row", alignItems: "center", gap: 8 },
  cardType: { color: "#fcfcfc", fontSize: 15, fontFamily: "Manrope_700Bold" },
  moreButton: { padding: 8, margin: -8 },
  
  primaryBadge: {
    backgroundColor: "rgba(20, 237, 158, 0.15)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: "rgba(20, 237, 158, 0.3)",
  },
  primaryBadgeText: {
    color: "#14ed9e",
    fontSize: 9,
    fontFamily: "Manrope_800ExtraBold",
    letterSpacing: 0.5,
  },

  cardDetails: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" },
  cardNumber: { color: "#fcfcfc", fontSize: 18, fontFamily: "Manrope_600SemiBold", letterSpacing: 2 },
  expiryContainer: { alignItems: "flex-end" },
  expiryLabel: { color: "#7e828d", fontSize: 10, fontFamily: "Manrope_600SemiBold", marginBottom: 2 },
  expiryValue: { color: "#fcfcfc", fontSize: 14, fontFamily: "Manrope_600SemiBold" },
  
  addButton: { 
    flexDirection: "row", 
    alignItems: "center", 
    backgroundColor: "rgba(20, 237, 158, 0.05)", 
    borderWidth: 1, 
    borderColor: "rgba(20, 237, 158, 0.2)", 
    borderStyle: "dashed",
    borderRadius: 16, 
    padding: 18, 
    marginTop: 4,
    gap: 16
  },
  addButtonIcon: { 
    width: 36, 
    height: 36, 
    borderRadius: 18, 
    backgroundColor: "#14ed9e", 
    alignItems: "center", 
    justifyContent: "center" 
  },
  addButtonText: { color: "#14ed9e", fontSize: 15, fontFamily: "Manrope_700Bold" },

  emptyContainer: {
    backgroundColor: "#15161d",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: "#22232d",
  },
  emptyText: {
    color: "#7e828d",
    fontSize: 13,
    fontFamily: "Manrope_400Regular",
    textAlign: "center",
  },

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
