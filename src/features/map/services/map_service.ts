import { firebaseDatabase } from "../../../shared/config/firebase";
import { BurritoLocation } from "../types";
import database from '@react-native-firebase/database';

interface FeedbackData {
  username: string;
  avatar:   string;
  rating:   number;
  mensaje:  string;
  uid:      string;   
  email:    string;  
}

const BUSES_LOCATION_PATH = '/ubicacion_buses';
const FEEDBACK_PATH = '/comentarios';

export const MapService = {

    subscribeToBusLocations: (onUpdate: (locations: Record<string, BurritoLocation>) => void) => {
        const ref = firebaseDatabase.ref(BUSES_LOCATION_PATH);

        const onValueChange = ref.on('value', (snapshot) => {
            const data = snapshot.val();
            if (!data) return;

            const locations: Record<string, BurritoLocation> = {};
            Object.keys(data).forEach((placa) => {
                const entry = data[placa];
                if (!entry) return;
                locations[placa] = {
                    latitude: entry.latitude ?? 0,
                    longitude: entry.longitude ?? 0,
                    heading: entry.heading ?? 0,
                    isActive: entry.isActive ?? false,
                    timestamp: entry.timestamp ?? Date.now(),
                };
            });

            onUpdate(locations);
        });

        return () => ref.off('value', onValueChange);
    },

    sendFeedback: async (data: FeedbackData) => {
        try {
            const feedbackRef = firebaseDatabase.ref(FEEDBACK_PATH).push();
            
            await feedbackRef.set({
                ...data,
                timestamp: database.ServerValue.TIMESTAMP, 
            });
            
            return true;
        } catch (error) {
            console.error('Error al enviar feedback:', error);
            return false;
        }
    }
};