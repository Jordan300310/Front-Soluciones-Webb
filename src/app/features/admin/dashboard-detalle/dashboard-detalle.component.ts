import { 
  Component, 
  OnInit, 
  ChangeDetectorRef, 
  ViewChild, 
  ElementRef, 
  OnDestroy 
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminDashboardService, TopProducto } from '../../../core/services/admin/admin-dashboard.service';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

@Component({
  selector: 'app-dashboard-detalle',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-detalle.component.html',
  styleUrls: ['./dashboard-detalle.component.css']
})
export class DashboardDetalleComponent implements OnInit, OnDestroy {
  
  categoria: string = '';
  productos: TopProducto[] = [];
  loading: boolean = true;
  error: string | null = null;
  
  // Variables para guardar el contexto de fechas
  fechaInicio?: string;
  fechaFin?: string;

  private barChart: Chart | null = null;
  private doughnutChart: Chart | null = null;

  @ViewChild('barCanvas') barCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('doughnutCanvas') doughnutCanvas!: ElementRef<HTMLCanvasElement>;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dashboardSvc: AdminDashboardService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const rawCategory = this.route.snapshot.paramMap.get('categoria');
    this.categoria = decodeURIComponent(rawCategory || '');

    // LEER QUERY PARAMS (Aquí llegan las fechas desde el Dashboard principal)
    this.route.queryParams.subscribe(params => {
        this.fechaInicio = params['fi'];
        this.fechaFin = params['ff'];
        
        if (this.categoria) {
            this.loadDetalle();
        } else {
            this.error = 'Categoría no especificada.';
            this.loading = false;
        }
    });
  }

  ngOnDestroy(): void {
    if (this.barChart) this.barChart.destroy();
    if (this.doughnutChart) this.doughnutChart.destroy();
  }

  loadDetalle(): void {
    this.loading = true;
    // Pasar las fechas al servicio
    this.dashboardSvc.getDetalleCategoria(this.categoria, this.fechaInicio, this.fechaFin).subscribe({
      next: (data) => {
        this.productos = data;
        this.loading = false;
        this.cdr.detectChanges(); 
        if (this.productos.length > 0) {
          this.initDetailCharts();
        }
      },
      error: (err) => {
        console.error('Error:', err);
        this.error = 'Error al cargar datos.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // ... (initDetailCharts se mantiene igual) ...
  private initDetailCharts(): void {
      // Tu código de gráficas existente (copy/paste del que ya tenías)
      // ...
      // Asegúrate de usar this.productos
      const labels = this.productos.map(p => p.nombre.length > 25 ? p.nombre.substring(0, 25) + '...' : p.nombre);
      const cantidades = this.productos.map(p => p.cantidadVendida);
      const totales = this.productos.map(p => p.totalVenta);
      
      if (this.barCanvas) {
          this.barChart = new Chart(this.barCanvas.nativeElement, {
             type: 'bar',
             data: {
                 labels: labels,
                 datasets: [{
                     label: 'Unidades',
                     data: cantidades,
                     backgroundColor: 'rgba(67, 97, 238, 0.7)',
                     borderRadius: 4
                 }]
             },
             options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false }
          });
      }
      if (this.doughnutCanvas) {
          this.doughnutChart = new Chart(this.doughnutCanvas.nativeElement, {
              type: 'doughnut',
              data: {
                  labels: labels,
                  datasets: [{
                      data: totales,
                      backgroundColor: ['#4361ee', '#3f37c9', '#4895ef', '#4cc9f0', '#f72585'],
                  }]
              },
              options: { responsive: true, maintainAspectRatio: false }
          });
      }
  }

  goBack(): void {
    // Al volver, tratamos de mantener los filtros si es posible, o volver limpio
    // Si quieres volver con los mismos filtros, tendrías que guardar estado en un servicio.
    // Por simplicidad, volvemos al dashboard "limpio" o con los queryParams si lo deseas.
    this.router.navigate(['/admin/dashboard']);
  }
}