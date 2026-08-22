jest.mock('../src/features/map/services/map_service', () => ({
  MapService: {
    subscribeToBusLocations: jest.fn(),
  },
}));

import {
  getMovementStatus,
  isBusMoving,
  isBusOffline,
  MOVEMENT_THRESHOLD_M,
  computeLiveStatus,
} from '../src/store/burritoLocationStore';
import { createMovementMemory } from '../src/features/map/utils/movement';

describe('isBusOffline', () => {
  test('debería ser offline con bus inactivo, sin importar la edad', () => {
    expect(isBusOffline(0, false)).toBe(true);
    expect(isBusOffline(5000, false)).toBe(true);
    expect(isBusOffline(60000, false)).toBe(true);
  });

  test('debería ser offline exactamente en el umbral de obsoleto (30s)', () => {
    expect(isBusOffline(29999, true)).toBe(false);
    expect(isBusOffline(30000, true)).toBe(true);
  });

  test('debería ser offline con timestamp obsoleto aunque el bus esté activo (C4.6)', () => {
    expect(isBusOffline(60000, true)).toBe(true);
  });
});

describe('isBusMoving', () => {
  test('debería moverse si el desplazamiento supera el umbral', () => {
    expect(isBusMoving(MOVEMENT_THRESHOLD_M + 0.001)).toBe(true);
    expect(isBusMoving(100)).toBe(true);
  });

  test('debería estar quieto si el desplazamiento no supera el umbral', () => {
    expect(isBusMoving(MOVEMENT_THRESHOLD_M)).toBe(false);
    expect(isBusMoving(0)).toBe(false);
  });
});

describe('getMovementStatus', () => {
  test('debería devolver "moving" para desplazamiento mayor al umbral y bus fresco', () => {
    expect(
      getMovementStatus({ timestampAge: 0, isActive: true, displacementMeters: 100 }),
    ).toBe('moving');
  });

  test('debería devolver "moving" justo por encima del umbral de movimiento', () => {
    expect(
      getMovementStatus({
        timestampAge: 0,
        isActive: true,
        displacementMeters: MOVEMENT_THRESHOLD_M + 0.001,
      }),
    ).toBe('moving');
  });

  test('debería devolver "stopped" exactamente en el umbral de movimiento', () => {
    expect(
      getMovementStatus({
        timestampAge: 0,
        isActive: true,
        displacementMeters: MOVEMENT_THRESHOLD_M,
      }),
    ).toBe('stopped');
  });

  test('debería devolver "stopped" para desplazamiento nulo y bus fresco', () => {
    expect(
      getMovementStatus({ timestampAge: 0, isActive: true, displacementMeters: 0 }),
    ).toBe('stopped');
  });

  test('debería devolver "offline" exactamente en el umbral de obsoleto (30s)', () => {
    expect(
      getMovementStatus({ timestampAge: 30000, isActive: true, displacementMeters: 100 }),
    ).toBe('offline');
  });

  test('debería devolver "offline" para timestamp obsoleto aunque se mueva (C4.6)', () => {
    expect(
      getMovementStatus({ timestampAge: 60000, isActive: true, displacementMeters: 500 }),
    ).toBe('offline');
  });

  test('debería devolver "offline" cuando el bus está inactivo, sin importar edad ni movimiento', () => {
    expect(
      getMovementStatus({ timestampAge: 0, isActive: false, displacementMeters: 50 }),
    ).toBe('offline');
    expect(
      getMovementStatus({ timestampAge: 60000, isActive: false, displacementMeters: undefined }),
    ).toBe('offline');
  });

  test('sin desplazamiento previo (primer snapshot) debería devolver "moving" con edad fresca', () => {
    expect(
      getMovementStatus({ timestampAge: 11999, isActive: true, displacementMeters: undefined }),
    ).toBe('moving');
  });

  test('sin desplazamiento previo (primer snapshot) debería devolver "stopped" en el fallback de 12s', () => {
    expect(
      getMovementStatus({ timestampAge: 12000, isActive: true, displacementMeters: undefined }),
    ).toBe('stopped');
  });

  test('debería devolver "moving" para timestamp futuro y bus en movimiento', () => {
    expect(
      getMovementStatus({ timestampAge: -1, isActive: true, displacementMeters: 100 }),
    ).toBe('moving');
  });
});

describe('computeLiveStatus (C4.6 experimental — estrategia C)', () => {
  test('primer snapshot: memoria limpia, sin evaluar evidencia ni acumular weakCount', () => {
    const result = computeLiveStatus({
      timestampAge: 0,
      isActive: true,
      prevMemory: undefined,
      dist: 0,
      dtMs: 0,
      speedMps: 0,
    });
    expect(result.status).toBe('moving');
    expect(result.memory.weakCount).toBe(0);
  });

  test('evidencia (vCalc alto) → moving inmediato', () => {
    const prev = createMovementMemory('stopped');
    const result = computeLiveStatus({
      timestampAge: 0,
      isActive: true,
      prevMemory: prev,
      dist: 10,
      dtMs: 3000,
      speedMps: 0,
    });
    expect(result.status).toBe('moving');
  });

  test('speed congelada sin desplazamiento (dist=0, speed>2) NO cambia a moving', () => {
    const prev = createMovementMemory('stopped');
    const result = computeLiveStatus({
      timestampAge: 0,
      isActive: true,
      prevMemory: prev,
      dist: 0,
      dtMs: 3000,
      speedMps: 2.78,
    });
    expect(result.status).toBe('stopped');
  });

  test('una pareja sin evidencia no basta para parar; dos consecutivas sí', () => {
    const base = { timestampAge: 0, isActive: true as boolean, dist: 0, dtMs: 3000, speedMps: 0 };

    let memory = createMovementMemory('moving');
    const first = computeLiveStatus({ ...base, prevMemory: memory });
    expect(first.status).toBe('moving');
    memory = first.memory;

    const second = computeLiveStatus({ ...base, prevMemory: memory });
    expect(second.status).toBe('stopped');
  });

  test('offline se mantiene independiente de la estrategia C', () => {
    const result = computeLiveStatus({
      timestampAge: 60000,
      isActive: true,
      prevMemory: createMovementMemory('moving'),
      dist: 100,
      dtMs: 3000,
      speedMps: 5,
    });
    expect(result.status).toBe('offline');
  });
});
