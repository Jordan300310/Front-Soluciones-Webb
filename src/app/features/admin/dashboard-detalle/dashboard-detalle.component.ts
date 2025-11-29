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
    const labels = this.productos.map(p => p.nombre.length > 25 ? p.nombre.substring(0, 25) + '...' : p.nombre);
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
            backgroundColor: 'rgba(67, 97, 238, 0.7)',
            borderColor: 'rgba(67, 97, 238, 1)',
            borderWidth: 1,
            borderRadius: 6,
            barThickness: 20
          }]
        },
        options: {
          indexAxis: 'y', 
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: { 
            x: { beginAtZero: true, grid: { display: true } },
            y: { grid: { display: false } } 
          }
        }
      });
    }

    if (this.doughnutCanvas) {
      this.doughnutChart = new Chart(this.doughnutCanvas.nativeElement, {
        type: 'doughnut',
        data: {
          labels: labels,
          datasets: [{
            data: totales,
            backgroundColor: [
              '#4361ee', '#3f37c9', '#4895ef', '#4cc9f0', '#f72585', '#7209b7'
            ],
            borderWidth: 0,
            hoverOffset: 10
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '70%', 
          plugins: {
            legend: { display: false }, 
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