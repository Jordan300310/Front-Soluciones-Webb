import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ChangeDetectorRef } from '@angular/core';
import { PerfilService } from '../../../../core/services/perfil/perfil.service';
import { PerfilResponse } from '../../../../core/models/perfil/PerfilResponse';
import { PerfilUpdateRequest } from '../../../../core/models/perfil/PerfilUpdateRequest';
import { ChangePasswordRequest } from '../../../../core/models/perfil/ChangePasswordRequest';
import { Pedido } from '../../../../core/models/perfil/Pedido';
import { Reembolso } from '../../../../core/models/perfil/Reembolso';
import { SolicitudReembolso } from '../../../../core/models/perfil/SolicitudReembolso';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './perfil.component.html',
})
export class PerfilComponent implements OnInit {
  private perfilService = inject(PerfilService);
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);
  activeTab: 'datos' | 'password' | 'pedidos' | 'reembolsos' = 'datos';

  perfil: PerfilResponse | null = null;

  mensajePerfil: string | null = null;
  errorPerfil: string | null = null;

  mensajePassword: string | null = null;
  errorPassword: string | null = null;

  pedidos: Pedido[] = [];
  errorPedidos: string | null = null;

  reembolsos: Reembolso[] = [];
  errorReembolsos: string | null = null;
  mensajeReembolso: string | null = null;

  selectedPedidoId: number | null = null;

  showEditModal = false;
  showRefundModal = false;

  personalForm = this.fb.group({
    nombres: [''],
    apellidoPaterno: [''],
    apellidoMaterno: [''],
    dni: [{ value: '', disabled: true }],
    celular: [''],
    email: ['', [Validators.email]],
    fechaNacimiento: [{ value: '', disabled: true }],
  });

  passwordForm = this.fb.group({
    currentPassword: ['', Validators.required],
    newPassword: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', Validators.required],
  });

  refundForm = this.fb.group({
    motivo: ['', [Validators.required, Validators.minLength(10)]],
  });

  get username(): string | null {
    return localStorage.getItem('username');
  }

  get pedidosSinReembolso(): Pedido[] {
    return this.pedidos.filter(pedido =>
      !this.reembolsos.some(reembolso => reembolso.idVenta === pedido.idVenta)
    );
  }

  ngOnInit(): void {
    this.cargarPerfil();
    this.cargarPedidos();
    this.cargarReembolsos();
  }

  private cargarPerfil() {
    this.perfilService.getPerfil().subscribe({
      next: (res) => {
        this.perfil = res;
        this.personalForm.patchValue({
          nombres: res.nombres ?? '',
          apellidoPaterno: res.apellidoPaterno ?? '',
          apellidoMaterno: res.apellidoMaterno ?? '',
          dni: res.dni ?? '',
          celular: res.celular ?? '',
          email: res.email ?? '',
          fechaNacimiento: res.fechaNacimiento ?? '',
        });
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorPerfil = err?.error || 'Error al cargar el perfil';
      },
    });
  }

  private cargarPedidos() {
    this.perfilService.getPedidos().subscribe({
      next: (res) => {
        this.pedidos = res;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorPedidos = err?.error || 'Error al cargar los pedidos';
        this.cdr.detectChanges();
      },
    });
  }

  private cargarReembolsos() {
    this.perfilService.getMisSolicitudes().subscribe({
      next: (res) => {
        this.reembolsos = res;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorReembolsos = err?.error || 'Error al cargar las solicitudes de reembolso';
        this.cdr.detectChanges();
      },
    });
  }

  cambiarTab(tab: 'datos' | 'password' | 'pedidos' | 'reembolsos') {
    this.activeTab = tab;
    this.mensajePerfil = null;
    this.errorPerfil = null;
    this.mensajePassword = null;
    this.errorPassword = null;
    this.errorPedidos = null;
    this.mensajeReembolso = null;
    this.errorReembolsos = null;

    this.showEditModal = false;
    this.showRefundModal = false;
  }

  abrirModalDatos() {
    this.showEditModal = true;
  }

  cerrarModalDatos() {
    this.showEditModal = false;
    this.cdr.detectChanges();
  }

  onSubmitDatos() {
    if (this.personalForm.invalid) {
      this.personalForm.markAllAsTouched();
      return;
    }

    const value = this.personalForm.getRawValue();
    const body: PerfilUpdateRequest = {
      nombres: value.nombres || null,
      apellidoPaterno: value.apellidoPaterno || null,
      apellidoMaterno: value.apellidoMaterno || null,
      celular: value.celular || null,
      email: value.email || null,
    };

    this.mensajePerfil = null;
    this.errorPerfil = null;

    this.perfilService.updatePerfil(body).subscribe({
      next: (res) => {
        this.perfil = res;
        this.mensajePerfil = 'Datos personales actualizados correctamente.';
        this.personalForm.patchValue({
          nombres: res.nombres ?? '',
          apellidoPaterno: res.apellidoPaterno ?? '',
          apellidoMaterno: res.apellidoMaterno ?? '',
          dni: res.dni ?? '',
          celular: res.celular ?? '',
          email: res.email ?? '',
          fechaNacimiento: res.fechaNacimiento ?? '',
        });
        this.showEditModal = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorPerfil = err?.error || 'Error al actualizar los datos';
      },
    });
  }

  onSubmitPassword() {
    this.mensajePassword = null;
    this.errorPassword = null;

    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    const { currentPassword, newPassword, confirmPassword } =
      this.passwordForm.value;

    if (newPassword !== confirmPassword) {
      this.errorPassword = 'La nueva contraseña y la confirmación no coinciden.';
      return;
    }

    const body: ChangePasswordRequest = {
      currentPassword: currentPassword || '',
      newPassword: newPassword || '',
    };

    this.perfilService.changePassword(body).subscribe({
      next: () => {
        this.mensajePassword = 'Contraseña actualizada correctamente.';
        this.passwordForm.reset();
      },
      error: (err) => {
        this.errorPassword = err?.error || 'Error al cambiar la contraseña';
      },
    });
  }

  // Métodos para reembolsos
  abrirModalReembolso(idVenta: number) {
    this.selectedPedidoId = idVenta;
    this.showRefundModal = true;
    this.refundForm.reset();
  }

  cerrarModalReembolso() {
    this.showRefundModal = false;
    this.selectedPedidoId = null;
    this.refundForm.reset();
    this.cdr.detectChanges();
  }

  onSubmitReembolso() {
    if (this.refundForm.invalid || this.selectedPedidoId === null) {
      this.refundForm.markAllAsTouched();
      return;
    }

    const motivo = this.refundForm.value.motivo || '';
    const body: SolicitudReembolso = {
      idVenta: this.selectedPedidoId,
      motivo: motivo,
    };

    this.mensajeReembolso = null;
    this.errorReembolsos = null;

    this.perfilService.solicitarReembolso(body).subscribe({
      next: (res) => {
        this.mensajeReembolso = 'Solicitud de reembolso enviada correctamente.';
        this.reembolsos.unshift(res); // Agregar al inicio de la lista
        this.cerrarModalReembolso();
        this.cdr.detectChanges();

        // Cambiar automáticamente a la pestaña de reembolsos
        setTimeout(() => {
          this.cambiarTab('reembolsos');
        }, 1500);
      },
      error: (err) => {
        this.errorReembolsos = err?.error || 'Error al solicitar el reembolso';
        this.cdr.detectChanges();
      },
    });
  }
}
