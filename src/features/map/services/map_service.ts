import { firebaseDatabase } from "../../../shared/config/firebase";
import { BurritoLocation } from "../types";
import database from '@react-native-firebase/database';

interface FeedbackData {
  username: string;
  avatar:   string;
  rating:   number;
  mensaje:  string;
  uid:      string;   // ← NUEVO
  email:    string;   // ← NUEVO
}

const BURRITO_LOCATION_PATH = '/ubicacion_burrito';
const FEEDBACK_PATH = '/comentarios';

export const MapService = {

    subscribeToBusLocation: (onLocationUpdate: (location: BurritoLocation) => void) => {
        const ref = firebaseDatabase.ref(BURRITO_LOCATION_PATH);

        const onValueChange = ref.on('value', (snapshot) => {
            const data = snapshot.val();
            if (!data) return;

            const safeLocation: BurritoLocation = {
                latitude: data.latitude ?? 0,
                longitude: data.longitude ?? 0,
                heading: data.heading ?? 0,
                isActive: data.isActive ?? false,
                timestamp: data.timestamp ?? Date.now()
            };

            onLocationUpdate(safeLocation);
        });

        return () => ref.off('value', onValueChange);
    },

    sendFeedback: async (data: FeedbackData) => {
        try {
            const feedbackRef = firebaseDatabase.ref(FEEDBACK_PATH).push();
            
            await feedbackRef.set({
                ...data,
                // 🔥 QA FIX: Usamos el reloj atómico del servidor de Google
                timestamp: database.ServerValue.TIMESTAMP, 
            });
            
            return true;
        } catch (error) {
            console.error('Error al enviar feedback:', error);
            return false;
        }
    }
};