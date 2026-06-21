jest.mock('../src/features/map/services/map_service', () => ({
  MapService: {
    subscribeToBusLocations: jest.fn(),
  },
}));

import { getMovementStatus } from '../src/store/burritoLocationStore';

describe('getMovementStatus', () => {
  test('debería devolver "moving" para timestamp reciente y bus activo', () => {
    expect(getMovementStatus(0, true)).toBe('moving');
  });

  test('debería devolver "moving" justo antes del umbral de 12 segundos', () => {
    expect(getMovementStatus(11999, true)).toBe('moving');
  });

  test('debería devolver "stopped" exactamente en el umbral de 12 segundos', () => {
    expect(getMovementStatus(12000, true)).toBe('stopped');
  });

  test('debería devolver "stopped" para timestamp antiguo y bus activo', () => {
    expect(getMovementStatus(30000, true)).toBe('stopped');
    expect(getMovementStatus(60000, true)).toBe('stopped');
  });

  test('debería devolver "offline" cuando el bus está inactivo, sin importar la edad', () => {
    expect(getMovementStatus(0, false)).toBe('offline');
    expect(getMovementStatus(5000, false)).toBe('offline');
    expect(getMovementStatus(60000, false)).toBe('offline');
  });

  test('debería devolver "moving" para timestamp futuro y bus activo', () => {
    expect(getMovementStatus(-1, true)).toBe('moving');
  });
});
