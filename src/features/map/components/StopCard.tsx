import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS } from '../../../shared/theme/colors';
import { TYPOGRAPHY } from '../../../shared/theme/typography';
// 🔥 IMPORTAMOS REANIMATED Y LINEAR GRADIENT PARA EL SKELETON
import Animated, { FadeIn, FadeOut, useSharedValue, useAnimatedStyle, withRepeat, withTiming, interpolate } from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import { useThemeStore } from '../../../store/themeStore'; // Para adaptar el Skeleton al modo oscuro

interface Props {
  title: string;
  onClose: () => void;
}

// ==========================================
// 🦴 COMPONENTE SKELETON INTERNO
// ==========================================
const Skeleton = ({ isDarkMode }: { isDarkMode: boolean }) => {
  const shimmerValue = useSharedValue(-1);

  useEffect(() => {
    shimmerValue.value = withRepeat(
      withTiming(1, { duration: 1200 }),
      -1, 
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    // Movemos el brillo de izquierda a derecha en un ancho de 200px (aprox el ancho de la tarjeta)
    const translateX = interpolate(shimmerValue.value, [-1, 1], [-200, 200]);
    return { transform: [{ translateX }] };
  });

  const theme = {
    bgBase: isDarkMode ? '#2A2A2A' : '#E0E0E0', // Gris base del skeleton
    shimmer: isDarkMode 
      ? ['transparent', 'rgba(255,255,255,0.08)', 'transparent'] 
      : ['transparent', 'rgba(255,255,255,0.8)', 'transparent']
  };

  return (
    <View style={styles.skeletonContent}>
      {/* 🦴 Barra del Label (Paradero UNMSM) */}
      <View style={[styles.skeletonBar, { width: 80, height: 10, backgroundColor: theme.bgBase, marginBottom: 8 }]} />
      {/* 🦴 Barra del Título (Nombre del paradero) */}
      <View style={[styles.skeletonBar, { width: 120, height: 16, backgroundColor: theme.bgBase }]} />

      {/* ✨ El Brillo Animado */}
      <Animated.View style={[StyleSheet.absoluteFill, animatedStyle]}>
        <LinearGradient
          colors={theme.shimmer}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
};

// ==========================================
// 💳 TARJETA PRINCIPAL
// ==========================================
export const StopCard = ({ title, onClose }: Props) => {
  const [isLoading, setIsLoading] = useState(true);
  const { isDarkMode } = useThemeStore() as any;

  // ⏱️ Simulamos el tiempo de carga de la base de datos (600ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, [title]); // Si el título cambia (tocan otro paradero rápido), vuelve a cargar

  // Colores dinámicos para la tarjeta real
  const cardBg = isDarkMode ? '#1E1E1E' : '#FFFFFF';
  const textColor = isDarkMode ? '#FFFFFF' : '#2C3E50';
  const iconColor = isDarkMode ? '#666' : '#999';

  return (
    <TouchableOpacity 
      activeOpacity={0.85} 
      onPress={onClose} 
      style={[styles.cardContainer, { backgroundColor: cardBg }]}
    >
      {/* 🔥 SWITCH ANIMADO ENTRE SKELETON Y CONTENIDO REAL */}
      {isLoading ? (
        <Animated.View 
          key="skeleton"
          exiting={FadeOut.duration(200)} // El skeleton desaparece rápido
          style={styles.contentWrapper}
        >
          <Skeleton isDarkMode={isDarkMode} />
        </Animated.View>
      ) : (
        <Animated.View 
          key="content"
          entering={FadeIn.duration(300)} // El texto aparece suavemente
          style={styles.contentWrapper}
        >
          <View style={styles.content}>
            <Text style={styles.label}>Paradero UNMSM</Text>
            <Text style={[styles.title, { color: textColor }]} numberOfLines={2}>{title}</Text>
          </View>
        </Animated.View>
      )}
      
      {/* La 'X' siempre está visible, incluso durante la carga */}
      <View style={styles.closeBtn}>
        <Icon name="close-circle" size={24} color={iconColor} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: 16,
    paddingHorizontal: 15,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    width: 200, // Lo amplié un poquitito (de 180 a 200) para que entren nombres largos sin amontonarse
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  contentWrapper: {
    flex: 1, // Esto asegura que tanto el skeleton como el texto ocupen el mismo espacio
  },
  content: { flex: 1, justifyContent: 'center' },
  label: {
    fontSize: 10,
    color: COLORS.primary,
    fontFamily: TYPOGRAPHY.primary.bold,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 2,
  },
  title: {
    fontSize: 15, // Ajustado ligeramente para mejor lectura en 2 líneas
    fontFamily: TYPOGRAPHY.primary.semiBold,
    letterSpacing: -0.3,
  },
  closeBtn: { 
    marginLeft: 10,
    opacity: 0.8 
  },
  // 🦴 ESTILOS DEL SKELETON
  skeletonContent: {
    flex: 1,
    justifyContent: 'center',
    overflow: 'hidden', // Para que el brillo no se salga de las barras
  },
  skeletonBar: {
    borderRadius: 4,
  }
});