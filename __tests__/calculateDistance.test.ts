import { calculateDistance } from '../src/features/map/utils/geo';

describe('calculateDistance (Haversine)', () => {
  test('debería devolver 0 para el mismo punto', () => {
    expect(calculateDistance(-12.0575, -77.0830, -12.0575, -77.0830)).toBe(0);
  });

  test('debería calcular ~111km para 1 grado en el ecuador', () => {
    const result = calculateDistance(0, 0, 0, 1);
    expect(result).toBeGreaterThan(111000);
    expect(result).toBeLessThan(111500);
  });

  test('debería calcular distancia entre dos puntos en UNMSM', () => {
    const result = calculateDistance(-12.0575, -77.0830, -12.0585, -77.0820);
    expect(result).toBeGreaterThan(100);
    expect(result).toBeLessThan(200);
  });

  test('debería ser simétrica (A→B === B→A)', () => {
    const forward = calculateDistance(-12.0575, -77.0830, -12.0585, -77.0820);
    const backward = calculateDistance(-12.0585, -77.0820, -12.0575, -77.0830);
    expect(forward).toBeCloseTo(backward, 6);
  });

  test('debería manejar coordenadas en el hemisferio sur sin errores', () => {
    const result = calculateDistance(-12.0, -77.0, -12.1, -77.1);
    expect(result).toBeGreaterThan(10000);
  });

  test('debería devolver valores positivos para cualquier par de puntos distintos', () => {
    const result = calculateDistance(40.7128, -74.0060, 34.0522, -118.2437);
    expect(result).toBeGreaterThan(0);
  });
});
