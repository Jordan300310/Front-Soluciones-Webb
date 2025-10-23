import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, startWith, switchMap } from 'rxjs';
import { AdminClientesService } from '../../../core/services/admin/admin-clientes.service';
import { ClienteAdminDTO, UpdateClienteRequest } from '../../../core/models/admin/cliente.models';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cliente.component.html'
})
export class ClienteComponent {
  private api = inject(AdminClientesService);

  private refresh$ = new Subject<void>();
  data$ = this.refresh$.pipe(
    startWith(void 0),
    switchMap(() => this.api.list$())
  );

  selected = signal<ClienteAdminDTO | null>(null);

  editar(c: ClienteAdminDTO) {
    this.api.get$(c.idCliente).subscribe(v => this.selected.set(v));
  }

  cancelar() {
    this.selected.set(null);
  }

  guardar() {
    const s = this.selected();
    if (!s) return;

    const body: UpdateClienteRequest = {
      nom: s.nom || '', apat: s.apat || '', amat: s.amat || '',
      dni: s.dni || '', cel: s.cel || '', email: s.email || '',
      fen: s.fen || '', clienteEstado: s.clienteEstado ?? true,
      username: s.username || '', password: s.password || '',
    };

    this.api.update$(s.idCliente, body).subscribe(() => {
      this.cancelar();
      this.refresh$.next();   // recarga tabla
    });
  }

  eliminar(c: ClienteAdminDTO) {
    if (!confirm('Eliminar?')) return;
    this.api.delete$(c.idCliente).subscribe(() => this.refresh$.next());
  }
}
