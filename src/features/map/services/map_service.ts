import { firebaseDatabase } from "../../../shared/config/firebase";
import { BurritoLocation } from "../types";

// Definimos la interfaz para los comentarios aquí mismo para que sea clara
interface FeedbackData {
  username: string;
  avatar: string;
  rating: number;
  mensaje: string;
}

const BURRITO_LOCATION_PATH = '/ubicacion_burrito';
const FEEDBACK_PATH = '/comentarios'; // 👈 El nuevo nodo en tu Realtime Database

export const MapService = {

    /**
     * Suscripción en tiempo real a la ubicación del bus
     */
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

    /**
     * ✨ NUEVO: Envío de comentarios y calificación a Firebase
     * Usa .push() para crear una lista de comentarios sin borrar los anteriores
     */
    sendFeedback: async (data: FeedbackData) => {
        try {
            // Creamos una referencia única dentro del nodo de comentarios
            const feedbackRef = firebaseDatabase.ref(FEEDBACK_PATH).push();
            
            await feedbackRef.set({
                ...data,
                timestamp: Date.now(), // Fecha de envío
            });
            
            return true;
        } catch (error) {
            console.error('Error al enviar feedback:', error);
            return false;
        }
    }
};