import { BurritoLocation } from '../src/features/map/types';

jest.mock('../src/features/map/services/map_service', () => ({
  MapService: {
    subscribeToBusLocations: jest.fn(() => jest.fn()),
  },
}));

import { MapService } from '../src/features/map/services/map_service';
import { useBurritoStore } from '../src/store/burritoLocationStore';

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
    useBurritoStore.setState({ locations: {}, busMovementStates: {}, isConnecting: false });
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

  test('debería limpiar el estado al hacer stopTracking', () => {
    onUpdate({ 'ABC-123': { ...baseLocation, timestamp: 1000 } });
    expect(Object.keys(useBurritoStore.getState().locations).length).toBeGreaterThan(0);

    useBurritoStore.getState().actions.stopTracking();

    expect(useBurritoStore.getState().locations).toEqual({});
    expect(useBurritoStore.getState().busMovementStates).toEqual({});
    expect(useBurritoStore.getState().isConnecting).toBe(false);
  });
});
