import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, startWith, switchMap } from 'rxjs';
import { AdminEmpleadosService } from '../../../core/services/admin/admin-empleado.service';
import { EmpleadoAdminDTO, CrearEmpleadoRequest, UpdateEmpleadoRequest } from '../../../core/models/admin/empleado.models';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './empleado.component.html'
})
export class EmpleadoComponent {
  private api = inject(AdminEmpleadosService);

  private refresh$ = new Subject<void>();
  data$ = this.refresh$.pipe(startWith(void 0), switchMap(() => this.api.list$()));

  selected = signal<(EmpleadoAdminDTO & { password?: string }) | null>(null);
  creando = signal<boolean>(false); 

  editar(e: EmpleadoAdminDTO) {
    this.api.get$(e.idEmpleado).subscribe(v => {
      this.creando.set(false);
      this.selected.set({ ...v });
    });
  }

  nuevo() {
    this.creando.set(true);
    this.selected.set({
      idEmpleado: 0,
      idUsuario: 0,
      username: '',
      nom: '',
      apat: '',
      amat: '',
      dni: '',
      cel: '',
      email: '',
      fen: '',
      cargo: '',
      sueldo: 0,
      empleadoEstado: true,
      usuarioEstado: true,
      password: ''
    });
  }

  cancelar() { this.selected.set(null); }

  guardar() {
    const s = this.selected();
    if (!s) return;

    if (this.creando()) {
      const b: CrearEmpleadoRequest = {
        nom: s.nom || '',
        apat: s.apat || '',
        amat: s.amat || '',
        dni: s.dni || '',
        cel: s.cel || '',
        email: s.email || '',
        fen: s.fen || '',
        cargo: s.cargo || '',
        sueldo: Number(s.sueldo) || 0,
        username: s.username || '',
        password: s.password || ''
      };
      this.api.create$(b).subscribe(() => {
        this.cancelar();
        this.refresh$.next();
      });
    } else {
      const b: UpdateEmpleadoRequest = {
        nom: s.nom || '',
        apat: s.apat || '',
        amat: s.amat || '',
        dni: s.dni || '',
        cel: s.cel || '',
        email: s.email || '',
        fen: s.fen || '',
        cargo: s.cargo || '',
        sueldo: Number(s.sueldo) || 0,
        username: s.username || ''
      };
      this.api.update$(s.idEmpleado, b).subscribe(() => {
        this.cancelar();
        this.refresh$.next();
      });
    }
  }

  eliminar(e: EmpleadoAdminDTO) {
    if (!confirm('Eliminar?')) return;
    this.api.delete$(e.idEmpleado).subscribe(() => this.refresh$.next());
  }
}
