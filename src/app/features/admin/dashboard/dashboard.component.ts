import {
  Component,
  OnInit,
  ChangeDetectorRef,
  ElementRef,
  ViewChild,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  AdminDashboardService,
  DashboardResponse,
  TopProducto,
  VentaDiaria,
  VentaCategoria,
  ProductoResumen
} from '../../../core/services/admin/admin-dashboard.service';

import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit, OnDestroy {
  ventasMes: number = 0;
  gananciasMes: number = 0;
  topProductos: TopProducto[] = [];

  productosBajoStock: ProductoResumen[] = [];
  productosZombies: ProductoResumen[] = [];
  ticketPromedio: number = 0;

  loading = false;
  error: string | null = null;

  private lineChart: Chart | null = null;
  private pieChart: Chart | null = null;

  @ViewChild('lineCanvas') lineCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('pieCanvas') pieCanvas!: ElementRef<HTMLCanvasElement>;

  constructor(
    private dashboardSvc: AdminDashboardService, 
    private cdr: ChangeDetectorRef,
    private router: Router 
  ) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  ngOnDestroy(): void {
    if (this.lineChart) this.lineChart.destroy();
    if (this.pieChart) this.pieChart.destroy();
  }

  loadDashboard(): void {
    this.loading = true;
    this.error = null;

    this.dashboardSvc.getDashboard().subscribe({
      next: (res: DashboardResponse) => {
        this.ventasMes = res.ventasMes ?? 0;
        this.gananciasMes = res.gananciasMes ?? 0;
        this.topProductos = res.topProductos ?? [];
        this.productosBajoStock = res.productosBajoStock ?? [];
        this.productosZombies = res.productosSinVentas ?? [];
        
        this.ticketPromedio = this.ventasMes > 0 ? (this.gananciasMes / this.ventasMes) : 0;

        this.loading = false;
        this.cdr.detectChanges();

        this.initCharts(res.ventasUltimos7Dias || [], res.ventasPorCategoria || []);
      },
      error: (err) => {
        console.error('Error cargando dashboard', err);
        this.error = 'No se pudieron cargar los datos del dashboard.';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  private initCharts(dias: VentaDiaria[], cats: VentaCategoria[]): void {
    
    if (this.lineCanvas && dias.length > 0) {
      this.lineChart = new Chart(this.lineCanvas.nativeElement, {
        type: 'line',
        data: {
          labels: dias.map(d => d.fecha),
          datasets: [{
            label: 'Ventas (S/)',
            data: dias.map(d => d.total),
            borderColor: '#0d6efd',
            backgroundColor: 'rgba(13, 110, 253, 0.1)',
            fill: true,
            tension: 0.4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false, 
          plugins: { legend: { display: false } },
          scales: {
            y: { beginAtZero: true, grid: { display: true } },
            x: { grid: { display: false } }
          }
        }
      });
    }

    if (this.pieCanvas && cats.length > 0) {
      this.pieChart = new Chart(this.pieCanvas.nativeElement, {
        type: 'doughnut',
        data: {
          labels: cats.map(c => c.categoria),
          datasets: [{
            data: cats.map(c => c.totalVenta),
            backgroundColor: [
              '#4dc9f6', '#f67019', '#f53794', '#537bc4', '#acc236', '#00acc1', '#8e24aa'
            ],
            hoverOffset: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false, 
          plugins: {
            legend: { position: 'right', labels: { boxWidth: 12, usePointStyle: true } },
            tooltip: {
                callbacks: {
                    label: (context) => {
                        let label = context.label || '';
                        if (label) { label += ': '; }
                        if (context.parsed !== null) {
                            label += new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(context.parsed);
                        }
                        return label;
                    }
                }
            }
          },
          onClick: (event, elements) => {
            if (elements.length > 0) {
              const index = elements[0].index;
              const categoria = cats[index].categoria;
              this.router.navigate(['/admin/dashboard/detalle', encodeURIComponent(categoria)]);
            }
          }
        }
      });
    }
  }
}