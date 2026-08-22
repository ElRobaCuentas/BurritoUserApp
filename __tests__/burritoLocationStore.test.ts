import { BurritoLocation } from '../src/features/map/types';

jest.mock('../src/features/map/services/map_service', () => ({
  MapService: {
    subscribeToBusLocations: jest.fn(() => jest.fn()),
  },
}));

import { MapService } from '../src/features/map/services/map_service';
import { useBurritoStore, MOVEMENT_THRESHOLD_M } from '../src/store/burritoLocationStore';

const baseLocation: BurritoLocation = {
  latitude: -12.0575,
  longitude: -77.0830,
  heading: 0,
  isActive: true,
  timestamp: 1000,
};

describe('burritoLocationStore - filtro de aduana', () => {
  let onUpdate: (locations: Record<string, BurritoLocation>) => void;

  beforeEach(() => {
    jest.useFakeTimers();
    useBurritoStore.getState().actions.stopTracking();
    useBurritoStore.setState({ locations: {}, busMovementStates: {}, movementDisplacements: {}, movementMemory: {}, isConnecting: false, connectionError: false });
    jest.clearAllMocks();

    useBurritoStore.getState().actions.startTracking();

    const mockSubscribe = MapService.subscribeToBusLocations as jest.Mock;
    onUpdate = mockSubscribe.mock.calls[0][0];
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('debería almacenar la primera recepción de datos', () => {
    onUpdate({
      'ABC-123': { ...baseLocation, timestamp: 1000 },
    });

    const state = useBurritoStore.getState();
    expect(state.locations['ABC-123']).toBeDefined();
    expect(state.locations['ABC-123'].timestamp).toBe(1000);
  });

  test('debería rechazar un timestamp más viejo que el almacenado para la misma placa', () => {
    onUpdate({ 'ABC-123': { ...baseLocation, timestamp: 2000 } });
    expect(useBurritoStore.getState().locations['ABC-123'].timestamp).toBe(2000);

    onUpdate({ 'ABC-123': { ...baseLocation, timestamp: 1500 } });
    expect(useBurritoStore.getState().locations['ABC-123'].timestamp).toBe(2000);
  });

  test('debería aceptar un timestamp más nuevo para la misma placa', () => {
    onUpdate({ 'ABC-123': { ...baseLocation, timestamp: 1000 } });
    onUpdate({ 'ABC-123': { ...baseLocation, timestamp: 3000 } });

    expect(useBurritoStore.getState().locations['ABC-123'].timestamp).toBe(3000);
  });

  test('debería aceptar una placa nueva aunque su timestamp sea antiguo', () => {
    onUpdate({ 'ABC-123': { ...baseLocation, timestamp: 2000 } });
    onUpdate({ 'XYZ-789': { ...baseLocation, timestamp: 500 } });

    const state = useBurritoStore.getState();
    expect(state.locations['XYZ-789'].timestamp).toBe(500);
  });

  test('debería mantener los datos de placas no afectadas al actualizar otra', () => {
    onUpdate({ 'ABC-123': { ...baseLocation, timestamp: 1000 } });
    onUpdate({ 'XYZ-789': { ...baseLocation, timestamp: 500 } });
    onUpdate({ 'ABC-123': { ...baseLocation, timestamp: 2000 } });

    const state = useBurritoStore.getState();
    expect(state.locations['ABC-123'].timestamp).toBe(2000);
    expect(state.locations['XYZ-789'].timestamp).toBe(500);
  });

  test('debería calcular busMovementStates para cada placa', () => {
    const dateSpy = jest.spyOn(Date, 'now').mockReturnValue(5000);

    onUpdate({
      'ABC-123': { ...baseLocation, timestamp: 2000, isActive: true },
      'XYZ-789': { ...baseLocation, timestamp: 1000, isActive: false },
    });

    const state = useBurritoStore.getState();
    expect(state.busMovementStates['ABC-123']).toBe('moving');
    expect(state.busMovementStates['XYZ-789']).toBe('offline');

    dateSpy.mockRestore();
  });

  test('debería marcar como offline un bus activo con timestamp obsoleto (C4.6)', () => {
    const dateSpy = jest.spyOn(Date, 'now').mockReturnValue(40000);

    onUpdate({ 'ABC-123': { ...baseLocation, timestamp: 1000, isActive: true } });

    const state = useBurritoStore.getState();
    expect(state.busMovementStates['ABC-123']).toBe('offline');

    dateSpy.mockRestore();
  });

  test('debería marcar "stopped" cuando el bus no se desplaza entre snapshots (C4.6, estrategia C con histeresis)', () => {
    const dateSpy = jest.spyOn(Date, 'now').mockReturnValue(5000);

    onUpdate({ 'ABC-123': { ...baseLocation, timestamp: 1000 } });
    // Sin evidencia (dist=0) una sola vez: aún no es suficiente para parar.
    onUpdate({ 'ABC-123': { ...baseLocation, timestamp: 2000 } });
    expect(useBurritoStore.getState().busMovementStates['ABC-123']).toBe('moving');

    // Segunda medición consecutiva sin evidencia (dist=0): STOP_CONFIRM_PAIRS=2.
    onUpdate({ 'ABC-123': { ...baseLocation, timestamp: 3000 } });
    const state = useBurritoStore.getState();
    expect(state.busMovementStates['ABC-123']).toBe('stopped');
    expect(state.movementDisplacements['ABC-123']).toBe(0);

    dateSpy.mockRestore();
  });

  test('debería marcar "moving" cuando el bus se desplaza entre snapshots (C4.6)', () => {
    const dateSpy = jest.spyOn(Date, 'now').mockReturnValue(5000);

    onUpdate({ 'ABC-123': { ...baseLocation, timestamp: 1000 } });
    onUpdate({
      'ABC-123': {
        ...baseLocation,
        latitude: -12.0,
        longitude: -77.0,
        timestamp: 2000,
      },
    });

    const state = useBurritoStore.getState();
    expect(state.busMovementStates['ABC-123']).toBe('moving');
    expect(state.movementDisplacements['ABC-123']).toBeGreaterThan(MOVEMENT_THRESHOLD_M);

    dateSpy.mockRestore();
  });

  test('debería quedar "offline" aunque se mueva si el timestamp ya expiró (C4.6)', () => {
    const dateSpy = jest.spyOn(Date, 'now').mockReturnValue(40000);

    onUpdate({ 'ABC-123': { ...baseLocation, timestamp: 1000 } });
    onUpdate({
      'ABC-123': {
        ...baseLocation,
        latitude: -12.0,
        longitude: -77.0,
        timestamp: 2000,
      },
    });

    const state = useBurritoStore.getState();
    expect(state.busMovementStates['ABC-123']).toBe('offline');

    dateSpy.mockRestore();
  });

  test('debería limpiar el estado al hacer stopTracking', () => {
    onUpdate({ 'ABC-123': { ...baseLocation, timestamp: 1000 } });
    expect(Object.keys(useBurritoStore.getState().locations).length).toBeGreaterThan(0);

    useBurritoStore.getState().actions.stopTracking();

    expect(useBurritoStore.getState().locations).toEqual({});
    expect(useBurritoStore.getState().busMovementStates).toEqual({});
    expect(useBurritoStore.getState().isConnecting).toBe(false);
  });
});

describe('burritoLocationStore - estados de conexión (C4.5)', () => {
  let onUpdate: (locations: Record<string, BurritoLocation>) => void;
  let onError: (error: Error) => void;

  beforeEach(() => {
    jest.useFakeTimers();
    useBurritoStore.getState().actions.stopTracking();
    useBurritoStore.setState({ locations: {}, busMovementStates: {}, movementDisplacements: {}, isConnecting: false, connectionError: false });
    jest.clearAllMocks();

    useBurritoStore.getState().actions.startTracking();

    const mockSubscribe = MapService.subscribeToBusLocations as jest.Mock;
    onUpdate = mockSubscribe.mock.calls[0][0];
    onError = mockSubscribe.mock.calls[0][1];
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('un snapshot vacío termina el loading sin marcar error', () => {
    onUpdate({});

    const state = useBurritoStore.getState();
    expect(state.isConnecting).toBe(false);
    expect(state.connectionError).toBe(false);
  });

  test('un error del listener marca el estado degradado', () => {
    onError(new Error('simulado'));

    const state = useBurritoStore.getState();
    expect(state.isConnecting).toBe(false);
    expect(state.connectionError).toBe(true);
  });

  test('el timeout de 10s sin snapshot ni error marca el estado degradado', () => {
    jest.advanceTimersByTime(10000);

    const state = useBurritoStore.getState();
    expect(state.isConnecting).toBe(false);
    expect(state.connectionError).toBe(true);
  });

  test('recibir un snapshot cancela el timeout', () => {
    onUpdate({ 'ABC-123': { ...baseLocation, timestamp: 1000 } });

    jest.advanceTimersByTime(10000);

    expect(useBurritoStore.getState().connectionError).toBe(false);
  });

  test('se recupera automáticamente cuando llega un snapshot después del timeout', () => {
    jest.advanceTimersByTime(10000);
    expect(useBurritoStore.getState().connectionError).toBe(true);

    onUpdate({ 'ABC-123': { ...baseLocation, timestamp: 1000 } });

    const state = useBurritoStore.getState();
    expect(state.connectionError).toBe(false);
    expect(state.locations['ABC-123']).toBeDefined();
  });

  test('stopTracking cancela el timeout', () => {
    useBurritoStore.getState().actions.stopTracking();

    jest.advanceTimersByTime(10000);

    expect(useBurritoStore.getState().connectionError).toBe(false);
  });
});
