export interface EjecucionPronosticoDTO {
  idEjecucion: number;
  fechaCorte: string;
  horizonteDias: number;
  tipoDisparo: string;
  estado: string;
  versionModelo: string;
  iniciadoEn: string | null;
  finalizadoEn: string | null;
  latenciaMs: number | null;
}

export interface PronosticoProductoDTO {
  idPronostico: number;
  idProducto: number;
  nombreProducto: string;
  categoria: string;
  marca: string;
  fechaInicio: string;
  fechaFin: string;
  cantidadPredicha: number;
  stockActual: number;
  stockSeguridad: number;
  stockEnCamino: number;
  compraSugerida: number;
  nivelRiesgo: string;
  cantidadReal: number | null;
  versionModelo: string;
}

export interface PronosticoResumenDTO {
  ejecucion: EjecucionPronosticoDTO;
  demandaTotal: number;
  productosRiesgoAlto: number;
  productos: PronosticoProductoDTO[];
}

export interface EjecutarPronosticoRequest {
  fechaCorte: string;
}

export interface AnalyticsUpdateResponse {
  executionId: number | null;
  status: 'SUCCESS' | 'NO_DATA' | 'UP_TO_DATE' | string;
  closedForecasts: number;
  processedWeeks: number;
  rowCounts: Record<string, number>;
  message: string;
}

export interface AnalyticsRunStatus {
  executionId?: number;
  generatedAt?: string;
  status: string;
  processedWeeks?: number;
  lastForecastExecution?: number;
  errorDetail?: string | null;
  finishedAt?: string | null;
}
