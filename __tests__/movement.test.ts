import {
  evaluateMovementEvidence,
  nextMovementStatus,
  createMovementMemory,
  STOP_CONFIRM_PAIRS,
  MOVEMENT_EVIDENCE_MIN_SPEED_MS,
  GPS_SPEED_MIN_MS,
  MIN_DISPLACEMENT_WITH_SPEED_M,
} from '../src/features/map/utils/movement';

describe('evaluateMovementEvidence — C4.6 experimental', () => {
  test('speed congelada (dist=0, speed>umbral) NO debe aportar evidencia', () => {
    expect(evaluateMovementEvidence({ dist: 0, dtMs: 3000, speedMps: 2.78 })).toBe(false);
  });

  test('vehículo realmente quieto (dist=0, speed=0) NO debe aportar evidencia', () => {
    expect(evaluateMovementEvidence({ dist: 0, dtMs: 3000, speedMps: 0 })).toBe(false);
  });

  test('movimiento normal: vCalc > umbral debe aportar evidencia', () => {
    expect(evaluateMovementEvidence({ dist: 10, dtMs: 3000, speedMps: 0 })).toBe(true);
    expect(evaluateMovementEvidence({ dist: 3.1, dtMs: 3000, speedMps: 0 })).toBe(true);
  });

  test('movimiento muy lento (1 km/h ≈ 0.83 m cada 3 s) NO es detectado por los parámetros experimentales', () => {
    const vCalc = 0.83 / 3;
    expect(vCalc).toBeLessThanOrEqual(MOVEMENT_EVIDENCE_MIN_SPEED_MS);
    // Limitación experimental documentada: a ~1 km/h con cadencia 3s, vCalc
    // (~0.28 m/s) no supera el umbral y speed (<2 m/s) no aplica. Este caso se
    // mide en campo; NO se modifica artificialmente para que pase.
    expect(evaluateMovementEvidence({ dist: 0.83, dtMs: 3000, speedMps: 0.31 })).toBe(false);
  });

  test('speed alta SIN desplazamiento real NO debe aportar evidencia (speed congelada)', () => {
    expect(evaluateMovementEvidence({ dist: 0, dtMs: 3000, speedMps: 10 })).toBe(false);
  });

  test('speed alta CON desplazamiento real SÍ debe aportar evidencia', () => {
    expect(
      evaluateMovementEvidence({
        dist: MIN_DISPLACEMENT_WITH_SPEED_M + 0.1,
        dtMs: 3000,
        speedMps: GPS_SPEED_MIN_MS + 0.1,
      }),
    ).toBe(true);
  });

  test('GPS gap: dt grande no produce comportamiento absurdo (vCalc baja)', () => {
    // 5m en 60s → vCalc ~0.08, no evidencia (movimiento demasiado lento para
    // el intervalo o posición residual del gap).
    expect(evaluateMovementEvidence({ dist: 5, dtMs: 60000, speedMps: 0 })).toBe(false);
    // 200m en 30s → vCalc ~6.7, clara evidencia aunque hubo gap.
    expect(evaluateMovementEvidence({ dist: 200, dtMs: 30000, speedMps: 0 })).toBe(true);
  });

  test('dtMs = 0 no divide por cero (no evidencia por vCalc)', () => {
    expect(evaluateMovementEvidence({ dist: 10, dtMs: 0, speedMps: 0 })).toBe(false);
  });
});

describe('nextMovementStatus — memoria/histeresis C4.6 experimental', () => {
  test('evidencia → MOVIMIENTO inmediatamente', () => {
    const prev = createMovementMemory('stopped');
    const next = nextMovementStatus(prev, true);
    expect(next.status).toBe('moving');
    expect(next.weakCount).toBe(0);
  });

  test('una sola medición sin evidencia NO pasa a PARADERO todavía', () => {
    const prev = createMovementMemory('moving');
    const next = nextMovementStatus(prev, false);
    expect(next.status).toBe('moving');
    expect(next.weakCount).toBe(1);
  });

  test('dos mediciones consecutivas sin evidencia → PARADERO', () => {
    let memory = createMovementMemory('moving');
    memory = nextMovementStatus(memory, false);
    memory = nextMovementStatus(memory, false);
    expect(memory.status).toBe('stopped');
    expect(memory.weakCount).toBe(0);
  });

  test('STOP_CONFIRM_PAIRS controla cuántas mediciones sin evidencia se requieren', () => {
    let memory = createMovementMemory('moving');
    for (let i = 0; i < STOP_CONFIRM_PAIRS - 1; i++) {
      memory = nextMovementStatus(memory, false);
      expect(memory.status).toBe('moving');
    }
    memory = nextMovementStatus(memory, false);
    expect(memory.status).toBe('stopped');
  });

  test('movimiento después de estar parado: evidencia → MOVIMIENTO', () => {
    let memory = createMovementMemory('stopped');
    memory = nextMovementStatus(memory, true);
    expect(memory.status).toBe('moving');
    memory = nextMovementStatus(memory, false);
    expect(memory.status).toBe('moving');
  });

  test('estado parado se mantiene ante mediciones sin evidencia (weakCount no crece)', () => {
    let memory = createMovementMemory('stopped');
    memory = nextMovementStatus(memory, false);
    expect(memory.status).toBe('stopped');
    expect(memory.weakCount).toBe(0);
  });
});