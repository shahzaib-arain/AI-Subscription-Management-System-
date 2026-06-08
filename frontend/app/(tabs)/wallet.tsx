import React, { useState, useEffect } from "react";
import { 
  ScrollView, 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Modal, 
  TextInput, 
  ActivityIndicator,
  Platform
} from "react-native";
import Animated, { FadeInUp, FadeInDown } from "react-native-reanimated";
import { 
  Plus, 
  Lock, 
  Unlock, 
  Eye, 
  EyeOff, 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight 
} from "lucide-react-native";
import { useAuth } from "../../context/AuthContext";
import CreditCard from "../../components/ui/CreditCard";
import { activities } from "../../constants/mockData";

export default function WalletPage() {
  const { user, walletBalance, deposit } = useAuth();
  
  const [expiry, setExpiry] = useState("12/31");
  const [focusedField, setFocusedField] = useState<"number" | "name" | "expiry" | "cvv" | null>(null);
  const [isFrozen, setIsFrozen] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  
  // Deposit Modal State
  const [depositModalVisible, setDepositModalVisible] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");
  const [isDepositing, setIsDepositing] = useState(false);
  const [depositError, setDepositError] = useState<string | null>(null);

  useEffect(() => {
    const date = new Date();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const yy = String((date.getFullYear() + 5) % 100);
    setExpiry(`${mm}/${yy}`);
  }, []);

  const cardNumber = user?.virtualCardNumber || "••••••••••••••••";
  const cardholderName = user?.fullName || "Your Name";

  const toggleFreeze = () => {
    setIsFrozen(prev => !prev);
  };

  const handleDeposit = async () => {
    setDepositError(null);
    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount <= 0) {
      setDepositError("Please enter a valid positive amount.");
      return;
    }

    setIsDepositing(true);
    // Simulate a brief network latency for premium feel
    setTimeout(async () => {
      await deposit(amount);
      setIsDepositing(false);
      setDepositAmount("");
      setDepositModalVisible(false);
    }, 800);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <Animated.View entering={FadeInUp.duration(400)} style={styles.header}>
        <Text style={styles.title}>Your Wallet</Text>
        <Text style={styles.subtitle}>Fund subscriptions securely via your virtual card</Text>
      </Animated.View>

      {/* Balance display */}
      <Animated.View entering={FadeInUp.duration(400).delay(100)} style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>AVAILABLE BALANCE</Text>
        <Text style={styles.balanceAmount}>${walletBalance.toFixed(2)}</Text>
        <View style={styles.badge}>
          <View style={[styles.dot, { backgroundColor: isFrozen ? "#ff4e83" : "#14ed9e" }]} />
          <Text style={styles.badgeText}>{isFrozen ? "Card Frozen" : "Card Active"}</Text>
        </View>
      </Animated.View>

      {/* Virtual Card Visualization */}
      <Animated.View entering={FadeInUp.duration(400).delay(150)} style={styles.cardContainer}>
        <View style={[styles.cardInner, isFrozen && styles.frozenOverlay]}>
          <CreditCard 
            number={cardNumber.replace(/\s+/g, "")} 
            name={cardholderName} 
            expiry={expiry} 
            cvv="819" 
            focused={focusedField} 
          />
        </View>
        
        {isFrozen && (
          <View style={styles.frozenBadgeContainer}>
            <Lock size={16} color="#0d0e12" strokeWidth={3} />
            <Text style={styles.frozenBadgeText}>FROZEN</Text>
          </View>
        )}
      </Animated.View>

      {/* Quick Action Buttons */}
      <Animated.View entering={FadeInUp.duration(400).delay(200)} style={styles.actionsRow}>
        <TouchableOpacity 
          style={styles.actionBtn} 
          onPress={() => setDepositModalVisible(true)}
        >
          <View style={[styles.actionIconBox, { backgroundColor: "rgba(20, 237, 158, 0.1)" }]}>
            <Plus size={20} color="#14ed9e" />
          </View>
          <Text style={styles.actionText}>Add Funds</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionBtn} 
          onPress={toggleFreeze}
        >
          <View style={[styles.actionIconBox, { backgroundColor: isFrozen ? "rgba(20, 237, 158, 0.1)" : "rgba(255, 78, 131, 0.1)" }]}>
            {isFrozen ? (
              <Unlock size={20} color="#14ed9e" />
            ) : (
              <Lock size={20} color="#ff4e83" />
            )}
          </View>
          <Text style={styles.actionText}>{isFrozen ? "Unfreeze" : "Freeze Card"}</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionBtn} 
          onPress={() => setShowDetails(prev => !prev)}
        >
          <View style={[styles.actionIconBox, { backgroundColor: "rgba(78, 131, 255, 0.1)" }]}>
            {showDetails ? (
              <EyeOff size={20} color="#4e83ff" />
            ) : (
              <Eye size={20} color="#4e83ff" />
            )}
          </View>
          <Text style={styles.actionText}>{showDetails ? "Hide Info" : "Card Info"}</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Card details expansion */}
      {showDetails && (
        <Animated.View entering={FadeInDown.duration(300)} style={styles.detailsCard}>
          <Text style={styles.detailsTitle}>Secure Card Details</Text>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Card Number</Text>
            <Text style={styles.detailValue}>{cardNumber}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Expiry Date</Text>
            <Text style={styles.detailValue}>{expiry}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>CVV</Text>
            <Text style={styles.detailValue}>819</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Status</Text>
            <Text style={[styles.detailValue, { color: isFrozen ? "#ff4e83" : "#14ed9e" }]}>
              {isFrozen ? "FROZEN" : "ACTIVE"}
            </Text>
          </View>
        </Animated.View>
      )}

      {/* Transaction list */}
      <Animated.View entering={FadeInUp.duration(400).delay(250)} style={styles.transactionsSection}>
        <Text style={styles.sectionTitle}>Recent Transactions</Text>
        <View style={styles.list}>
          {activities.map((item, i) => (
            <View key={item.id} style={styles.transactionCard}>
              <View style={styles.flexRow}>
                <View style={styles.iconBox}>
                  <Text style={{ fontSize: 20 }}>{item.icon}</Text>
                </View>
                <View>
                  <Text style={styles.itemTitle}>{item.title}</Text>
                  <Text style={styles.itemDate}>{item.timestamp}</Text>
                </View>
              </View>
              {item.amount && (
                <Text style={styles.amount}>-${item.amount.toFixed(2)}</Text>
              )}
            </View>
          ))}
        </View>
      </Animated.View>

      {/* Add Funds Modal */}
      <Modal
        visible={depositModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setDepositModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalIndicator} />
            <Text style={styles.modalTitle}>Deposit Funds</Text>
            <Text style={styles.modalSubtitle}>Load money onto your virtual card instantly</Text>
            
            {depositError && (
              <View style={styles.modalError}>
                <Text style={styles.modalErrorText}>{depositError}</Text>
              </View>
            )}

            <View style={styles.inputWrapper}>
              <Text style={styles.currencySymbol}>$</Text>
              <TextInput
                style={styles.depositInput}
                placeholder="0.00"
                placeholderTextColor="#4a4d58"
                keyboardType="numeric"
                value={depositAmount}
                onChangeText={setDepositAmount}
                autoFocus
                selectionColor="#14ed9e"
              />
            </View>

            {/* Quick selectors */}
            <View style={styles.quickSelectRow}>
              {["10", "20", "50", "100"].map((val) => (
                <TouchableOpacity
                  key={val}
                  style={styles.quickSelectBtn}
                  onPress={() => setDepositAmount(val)}
                >
                  <Text style={styles.quickSelectText}>+${val}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity 
              style={styles.modalCta} 
              onPress={handleDeposit}
              disabled={isDepositing}
            >
              {isDepositing ? (
                <ActivityIndicator color="#0d0e12" />
              ) : (
                <>
                  <Text style={styles.modalCtaText}>Deposit Instantly</Text>
                  <ArrowUpRight size={18} color="#0d0e12" strokeWidth={3} />
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.modalCancel} 
              onPress={() => {
                setDepositAmount("");
                setDepositError(null);
                setDepositModalVisible(false);
              }}
              disabled={isDepositing}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0d0e12" },
  scrollContent: { paddingHorizontal: 20, paddingTop: 64, paddingBottom: 100 },
  header: { marginBottom: 20 },
  title: { fontSize: 28, fontWeight: "bold", color: "#fcfcfc", fontFamily: "Manrope_800ExtraBold" },
  subtitle: { color: "#7e828d", fontSize: 13, marginTop: 4, fontFamily: "Manrope_400Regular" },

  balanceCard: {
    backgroundColor: "#15161d",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "#22232d",
    marginBottom: 20,
  },
  balanceLabel: {
    color: "#7e828d",
    fontSize: 10,
    fontFamily: "Manrope_800ExtraBold",
    letterSpacing: 1,
  },
  balanceAmount: {
    color: "#14ed9e",
    fontSize: 36,
    fontFamily: "Manrope_800ExtraBold",
    marginTop: 8,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.03)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 12,
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.08)",
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  badgeText: { color: "#7e828d", fontSize: 11, fontFamily: "Manrope_500Medium" },

  cardContainer: {
    width: "100%",
    marginBottom: 16,
  },
  cardInner: {
    width: "100%",
  },
  frozenOverlay: {
    opacity: 0.35,
  },
  frozenBadgeContainer: {
    position: "absolute",
    top: "40%",
    backgroundColor: "#ff4e83",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    shadowColor: "#ff4e83",
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 5,
  },
  frozenBadgeText: {
    color: "#0d0e12",
    fontSize: 13,
    fontFamily: "Manrope_800ExtraBold",
    letterSpacing: 0.5,
  },

  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    backgroundColor: "#15161d",
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#22232d",
    gap: 8,
  },
  actionIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  actionText: {
    color: "#fcfcfc",
    fontSize: 12,
    fontFamily: "Manrope_700Bold",
  },

  detailsCard: {
    backgroundColor: "#15161d",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#22232d",
    gap: 12,
    marginBottom: 24,
  },
  detailsTitle: {
    color: "#fcfcfc",
    fontSize: 14,
    fontFamily: "Manrope_700Bold",
    borderBottomWidth: 1,
    borderBottomColor: "#22232d",
    paddingBottom: 8,
    marginBottom: 4,
  },
  detailItem: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  detailLabel: {
    color: "#7e828d",
    fontSize: 12,
    fontFamily: "Manrope_500Medium",
  },
  detailValue: {
    color: "#fcfcfc",
    fontSize: 12,
    fontFamily: "Manrope_700Bold",
  },

  transactionsSection: {},
  sectionTitle: {
    color: "#fcfcfc",
    fontSize: 16,
    fontFamily: "Manrope_700Bold",
    marginBottom: 16,
  },
  list: { gap: 12 },
  transactionCard: {
    backgroundColor: "rgba(35, 36, 47, 0.6)",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  flexRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#23242f",
    alignItems: "center",
    justifyContent: "center",
  },
  itemTitle: {
    color: "#fcfcfc",
    fontSize: 14,
    fontFamily: "Manrope_600SemiBold",
    marginBottom: 2,
  },
  itemDate: {
    color: "#7e828d",
    fontSize: 12,
    fontFamily: "Manrope_400Regular",
  },
  amount: {
    color: "#fcfcfc",
    fontSize: 14,
    fontFamily: "Manrope_700Bold",
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
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
    fontSize: 20,
    fontFamily: "Manrope_800ExtraBold",
    textAlign: "center",
  },
  modalSubtitle: {
    color: "#7e828d",
    fontSize: 13,
    fontFamily: "Manrope_400Regular",
    textAlign: "center",
    marginTop: 6,
    marginBottom: 24,
  },
  modalError: {
    backgroundColor: "rgba(245, 34, 34, 0.1)",
    borderRadius: 10,
    padding: 10,
    marginBottom: 16,
    borderWidth: 0.5,
    borderColor: "rgba(245,34,34,0.2)",
  },
  modalErrorText: {
    color: "#ff4e83",
    fontSize: 12,
    textAlign: "center",
    fontFamily: "Manrope_500Medium",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0d0e12",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#22232d",
    paddingHorizontal: 20,
    height: 64,
    marginBottom: 16,
  },
  currencySymbol: {
    color: "#14ed9e",
    fontSize: 24,
    fontFamily: "Manrope_800ExtraBold",
    marginRight: 8,
  },
  depositInput: {
    flex: 1,
    color: "#fcfcfc",
    fontSize: 24,
    fontFamily: "Manrope_800ExtraBold",
    // @ts-ignore
    outlineStyle: "none",
  },
  quickSelectRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 24,
  },
  quickSelectBtn: {
    flex: 1,
    backgroundColor: "#23242f",
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  quickSelectText: {
    color: "#fcfcfc",
    fontSize: 13,
    fontFamily: "Manrope_600SemiBold",
  },
  modalCta: {
    backgroundColor: "#14ed9e",
    height: 54,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#14ed9e",
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  modalCtaText: {
    color: "#0d0e12",
    fontSize: 16,
    fontFamily: "Manrope_800ExtraBold",
  },
  modalCancel: {
    alignItems: "center",
    paddingVertical: 14,
    marginTop: 8,
  },
  modalCancelText: {
    color: "#7e828d",
    fontSize: 14,
    fontFamily: "Manrope_600SemiBold",
  },
});
