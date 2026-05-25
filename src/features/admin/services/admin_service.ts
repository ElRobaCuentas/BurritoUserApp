import { firebaseDatabase } from '../../../shared/config/firebase';
import auth from '@react-native-firebase/auth';
import firebase from '@react-native-firebase/app';

export interface Chofer {
  dni: string;
  nombre: string;
  apellidos: string;
  activo: boolean;
}

export interface Bus {
  placa: string;
  modelo: string;
  marca: string;
  anio: string;
  activo: boolean;
}

const CHOFERES_PATH = '/choferes';
const BUSES_PATH = '/buses';

export const AdminService = {
  // ============================
  // GESTIÓN DE CHOFERES
  // ============================
  
  // 1. Escuchar lista de choferes en tiempo real
  subscribeToChoferes: (onUpdate: (choferes: Chofer[]) => void) => {
    const ref = firebaseDatabase.ref(CHOFERES_PATH);
    const onValueChange = ref.on(
      'value', 
      (snapshot) => {
        const data = snapshot.val();
        if (!data) {
          onUpdate([]);
          return;
        }
        const parsed = Object.keys(data).map(key => ({
          dni: key,
          ...data[key]
        }));
        onUpdate(parsed);
      },
      // CAMBIO QUIRÚRGICO: Interceptar el error silenciado
      (error) => {
        console.error('[Firebase Error - Choferes]:', error);
        onUpdate([]); // Libera el spinner infinito enviando una lista vacía temporal
      }
    );
    return () => ref.off('value', onValueChange);
  },

  // 2. Crear Chofer (Auth + Realtime Database)
  createChofer: async (chofer: Omit<Chofer, 'activo'>) => {
    const ref = firebaseDatabase.ref(`${CHOFERES_PATH}/${chofer.dni}`);
    
    const snapshot = await ref.once('value');
    if (snapshot.exists()) {
      throw new Error('Ya existe un conductor registrado con este DNI.');
    }

    const email = `${chofer.dni}@burritodriver.com`;
    const password = chofer.dni; 

    const config = firebase.app().options;
    let secondaryApp: any;
    try {
      secondaryApp = firebase.app('SecondaryApp');
    } catch (e) {
      secondaryApp = firebase.initializeApp(config, 'SecondaryApp');
    }

    try {
      const secondaryAuth = auth(secondaryApp);
      await secondaryAuth.createUserWithEmailAndPassword(email, password);
      await secondaryAuth.signOut();

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
  },

  // ============================
  // GESTIÓN DE BUSES
  // ============================

  // 1. Escuchar lista de buses en tiempo real
  subscribeToBuses: (onUpdate: (buses: Bus[]) => void) => {
    const ref = firebaseDatabase.ref(BUSES_PATH);
    const onValueChange = ref.on(
      'value', 
      (snapshot) => {
        const data = snapshot.val();
        if (!data) {
          onUpdate([]);
          return;
        }
        const parsed = Object.keys(data).map(key => ({
          placa: key,
          ...data[key]
        }));
        onUpdate(parsed);
      },
      // CAMBIO QUIRÚRGICO: Interceptar el error silenciado
      (error) => {
        console.error('[Firebase Error - Buses]:', error);
        onUpdate([]); // Libera el spinner infinito enviando una lista vacía temporal
      }
    );
    return () => ref.off('value', onValueChange);
  },

  // 2. Crear Bus
  createBus: async (busData: Omit<Bus, 'activo'>) => {
    const placaKey = busData.placa.toUpperCase().trim();
    const ref = firebaseDatabase.ref(`${BUSES_PATH}/${placaKey}`);
    
    const snapshot = await ref.once('value');
    if (snapshot.exists()) {
      throw new Error('Ya existe un bus registrado con esta placa.');
    }

    await ref.set({
      modelo: busData.modelo.trim(),
      marca: busData.marca.trim(),
      anio: busData.anio.trim(),
      activo: true
    });
    return true;
  },

  // 3. Toggle Activo / Inactivo Bus
  toggleBusStatus: async (placa: string, currentStatus: boolean) => {
    try {
      await firebaseDatabase.ref(`${BUSES_PATH}/${placa}`).update({
        activo: !currentStatus
      });
      return true;
    } catch (error) {
      console.error('Error actualizando estado del bus:', error);
      return false;
    }
  }
};