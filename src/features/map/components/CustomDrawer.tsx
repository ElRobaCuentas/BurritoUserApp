import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, Image, 
  Switch, Dimensions, TouchableWithoutFeedback, TextInput, 
  Modal, KeyboardAvoidingView, Platform, Alert, ActivityIndicator 
} from 'react-native';
import { useDrawerStore } from '../../../store/drawerStore';
import { useUserStore, AvatarId } from '../../../store/userStore';
import { useThemeStore } from '../../../store/themeStore'; 
import { COLORS } from '../../../shared/theme/colors';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import Animated, { 
  useSharedValue, useAnimatedStyle, withSpring, withTiming, 
  FadeIn, FadeOut, Layout 
} from 'react-native-reanimated';
import { TYPOGRAPHY } from '../../../shared/theme/typography';

// 🔥 IMPORTANTE: Importamos el servicio que actualizamos
import { MapService } from '../services/map_service';

const { width } = Dimensions.get('window');
const DRAWER_WIDTH = width * 0.72;

const AVATAR_IMAGES: Record<AvatarId, any> = {
  economista: require('../../../assets/ECONOMISTA.png'), 
  humanidades: require('../../../assets/HUMANIDADES.png'),
  ingeniero: require('../../../assets/INGENIERO.png'), 
  salud: require('../../../assets/SALUD.png'),
};

const AVATAR_LIST: { id: AvatarId; label: string }[] = [ 
  { id: 'ingeniero', label: 'Ing.' }, 
  { id: 'salud', label: 'Salud' }, 
  { id: 'economista', label: 'Econ.' }, 
  { id: 'humanidades', label: 'Hum.' } 
];

export const CustomDrawer = () => {
  const { isOpen, closeDrawer } = useDrawerStore() as any;
  const { username, avatar, setAvatar, logout } = useUserStore();
  const { isDarkMode, toggleTheme } = useThemeStore() as any; 

  const [isExpanding, setIsExpanding] = useState(false);
  
  // ✨ ESTADOS PARA FEEDBACK
  const [modalVisible, setModalVisible] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [isSending, setIsSending] = useState(false);

  const translateX = useSharedValue(-DRAWER_WIDTH - 50); 
  const backdropOpacity = useSharedValue(0);

  React.useEffect(() => {
    if (isOpen) {
      translateX.value = withSpring(0, { damping: 20, stiffness: 150, overshootClamping: true });
      backdropOpacity.value = withTiming(1, { duration: 300 });
    } else {
      translateX.value = withSpring(-DRAWER_WIDTH - 50, { damping: 20, stiffness: 150 });
      backdropOpacity.value = withTiming(0, { duration: 300 });
      setIsExpanding(false);
    }
  }, [isOpen]);

  const animatedDrawerStyle = useAnimatedStyle(() => ({ 
    transform: [{ translateX: translateX.value }], 
    opacity: translateX.value <= -DRAWER_WIDTH ? 0 : 1 
  }));

  const animatedBackdropStyle = useAnimatedStyle(() => ({ 
    opacity: backdropOpacity.value 
  }));

  const theme = { 
    bg: isDarkMode ? '#121212' : '#F4F7F9', 
    card: isDarkMode ? '#1E1E1E' : '#FFFFFF', 
    text: isDarkMode ? '#FFFFFF' : '#1A1A1A', 
    subText: isDarkMode ? '#A0A0A0' : '#666666', 
    headerGradient: isDarkMode ? ['#0F172A', '#1E293B'] : [COLORS.primary, '#00AEEF'] 
  };

  const availableAvatars = AVATAR_LIST.filter(item => item.id !== avatar);

  // 🔥 FUNCIÓN DE ENVÍO A FIREBASE
  const handleSendFeedback = async () => {
    if (rating === 0) {
      Alert.alert("Atención", "Por favor, selecciona una calificación con estrellas.");
      return;
    }

    setIsSending(true);
    const success = await MapService.sendFeedback({
      username: username || 'Anónimo',
      avatar: avatar || 'Estudiante',
      rating,
      mensaje: feedback,
    });

    if (success) {
      Alert.alert("¡Enviado!", "Tu opinión ha sido registrada con éxito.");
      setModalVisible(false);
      setRating(0);
      setFeedback("");
    } else {
      Alert.alert("Error", "No se pudo enviar el comentario. Intenta de nuevo.");
    }
    setIsSending(false);
  };

  return (
    <View style={styles.overlay} pointerEvents="box-none">
      <TouchableWithoutFeedback onPress={closeDrawer}>
        <Animated.View style={[styles.backdrop, animatedBackdropStyle, { display: isOpen ? 'flex' : 'none' }]} />
      </TouchableWithoutFeedback>
      
      <Animated.View style={[styles.drawerContainer, { backgroundColor: theme.bg }, animatedDrawerStyle]}>
        
        <LinearGradient colors={theme.headerGradient} style={styles.header}>
          <Text style={styles.brandText}>BURRITO UNMSM</Text>
        </LinearGradient>

        <View style={styles.avatarWrapper}>
          <View style={[styles.avatarContainer, { borderColor: theme.bg, backgroundColor: theme.card }]}>
            {avatar && AVATAR_IMAGES[avatar] ? (
              <Image source={AVATAR_IMAGES[avatar]} style={styles.avatarImage} />
            ) : (
              <Icon name="account" size={50} color={COLORS.primary} />
            )}
          </View>
        </View>

        <View style={styles.userInfo}>
          <Text style={[styles.userName, { color: theme.text }]}>{username || 'Sanmarquino'}</Text>
          <View style={[styles.facultyBadge, { backgroundColor: COLORS.primary + '20' }]}>
            <Icon name="school-outline" size={14} color={COLORS.primary} />
            <Text style={[styles.facultyText, { color: COLORS.primary }]}>
              {avatar ? avatar.toUpperCase() : 'ESTUDIANTE'}
            </Text>
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.bentoRow}>
            <View style={[styles.bentoCard, { backgroundColor: theme.card }]}>
              <View style={[styles.iconCircle, { backgroundColor: COLORS.primary + '15', marginBottom: 8 }]}>
                <Icon name={isDarkMode ? "weather-night" : "weather-sunny"} size={20} color={COLORS.primary} />
              </View>
              <Text style={[styles.bentoTitle, { color: theme.text }]}>Tema</Text>
              <Switch 
                style={{marginTop: 5, transform: [{ scale: 0.8 }]}} 
                value={isDarkMode} 
                onValueChange={toggleTheme} 
                trackColor={{ false: '#D1D1D1', true: COLORS.primary }} 
                thumbColor={isDarkMode ? COLORS.primary : "#f4f3f4"} 
              />
            </View>

            <TouchableOpacity 
              style={[styles.bentoCard, { backgroundColor: theme.card }]} 
              onPress={() => setModalVisible(true)}
            >
              <View style={[styles.iconCircle, { backgroundColor: '#FFD700' + '20', marginBottom: 8 }]}>
                <Icon name="star" size={20} color="#FFD700" />
              </View>
              <Text style={[styles.bentoTitle, { color: theme.text }]}>Opinar</Text>
              <Text style={[styles.bentoSubtitle, { color: COLORS.primary, marginTop: 10 }]}>Calificar App</Text>
            </TouchableOpacity>
          </View>

          <Animated.View layout={Layout.springify()} style={[styles.menuCard, { backgroundColor: theme.card, marginTop: 12 }]}>
            <TouchableOpacity style={styles.menuItemSpace} onPress={() => setIsExpanding(!isExpanding)}>
              <View style={styles.row}>
                <View style={[styles.iconCircle, { backgroundColor: COLORS.primary + '15' }]}>
                  <Icon name="account-edit-outline" size={20} color={COLORS.primary} />
                </View>
                <Text style={[styles.menuText, { color: theme.text }]}>Cambiar Avatar</Text>
              </View>
              <Icon name={isExpanding ? "chevron-up" : "chevron-down"} size={22} color={COLORS.primary} />
            </TouchableOpacity>

            {isExpanding && (
              <Animated.View entering={FadeIn.duration(300)} exiting={FadeOut.duration(200)} style={styles.avatarSelectionRow}>
                {availableAvatars.map((item) => (
                  <TouchableOpacity key={item.id} style={styles.avatarOption} onPress={() => { setAvatar(item.id); setIsExpanding(false); }}>
                    <View style={styles.smallAvatarCircle}><Image source={AVATAR_IMAGES[item.id]} style={styles.smallAvatarImg} /></View>
                    <Text style={[styles.smallAvatarLabel, { color: theme.subText }]}>{item.label}</Text>
                  </TouchableOpacity>
                ))}
              </Animated.View>
            )}
          </Animated.View>

          <TouchableOpacity 
            style={[styles.logoutButton, { backgroundColor: isDarkMode ? 'rgba(255,82,82,0.05)' : '#FFF5F5' }]} 
            onPress={() => { logout(); closeDrawer(); }}
          >
            <View style={styles.row}>
              <View style={[styles.iconCircle, { backgroundColor: 'rgba(255,82,82,0.1)' }]}>
                <Icon name="logout-variant" size={20} color="#FF5252" />
              </View>
              <Text style={styles.logoutText}>Cerrar Sesión</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.versionText, { color: theme.subText }]}>v.1.0</Text>
        </View>
      </Animated.View>

      {/* ✨ BOTTOM SHEET MODAL */}
      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{flex: 1}}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
              <View style={{flex: 1}} />
            </TouchableWithoutFeedback>
            
            <View style={[styles.bottomSheet, { backgroundColor: theme.bg }]}>
              <View style={styles.sheetHandle} />
              <Text style={[styles.sheetTitle, { color: theme.text }]}>¿Cómo puedo mejorar?</Text>
              
              <View style={styles.starsRowModal}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity key={star} onPress={() => setRating(star)}>
                    <Icon name={rating >= star ? "star" : "star-outline"} size={36} color={rating >= star ? "#FFD700" : theme.subText} />
                  </TouchableOpacity>
                ))}
              </View>

              <TextInput 
                style={[styles.feedbackInputModal, { backgroundColor: theme.card, color: theme.text }]} 
                placeholder="Escribe tus sugerencias aquí..." 
                placeholderTextColor={theme.subText} 
                multiline 
                numberOfLines={4}
                value={feedback} 
                onChangeText={setFeedback} 
              />
              
              <TouchableOpacity 
                style={[styles.sendBtnModal, { backgroundColor: isSending ? '#A0A0A0' : COLORS.primary }]} 
                onPress={handleSendFeedback}
                disabled={isSending}
              >
                {isSending ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <>
                    <Text style={styles.sendBtnText}>Enviar</Text>
                    <Icon name="check-circle-outline" size={18} color="#FFF" style={{marginLeft: 8}}/>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

    </View>
  );
};

const styles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, zIndex: 9999 },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
  drawerContainer: { 
    width: DRAWER_WIDTH, height: '100%', elevation: 25, 
    borderTopRightRadius: 25, borderBottomRightRadius: 25, 
    overflow: 'hidden', position: 'absolute', left: 0, top: 0, bottom: 0 
  },
  header: { height: 160, paddingTop: 40, alignItems: 'center' },
  brandText: { color: 'white', fontSize: 14, fontFamily: TYPOGRAPHY.primary.bold, opacity: 0.9, letterSpacing: 2, marginTop: 18 },  
  avatarWrapper: { alignItems: 'center', marginTop: -50, marginBottom: 10 },
  avatarContainer: { width: 100, height: 100, borderRadius: 50, borderWidth: 4, justifyContent: 'center', alignItems: 'center', elevation: 10 },
  avatarImage: { width: '100%', height: '100%', borderRadius: 50, resizeMode: 'cover' },
  userInfo: { alignItems: 'center', marginBottom: 25, paddingHorizontal: 10 },
  userName: { fontSize: 22, fontFamily: TYPOGRAPHY.primary.bold, textAlign: 'center' },
  facultyBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, marginTop: 6 },
  facultyText: { fontSize: 11, marginLeft: 5, fontFamily: TYPOGRAPHY.primary.bold, letterSpacing: 0.5 },
  content: { paddingHorizontal: 15, flex: 1, paddingBottom: 20 },
  bentoRow: { flexDirection: 'row', justifyContent: 'space-between' },
  bentoCard: { flex: 1, borderRadius: 18, padding: 15, elevation: 2, alignItems: 'center', marginHorizontal: 4 },
  bentoTitle: { fontFamily: TYPOGRAPHY.primary.bold, fontSize: 13 },
  bentoSubtitle: { fontFamily: TYPOGRAPHY.primary.semiBold, fontSize: 10 },
  menuCard: { borderRadius: 18, paddingHorizontal: 12, paddingVertical: 5, elevation: 2, overflow: 'hidden' },
  menuItemSpace: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10 },
  row: { flexDirection: 'row', alignItems: 'center' },
  iconCircle: { width: 38, height: 38, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  menuText: { marginLeft: 12, fontSize: 15, fontFamily: TYPOGRAPHY.primary.semiBold },
  avatarSelectionRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 15, paddingHorizontal: 5, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.05)' },
  avatarOption: { alignItems: 'center', width: '30%' },
  smallAvatarCircle: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#F0F0F0', overflow: 'hidden', borderWidth: 1, borderColor: '#DDD' },
  smallAvatarImg: { width: '100%', height: '100%', resizeMode: 'cover' },
  smallAvatarLabel: { fontSize: 10, fontFamily: TYPOGRAPHY.primary.bold, marginTop: 5 },
  logoutButton: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 15, marginTop: 'auto' },
  logoutText: { marginLeft: 12, fontSize: 15, color: '#FF5252', fontFamily: TYPOGRAPHY.primary.bold },
  footer: { paddingBottom: 15, alignItems: 'center' },
  versionText: { fontSize: 10, opacity: 0.5, fontFamily: TYPOGRAPHY.primary.bold },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  bottomSheet: { borderTopLeftRadius: 30, borderTopRightRadius: 30, paddingHorizontal: 25, paddingBottom: 40, paddingTop: 15, elevation: 20 },
  sheetHandle: { width: 40, height: 5, borderRadius: 5, backgroundColor: '#CCC', alignSelf: 'center', marginBottom: 20 },
  sheetTitle: { fontFamily: TYPOGRAPHY.primary.bold, fontSize: 18, textAlign: 'center', marginBottom: 15 },
  starsRowModal: { flexDirection: 'row', justifyContent: 'space-around', marginHorizontal: 20, marginBottom: 20 },
  feedbackInputModal: { borderRadius: 15, padding: 15, height: 100, textAlignVertical: 'top', fontFamily: TYPOGRAPHY.primary.regular, fontSize: 14, marginBottom: 20 },
  sendBtnModal: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 15, borderRadius: 15 },
  sendBtnText: { color: 'white', fontFamily: TYPOGRAPHY.primary.bold, fontSize: 15 }
});