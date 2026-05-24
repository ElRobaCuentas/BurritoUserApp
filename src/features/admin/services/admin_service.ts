import { firebaseDatabase } from '../../../shared/config/firebase';
import auth from '@react-native-firebase/auth';
import firebase from '@react-native-firebase/app';

export interface Chofer {
  dni: string;
  nombre: string;
  apellidos: string;
  activo: boolean;
}

const CHOFERES_PATH = '/choferes';

export const AdminService = {
  // 1. Escuchar lista de choferes en tiempo real
  subscribeToChoferes: (onUpdate: (choferes: Chofer[]) => void) => {
    const ref = firebaseDatabase.ref(CHOFERES_PATH);
    const onValueChange = ref.on('value', (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        onUpdate([]);
        return;
      }
      // Mapear el objeto de Firebase a un array, usando la llave (nodo) como el DNI
      const parsed = Object.keys(data).map(key => ({
        dni: key,
        ...data[key]
      }));
      onUpdate(parsed);
    });
    return () => ref.off('value', onValueChange);
  },

  // 2. Crear Chofer (Auth + Realtime Database)
  // 2. Crear Chofer (Auth + Realtime Database)
  createChofer: async (chofer: Omit<Chofer, 'activo'>) => {
    const ref = firebaseDatabase.ref(`${CHOFERES_PATH}/${chofer.dni}`);
    
    // Validación de unicidad
    const snapshot = await ref.once('value');
    if (snapshot.exists()) {
      throw new Error('Ya existe un conductor registrado con este DNI.');
    }

    const email = `${chofer.dni}@burritodriver.com`;
    const password = chofer.dni; // Contraseña por defecto

    // Instancia secundaria de Firebase declarada como 'any' para evitar quejas de tipos
    const config = firebase.app().options;
    let secondaryApp: any;
    try {
      secondaryApp = firebase.app('SecondaryApp');
    } catch (e) {
      secondaryApp = firebase.initializeApp(config, 'SecondaryApp');
    }

    try {
      // Sintaxis correcta para apps secundarias en React Native Firebase:
      const secondaryAuth = auth(secondaryApp);

      // 1. Crear en Auth usando la instancia secundaria
      await secondaryAuth.createUserWithEmailAndPassword(email, password);
      // Deslogueamos la app fantasma de inmediato
      await secondaryAuth.signOut();

      // 2. Guardar en Base de Datos Realtime
      await ref.set({
        nombre: chofer.nombre.trim(),
        apellidos: chofer.apellidos.trim(),
        activo: true
      });
      return true;
    } catch (error: any) {
      throw new Error(`Error de autenticación: ${error.message}`);
    }
  },

  // 3. Toggle Activo / Inactivo
  toggleChoferStatus: async (dni: string, currentStatus: boolean) => {
    try {
      await firebaseDatabase.ref(`${CHOFERES_PATH}/${dni}`).update({
        activo: !currentStatus
      });
      return true;
    } catch (error) {
      console.error('Error actualizando estado del chofer:', error);
      return false;
    }
  }
};