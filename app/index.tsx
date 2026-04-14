import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import Animated, { FadeIn, FadeOut, SlideInRight, SlideOutLeft } from "react-native-reanimated";
import { ShieldAlert, PauseCircle, Trash2, ArrowRight } from "lucide-react-native";

const slides = [
  {
    icon: ShieldAlert,
    title: "AI Fraud Detection",
    description: "Proactively monitor your accounts with advanced AI that blocks suspicious transactions before they happen."
  },
  {
    icon: PauseCircle,
    title: "Pause Payments",
    description: "Temporarily pause any recurring subscriptions with a single tap. Resume whenever you're ready."
  },
  {
    icon: Trash2,
    title: "Cancel Subscriptions",
    description: "Say goodbye to annoying cancellation flows. We forcefully cancel unwanted subscriptions on your behalf."
  }
];

export default function SplashPage() {
  const router = useRouter();
  const [showIntro, setShowIntro] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowIntro(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  const handleNext = () => {
    if (currentSlide === slides.length - 1) {
      router.replace("/auth/login");
    } else {
      setCurrentSlide((prev) => prev + 1);
    }
  };

  return (
    <View style={styles.container}>
      {showIntro ? (
        <Animated.View 
          entering={FadeIn.duration(800).springify()} 
          exiting={FadeOut.duration(400)} 
          style={styles.introContainer}
        >
          <Animated.View entering={SlideInRight.springify().damping(12)} style={styles.logoContainer}>
            <Text style={styles.logoText}>FS</Text>
          </Animated.View>
          <Animated.View entering={FadeIn.delay(300).springify()} style={styles.centerText}>
             <Text style={styles.title}>Dream Studio</Text>
             <Text style={styles.subtitle}>Your financial future, designed.</Text>
          </Animated.View>
        </Animated.View>
      ) : (
        <Animated.View entering={FadeIn.duration(400)} style={styles.onboardingContainer}>
          <View style={styles.skipContainer}>
            <TouchableOpacity onPress={() => router.replace("/auth/login")}>
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.carouselContainer}>
             <Animated.View 
               key={currentSlide} 
               entering={SlideInRight.springify().damping(14).stiffness(120)} 
               exiting={SlideOutLeft.duration(300)}
               style={styles.slideCenter}
             >
                {(() => {
                   const Icon = slides[currentSlide].icon;
                   return (
                     <View style={styles.iconContainer}>
                        <Icon size={48} color="#0d0e12" />
                     </View>
                   );
                })()}
                <Text style={styles.slideTitle}>{slides[currentSlide].title}</Text>
                <Text style={styles.slideDesc}>{slides[currentSlide].description}</Text>
             </Animated.View>
          </View>

          <View style={styles.bottomContainer}>
             <View style={styles.dotsRow}>
                {slides.map((_, i) => (
                  <Animated.View 
                    key={i} 
                    style={[styles.dot, i === currentSlide ? styles.dotActive : styles.dotInactive]} 
                  />
                ))}
             </View>
             <TouchableOpacity style={styles.nextButton} onPress={handleNext} activeOpacity={0.7}>
                <Text style={styles.nextButtonText}>
                  {currentSlide === slides.length - 1 ? "Get Started" : "Next"}
                </Text>
             </TouchableOpacity>
          </View>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0d0e12", paddingTop: 80, paddingBottom: 40, paddingHorizontal: 24 },
  introContainer: { flex: 1, alignItems: "center", justifyContent: "center" },
  logoContainer: { width: 96, height: 96, borderRadius: 24, backgroundColor: "#14ed9e", alignItems: "center", justifyContent: "center", marginBottom: 24 },
  logoText: { color: "#0d0e12", fontSize: 36, fontWeight: "bold" },
  centerText: { alignItems: "center" },
  title: { fontSize: 32, fontWeight: "bold", color: "#fcfcfc" },
  subtitle: { fontSize: 14, color: "#7e828d", marginTop: 8 },
  onboardingContainer: { flex: 1 },
  skipContainer: { alignItems: "flex-end", marginBottom: 40 },
  skipText: { color: "#7e828d", fontWeight: "600" },
  carouselContainer: { flex: 1, alignItems: "center", justifyContent: "center", marginTop: -40 },
  slideCenter: { alignItems: "center", width: 280 },
  iconContainer: { width: 96, height: 96, borderRadius: 24, backgroundColor: "#14ed9e", alignItems: "center", justifyContent: "center", marginBottom: 32 },
  slideTitle: { fontSize: 24, fontWeight: "bold", color: "#fcfcfc", marginBottom: 12 },
  slideDesc: { fontSize: 14, color: "#7e828d", textAlign: "center", lineHeight: 22 },
  bottomContainer: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: "auto" },
  dotsRow: { flexDirection: "row", gap: 8 },
  dot: { height: 6, borderRadius: 3 },
  dotActive: { width: 24, backgroundColor: "#14ed9e" },
  dotInactive: { width: 6, backgroundColor: "#24252e" },
  nextButton: { backgroundColor: "#14ed9e", height: 48, paddingHorizontal: 24, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  nextButtonText: { color: "#0d0e12", fontWeight: "600" }
});
