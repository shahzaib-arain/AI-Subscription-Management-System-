import { useState, useEffect, useMemo } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, useWindowDimensions } from "react-native";
import { useRouter } from "expo-router";
import Animated, { 
  FadeIn, 
  FadeOut, 
  SlideInRight, 
  SlideOutLeft, 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  withDelay, 
  Easing,
} from "react-native-reanimated";
import { ShieldAlert, PauseCircle, Trash2, ChevronRight } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { BlurView } from "expo-blur";

const slides = [
  {
    icon: ShieldAlert,
    title: "AI Fraud Detection",
    description: "Proactively monitor your accounts with advanced AI that blocks suspicious transactions before they happen.",
    color: "#14ed9e"
  },
  {
    icon: PauseCircle,
    title: "Pause Payments",
    description: "Temporarily pause any recurring subscriptions with a single tap. Resume whenever you're ready.",
    color: "#4e83ff"
  },
  {
    icon: Trash2,
    title: "Cancel Subscriptions",
    description: "Say goodbye to annoying cancellation flows. We forcefully cancel unwanted subscriptions on your behalf.",
    color: "#ff4e83"
  }
];

const FluidBackground = () => {
  const { width: winWidth, height: winHeight } = useWindowDimensions();
  
  const b1X = useSharedValue(winWidth * 0.1);
  const b1Y = useSharedValue(winHeight * 0.2);
  const b2X = useSharedValue(winWidth * 0.7);
  const b2Y = useSharedValue(winHeight * 0.6);

  useEffect(() => {
    b1X.value = withRepeat(withTiming(winWidth * 0.6, { duration: 8000, easing: Easing.inOut(Easing.sin) }), -1, true);
    b1Y.value = withRepeat(withTiming(winHeight * 0.5, { duration: 10000, easing: Easing.inOut(Easing.sin) }), -1, true);
    b2X.value = withRepeat(withTiming(winWidth * 0.2, { duration: 9000, easing: Easing.inOut(Easing.sin) }), -1, true);
    b2Y.value = withRepeat(withTiming(winHeight * 0.3, { duration: 11000, easing: Easing.inOut(Easing.sin) }), -1, true);
  }, []);

  const b1Style = useAnimatedStyle(() => ({
    transform: [{ translateX: b1X.value }, { translateY: b1Y.value }],
  }));

  const b2Style = useAnimatedStyle(() => ({
    transform: [{ translateX: b2X.value }, { translateY: b2Y.value }],
  }));

  return (
    <View style={StyleSheet.absoluteFill}>
      <Animated.View style={[styles.blob, { backgroundColor: "rgba(20, 237, 158, 0.12)" }, b1Style]} />
      <Animated.View style={[styles.blob, { backgroundColor: "rgba(78, 131, 255, 0.12)", width: 400, height: 400 }, b2Style]} />
      <BlurView intensity={20} style={StyleSheet.absoluteFill} tint="dark" />
    </View>
  );
};

export default function SplashPage() {
  const router = useRouter();
  const [showIntro, setShowIntro] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const logoScale = useSharedValue(0.9);
  const titleOpacity = useSharedValue(0);

  useEffect(() => {
    logoScale.value = withRepeat(withTiming(1.05, { duration: 2500, easing: Easing.inOut(Easing.ease) }), -1, true);
    titleOpacity.value = withDelay(600, withTiming(1, { duration: 1200 }));

    const timer = setTimeout(() => {
      setShowIntro(false);
    }, 3500);
    return () => clearTimeout(timer);
  }, []);

  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
  }));

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (currentSlide === slides.length - 1) {
      router.replace("/auth/login");
    } else {
      setCurrentSlide((prev) => prev + 1);
    }
  };

  const handleSkip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.replace("/auth/login");
  };

  return (
    <View style={styles.container}>
      <FluidBackground />
      
      {showIntro ? (
        <Animated.View 
          entering={FadeIn.duration(1200)} 
          exiting={FadeOut.duration(800)} 
          style={styles.introContainer}
        >
          <Animated.View style={[styles.logoContainer, logoStyle]}>
            <Image 
              source={require("../assets/images/logo.png")} 
              style={styles.logoImage}
              contentFit="contain"
            />
          </Animated.View>
          <Animated.View style={{ opacity: titleOpacity }}>
             <Text style={styles.title}>Dream Studio</Text>
             <Text style={styles.subtitle}>Your financial future, designed.</Text>
          </Animated.View>
        </Animated.View>
      ) : (
        <Animated.View entering={FadeIn.duration(800)} style={styles.onboardingContainer}>
          <View style={styles.header}>
            <TouchableOpacity onPress={handleSkip} style={styles.skipBtn}>
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.carouselContainer}>
             <Animated.View 
               key={currentSlide} 
               entering={SlideInRight.springify().damping(18).stiffness(90)} 
               exiting={FadeOut.duration(250)}
               style={styles.slideCenter}
             >
                <View style={[styles.iconContainer, { shadowColor: slides[currentSlide].color }]}>
                   <LinearGradient
                     colors={[slides[currentSlide].color, "rgba(255,255,255,0.05)"]}
                     style={styles.iconGradient}
                   >
                      {(() => {
                        const Icon = slides[currentSlide].icon;
                        return <Icon size={44} color="#0d0e12" strokeWidth={2.5} />;
                      })()}
                   </LinearGradient>
                </View>
                <Text style={styles.slideTitle}>{slides[currentSlide].title}</Text>
                <Text style={styles.slideDesc}>{slides[currentSlide].description}</Text>
             </Animated.View>
          </View>

          <View style={styles.bottomContainer}>
             <View style={styles.paginationWrapper}>
                {slides.map((_, i) => (
                  <View 
                    key={i} 
                    style={[
                      styles.dotBase, 
                      i === currentSlide ? { width: 32, backgroundColor: slides[i].color } : { width: 8, backgroundColor: "rgba(255,255,255,0.1)" }
                    ]} 
                  />
                ))}
             </View>
             
             <TouchableOpacity 
               style={[styles.nextButton, { backgroundColor: slides[currentSlide].color }]} 
               onPress={handleNext} 
               activeOpacity={0.8}
             >
                <Text style={styles.nextButtonText}>
                  {currentSlide === slides.length - 1 ? "Get Started" : "Next"}
                </Text>
                <ChevronRight size={20} color="#0d0e12" strokeWidth={3} />
             </TouchableOpacity>
          </View>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#06070a" },
  blob: {
    position: "absolute",
    width: 350,
    height: 350,
    borderRadius: 200,
    opacity: 0.5,
  },
  introContainer: { flex: 1, alignItems: "center", justifyContent: "center" },
  logoContainer: { 
    width: 160, 
    height: 160, 
    marginBottom: 40,
    shadowColor: "#14ed9e",
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.4,
    shadowRadius: 30,
    elevation: 20,
  },
  logoImage: { 
    width: "100%", 
    height: "100%", 
  },
  title: { fontSize: 44, fontWeight: "900", color: "#fcfcfc", textAlign: "center", letterSpacing: -1.5 },
  subtitle: { fontSize: 18, color: "rgba(255,255,255,0.5)", marginTop: 12, textAlign: "center", fontWeight: "400" },
  onboardingContainer: { flex: 1, paddingHorizontal: 30, paddingTop: 60, paddingBottom: 60 },
  header: { alignItems: "flex-end", marginBottom: 20 },
  skipBtn: { padding: 10, backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 12 },
  skipText: { color: "rgba(255,255,255,0.6)", fontSize: 15, fontWeight: "600" },
  carouselContainer: { flex: 1, justifyContent: "center" },
  slideCenter: { alignItems: "center" },
  iconContainer: { 
    width: 120, 
    height: 120, 
    borderRadius: 40, 
    marginBottom: 48,
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.5,
    shadowRadius: 28,
    elevation: 25,
  },
  iconGradient: { 
    flex: 1, 
    borderRadius: 40, 
    alignItems: "center", 
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.15)"
  },
  slideTitle: { fontSize: 34, fontWeight: "800", color: "#fcfcfc", marginBottom: 20, textAlign: "center", letterSpacing: -0.5 },
  slideDesc: { fontSize: 18, color: "rgba(255,255,255,0.6)", textAlign: "center", lineHeight: 30, paddingHorizontal: 15 },
  bottomContainer: { 
    flexDirection: "row", 
    alignItems: "center", 
    justifyContent: "space-between",
  },
  paginationWrapper: { flexDirection: "row", gap: 8 },
  dotBase: { height: 8, borderRadius: 4 },
  nextButton: { 
    flexDirection: "row",
    height: 64, 
    paddingHorizontal: 28, 
    borderRadius: 22, 
    alignItems: "center", 
    justifyContent: "center",
    gap: 10,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
  },
  nextButtonText: { color: "#0d0e12", fontSize: 19, fontWeight: "800" }
});
