jest.mock('../src/shared/config/firebase', () => {
  const ref = {
    on: jest.fn((...args: unknown[]) => args[1]),
    off: jest.fn(),
  };
  return {
    firebaseDatabase: { ref: jest.fn(() => ref) },
  };
});

jest.mock('@react-native-firebase/database', () => ({
  __esModule: true,
  default: { ServerValue: { TIMESTAMP: 0 } },
}));

import { MapService } from '../src/features/map/services/map_service';
import { firebaseDatabase } from '../src/shared/config/firebase';

const getRef = () => (firebaseDatabase.ref as jest.Mock).mock.results[0].value;

describe('MapService.subscribeToBusLocations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('debería registrar el listener con callback de error', () => {
    const onUpdate = jest.fn();
    const onError = jest.fn();

    MapService.subscribeToBusLocations(onUpdate, onError);

    const ref = getRef();
    expect(ref.on).toHaveBeenCalledWith('value', expect.any(Function), onError);
  });

  test('un snapshot null entrega un objeto vacío (no congela el loading)', () => {
    const onUpdate = jest.fn();
    MapService.subscribeToBusLocations(onUpdate);

    const ref = getRef();
    const valueHandler = ref.on.mock.calls[0][1];
    valueHandler({ val: () => null });

    expect(onUpdate).toHaveBeenCalledWith({});
  });

  test('normaliza los datos del snapshot', () => {
    const onUpdate = jest.fn();
    MapService.subscribeToBusLocations(onUpdate);

    const ref = getRef();
    const valueHandler = ref.on.mock.calls[0][1];
    valueHandler({
      val: () => ({
        'ABC-123': { latitude: -12.05, longitude: -77.08, heading: 90, isActive: true, timestamp: 1000 },
      }),
    });

    expect(onUpdate).toHaveBeenCalledWith({
      'ABC-123': { latitude: -12.05, longitude: -77.08, heading: 90, isActive: true, timestamp: 1000, speed: 0 },
    });
  });

  test('preserva el speed publicado por la DriverApp (C4.6)', () => {
    const onUpdate = jest.fn();
    MapService.subscribeToBusLocations(onUpdate);

    const ref = getRef();
    const valueHandler = ref.on.mock.calls[0][1];
    valueHandler({
      val: () => ({
        'ABC-123': { latitude: -12.05, longitude: -77.08, heading: 90, isActive: true, timestamp: 1000, speed: 2.78 },
      }),
    });

    expect(onUpdate).toHaveBeenCalledWith({
      'ABC-123': { latitude: -12.05, longitude: -77.08, heading: 90, isActive: true, timestamp: 1000, speed: 2.78 },
    });
  });

  test('el cleanup desuscribe el listener', () => {
    const cleanup = MapService.subscribeToBusLocations(jest.fn());

    const ref = getRef();
    const valueHandler = ref.on.mock.calls[0][1];
    cleanup();

    expect(ref.off).toHaveBeenCalledWith('value', valueHandler);
  });
});
