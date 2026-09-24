import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  EjecucionPronosticoDTO,
  PronosticoResumenDTO,
  AnalyticsRunStatus,
} from '../../../core/models/admin/pronostico.models';
import { AdminPronosticoService } from '../../../core/services/admin/admin-pronostico.service';

@Component({
  selector: 'app-pronostico',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pronostico.component.html',
  styleUrls: ['./pronostico.component.css'],
})
export class PronosticoComponent implements OnInit {
  private readonly api = inject(AdminPronosticoService);

  readonly resumen = signal<PronosticoResumenDTO | null>(null);
  readonly ejecuciones = signal<EjecucionPronosticoDTO[]>([]);
  readonly cargandoResumen = signal(false);
  readonly ejecutando = signal(false);
  readonly actualizandoAnalitica = signal(false);
  readonly analitica = signal<AnalyticsRunStatus | null>(null);
  readonly error = signal<string | null>(null);
  readonly mensaje = signal<string | null>(null);

  readonly maxFecha = this.fechaAyer();
  fechaCorte = this.domingoAnterior();

  ngOnInit(): void {
    this.cargarUltimo();
    this.cargarEjecuciones();
    this.cargarAnalitica();
  }

  ejecutar(): void {
    if (!this.fechaCorte || this.fechaCorte > this.maxFecha || this.ejecutando()) {
      this.error.set('Selecciona una fecha de corte válida.');
      return;
    }
    if (!this.esDomingo(this.fechaCorte)) {
      this.error.set(
        'La fecha de corte debe ser domingo. El periodo pronosticado será de lunes a domingo.',
      );
      return;
    }

    this.ejecutando.set(true);
    this.error.set(null);
    this.mensaje.set(null);

    const idempotencyKey = `web-${this.fechaCorte}-${Date.now()}`;
    this.api.ejecutar$({ fechaCorte: this.fechaCorte }, idempotencyKey).subscribe({
      next: (resultado) => {
        this.resumen.set(resultado);
        this.mensaje.set(`Pronóstico #${resultado.ejecucion.idEjecucion} generado correctamente.`);
        this.ejecutando.set(false);
        this.cargarEjecuciones();
        this.cargarAnalitica();
      },
      error: (err: unknown) => {
        this.error.set(this.mensajeError(err));
        this.ejecutando.set(false);
      },
    });
  }

  actualizarAnalitica(): void {
    if (this.actualizandoAnalitica()) {
      return;
    }
    this.actualizandoAnalitica.set(true);
    this.error.set(null);
    this.mensaje.set(null);
    this.api.actualizarAnalitica$().subscribe({
      next: (resultado) => {
        this.mensaje.set(resultado.message);
        this.actualizandoAnalitica.set(false);
        this.cargarAnalitica();
      },
      error: (err: unknown) => {
        this.error.set(this.mensajeError(err));
        this.actualizandoAnalitica.set(false);
      },
    });
  }

  cargarAnalitica(): void {
    this.api.ultimaAnalitica$().subscribe({
      next: (resultado) => this.analitica.set(resultado),
      error: () => this.analitica.set(null),
    });
  }

  cargarUltimo(): void {
    this.cargandoResumen.set(true);
    this.error.set(null);
    this.api.ultimo$().subscribe({
      next: (resultado) => {
        this.resumen.set(resultado);
        this.cargandoResumen.set(false);
      },
      error: (err: unknown) => {
        if (!(err instanceof HttpErrorResponse && err.status === 404)) {
          this.error.set(this.mensajeError(err));
        }
        this.cargandoResumen.set(false);
      },
    });
  }

  cargarEjecuciones(): void {
    this.api.ejecuciones$(20).subscribe({
      next: (items) => this.ejecuciones.set(items),
      error: (err: unknown) => this.error.set(this.mensajeError(err)),
    });
  }

  verEjecucion(idEjecucion: number): void {
    this.cargandoResumen.set(true);
    this.error.set(null);
    this.mensaje.set(null);
    this.api.detalle$(idEjecucion).subscribe({
      next: (resultado) => {
        this.resumen.set(resultado);
        this.cargandoResumen.set(false);
      },
      error: (err: unknown) => {
        this.error.set(this.mensajeError(err));
        this.cargandoResumen.set(false);
      },
    });
  }

  claseRiesgo(nivel: string): string {
    switch (nivel?.toUpperCase()) {
      case 'ALTO':
        return 'text-bg-danger';
      case 'MEDIO':
        return 'text-bg-warning';
      default:
        return 'text-bg-success';
    }
  }

  claseEstado(estado: string): string {
    switch (estado?.toUpperCase()) {
      case 'SUCCESS':
        return 'text-bg-success';
      case 'FAILED':
        return 'text-bg-danger';
      case 'RUNNING':
        return 'text-bg-primary';
      default:
        return 'text-bg-secondary';
    }
  }

  private domingoAnterior(): string {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() - 1);
    fecha.setDate(fecha.getDate() - fecha.getDay());
    return this.fechaLocal(fecha);
  }

  private fechaAyer(): string {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() - 1);
    return this.fechaLocal(fecha);
  }

  private esDomingo(value: string): boolean {
    return new Date(`${value}T12:00:00`).getDay() === 0;
  }

  private fechaLocal(fecha: Date): string {
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private mensajeError(error: unknown): string {
    if (!(error instanceof HttpErrorResponse)) {
      return 'Ocurrió un error inesperado.';
    }

    const detail = error.error?.detail ?? error.error?.message;
    if (typeof detail === 'string' && detail.trim()) {
      return detail;
    }
    if (error.status === 403) {
      return 'Esta acción requiere una cuenta administradora.';
    }
    if (error.status === 502) {
      return 'Spring Boot no pudo completar la solicitud con el microservicio Python.';
    }
    if (error.status === 0) {
      return 'No se pudo conectar con el backend.';
    }
    return `No se pudo completar la operación (HTTP ${error.status}).`;
  }
}
