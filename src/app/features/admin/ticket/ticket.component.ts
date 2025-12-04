import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminReembolsoService } from '../../../core/services/admin/admin-reembolso.service';
import { Reembolso } from '../../../core/models/perfil/Reembolso';

@Component({
  selector: 'app-ticket',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ticket.component.html',
  styleUrl: './ticket.component.css'
})
export class TicketComponent implements OnInit {
  private reembolsoService = inject(AdminReembolsoService);
  private cdr = inject(ChangeDetectorRef);

  reembolsos: Reembolso[] = [];
  loading = false;
  error: string | null = null;
  filterMode: 'all' | 'pending' = 'pending';

  // Para el modal de procesamiento
  processingId: number | null = null;
  processingComment = '';
  processingAction: 'aprobar' | 'rechazar' | null = null;

  ngOnInit(): void {
    this.loadReembolsos();
  }

  loadReembolsos(): void {
    this.loading = true;
    this.error = null;
    console.log('Loading refunds...', this.filterMode);

    const request$ = this.filterMode === 'pending'
      ? this.reembolsoService.getReembolsosPendientes()
      : this.reembolsoService.getReembolsos();

    request$.subscribe({
      next: (data) => {
        console.log('Refunds loaded:', data);
        this.reembolsos = data || [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading refunds:', err);
        this.error = 'Error al cargar los reembolsos. Por favor, intenta de nuevo.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  setFilter(mode: 'all' | 'pending'): void {
    this.filterMode = mode;
    this.loadReembolsos();
  }

  openProcessModal(id: number, action: 'aprobar' | 'rechazar'): void {
    this.processingId = id;
    this.processingAction = action;
    this.processingComment = '';
  }

  closeProcessModal(): void {
    this.processingId = null;
    this.processingAction = null;
    this.processingComment = '';
  }

  confirmProcess(): void {
    if (this.processingId === null || this.processingAction === null) return;

    const aprobar = this.processingAction === 'aprobar';
    const comentario = this.processingComment.trim() ||
      (aprobar ? 'Reembolso aprobado' : 'Reembolso rechazado');

    this.reembolsoService.procesarReembolso(this.processingId, { aprobar, comentario })
      .subscribe({
        next: (updated) => {
          // Actualizar el reembolso en la lista
          const index = this.reembolsos.findIndex(r => r.id === updated.id);
          if (index !== -1) {
            this.reembolsos[index] = updated;
          }
          this.closeProcessModal();
          // Si estamos en modo "pending", recargar para quitar los procesados
          if (this.filterMode === 'pending') {
            this.loadReembolsos();
          } else {
            this.cdr.detectChanges();
          }
        },
        error: (err) => {
          console.error('Error processing refund:', err);
          alert('Error al procesar el reembolso. Por favor, intenta de nuevo.');
          this.cdr.detectChanges();
        }
      });
  }

  getEstadoBadgeClass(estado: string): string {
    switch (estado) {
      case 'PENDIENTE': return 'badge-warning';
      case 'APROBADO': return 'badge-success';
      case 'RECHAZADO': return 'badge-danger';
      default: return 'badge-secondary';
    }
  }

  formatDate(dateString: string | null): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-pe', {
      style: 'currency',
      currency: 'PEN'
    }).format(amount);
  }
}
