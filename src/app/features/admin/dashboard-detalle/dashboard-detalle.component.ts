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

    if (this.categoria) {
      this.loadDetalle();
    } else {
      this.error = 'Categoría no especificada.';
      this.loading = false;
    }
  }

  ngOnDestroy(): void {
    if (this.barChart) this.barChart.destroy();
    if (this.doughnutChart) this.doughnutChart.destroy();
  }

  loadDetalle(): void {
    this.dashboardSvc.getDetalleCategoria(this.categoria).subscribe({
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

  private initDetailCharts(): void {
    const labels = this.productos.map(p => p.nombre.length > 20 ? p.nombre.substring(0, 20) + '...' : p.nombre);
    const cantidades = this.productos.map(p => p.cantidadVendida);
    const totales = this.productos.map(p => p.totalVenta);

    if (this.barCanvas) {
      this.barChart = new Chart(this.barCanvas.nativeElement, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: 'Unidades Vendidas',
            data: cantidades,
            backgroundColor: 'rgba(54, 162, 235, 0.7)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1,
            borderRadius: 4
          }]
        },
        options: {
          indexAxis: 'y', // 'y' hace que las barras sean horizontales
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: { x: { beginAtZero: true } }
        }
      });
    }

    // --- GRÁFICO 2: DONA (Dinero) ---
    if (this.doughnutCanvas) {
      this.doughnutChart = new Chart(this.doughnutCanvas.nativeElement, {
        type: 'doughnut',
        data: {
          labels: labels,
          datasets: [{
            data: totales,
            backgroundColor: [
              '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'
            ],
            hoverOffset: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false }, // Ocultamos leyenda si son muchos productos
            tooltip: {
              callbacks: {
                label: (context) => {
                   let label = context.label || '';
                   if (label) label += ': ';
                   if (context.parsed !== null) {
                     label += new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(context.parsed);
                   }
                   return label;
                }
              }
            }
          }
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/admin/dashboard']);
  }
}