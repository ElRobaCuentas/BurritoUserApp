//! C4.6 EXPERIMENTAL — Estrategia C: distancia + tiempo + speed condicional + memoria.
//! CALIBRACIÓN PENDIENTE: los valores de este archivo son hipótesis de trabajo para la
//! prueba de campo. NO son valores definitivos de C4.6. No documentarlos como tales.

// vCalc = dist / (dtMs/1000) debe superar este valor para aportar evidencia sola.
// Experimental: equivale a ~3.6 km/h entre fixes. No es frontera semántica del producto.
export const MOVEMENT_EVIDENCE_MIN_SPEED_MS = 1;

// speed de Android solo aporta evidencia SI el GPS reportó desplazamiento real.
// Evita la trampa de "speed congelada" (ej. 2.78 m/s con dist=0 durante heartbeat).
export const GPS_SPEED_MIN_MS = 2;
export const MIN_DISPLACEMENT_WITH_SPEED_M = 2;

// Pares consecutivos sin evidencia necesarios para pasar a PARADERO (~6-8s con
// cadencia 3-4s). Protección mínima contra una medición aislada / ruido GPS.
// No es una espera artificial larga ni el valor definitivo: se decide con datos.
export const STOP_CONFIRM_PAIRS = 2;

export interface MovementEvidenceInput {
  dist: number;
  dtMs: number;
  speedMps: number;
}

export interface MovementMemory {
  status: 'moving' | 'stopped';
  weakCount: number;
}

export const createMovementMemory = (initialStatus: 'moving' | 'stopped'): MovementMemory => ({
  status: initialStatus,
  weakCount: 0,
});

// vCalc incorpora distancia + tiempo. speed aporta una segunda señal, pero nunca
// por sí sola: exige desplazamiento real (dist > MIN_DISPLACEMENT_WITH_SPEED_M)
// para descartar el speed congelado del heartbeat.
export const evaluateMovementEvidence = ({
  dist,
  dtMs,
  speedMps,
}: MovementEvidenceInput): boolean => {
  const vCalc = dtMs > 0 ? dist / (dtMs / 1000) : 0;
  return (
    vCalc > MOVEMENT_EVIDENCE_MIN_SPEED_MS ||
    (speedMps > GPS_SPEED_MIN_MS && dist > MIN_DISPLACEMENT_WITH_SPEED_M)
  );
};

// Memoria mínima de estado: la evidencia cambia a MOVIMIENTO inmediatamente; la
// falta de evidencia solo pasa a PARADERO tras STOP_CONFIRM_PAIRS pares seguidos.
export const nextMovementStatus = (
  prev: MovementMemory,
  evidence: boolean,
): MovementMemory => {
  if (evidence) {
    return { status: 'moving', weakCount: 0 };
  }

  const weakCount = prev.status === 'moving' ? prev.weakCount + 1 : 0;
  if (weakCount >= STOP_CONFIRM_PAIRS) {
    return { status: 'stopped', weakCount: 0 };
  }
  return { status: prev.status, weakCount };
};