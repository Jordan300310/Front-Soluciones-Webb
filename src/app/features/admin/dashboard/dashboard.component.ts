import {
  Component,
  OnInit,
  ChangeDetectorRef,
  ElementRef,
  ViewChild,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AdminDashboardService,
  DashboardResponse,
  TopProducto,
} from '../../../core/services/admin/admin-dashboard..service';

import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  ventasMes: number | null = null;
  gananciasMes: number | null = null;
  topProductos: TopProducto[] = [];

  loading = false;
  error: string | null = null;

  private barChart: Chart | null = null;
  private doughnutChart: Chart | null = null;

  @ViewChild('barCanvas', { static: false }) barCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('doughnutCanvas', { static: false }) doughnutCanvas!: ElementRef<HTMLCanvasElement>;

  constructor(private dashboardSvc: AdminDashboardService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  ngOnDestroy(): void {
    // destruir instancias de Chart.js para liberar recursos
    if (this.barChart) {
      this.barChart.destroy();
      this.barChart = null;
    }
    if (this.doughnutChart) {
      this.doughnutChart.destroy();
      this.doughnutChart = null;
    }
  }

  private initCharts(): void {
    // Asegurarnos de que existan datos
    if (!this.topProductos || this.topProductos.length === 0) return;

    const labels = this.topProductos.map((p) => p.nombre);
    const cantidades = this.topProductos.map((p) => p.cantidadVendida);
    const totales = this.topProductos.map((p) => +(p.totalVenta ?? 0));

    // Bar chart: cantidad vendida
    try {
      if (this.barChart) {
        this.barChart.data.labels = labels;
        // @ts-ignore
        this.barChart.data.datasets[0].data = cantidades;

        const xTicks: any = this.barChart.options?.scales?.['x']?.ticks ?? {};
        xTicks.autoSkip = true;
        xTicks.maxTicksLimit = 10;
        xTicks.font = { size: 11 };
        xTicks.callback = (tickValue: any, index: number) => {
          const lbl = labels[index] ?? tickValue;
          return typeof lbl === 'string' && lbl.length > 15 ? lbl.slice(0, 15) + '...' : lbl;
        };
        if (!this.barChart.options) this.barChart.options = {};
        if (!this.barChart.options.scales) this.barChart.options.scales = {};
        // @ts-ignore
        this.barChart.options.scales.x = {
          ...(this.barChart.options.scales?.['x'] ?? {}),
          ticks: xTicks,
        };

        this.barChart.update();
      } else if (this.barCanvas) {
        this.barChart = new Chart(this.barCanvas.nativeElement, {
          type: 'bar',
          data: {
            labels,
            datasets: [
              {
                label: 'Cantidad vendida',
                data: cantidades,
                backgroundColor: 'rgba(54, 162, 235, 0.6)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
            },
            scales: {
              x: {
                ticks: {
                  autoSkip: true,
                  maxTicksLimit: 10,
                  font: { size: 11 },
                  callback: (tickValue: any, index: number) => {
                    const lbl = labels[index] ?? tickValue;
                    return typeof lbl === 'string' && lbl.length > 15
                      ? lbl.slice(0, 15) + '...'
                      : lbl;
                  },
                },
              },
              y: { beginAtZero: true },
            },
          },
        });
      }

      // Doughnut: participación por total de ventas
      if (this.doughnutChart) {
        this.doughnutChart.data.labels = labels;
        // @ts-ignore
        this.doughnutChart.data.datasets[0].data = totales;
        this.doughnutChart.update();
      } else if (this.doughnutCanvas) {
        this.doughnutChart = new Chart(this.doughnutCanvas.nativeElement, {
          type: 'doughnut',
          data: {
            labels,
            datasets: [
              {
                data: totales,
                backgroundColor: ['#4dc9f6', '#f67019', '#f53794', '#537bc4', '#acc236'],
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
          },
        });
      }
    } catch (e) {
      console.warn('No se pudieron inicializar los gráficos (Chart.js no disponible?)', e);
    }
  }

  loadDashboard(): void {
    this.loading = true;
    this.error = null;
    this.dashboardSvc.getDashboard().subscribe({
      next: (res: DashboardResponse) => {
        this.ventasMes = res.ventasMes ?? 0;
        this.gananciasMes = res.gananciasMes ?? 0;
        this.topProductos = res.topProductos ?? [];
        this.loading = false;
        this.cdr.detectChanges();
        // Después de detectar cambios, inicializar gráficos con los datos recibidos
        this.initCharts();
      },
      error: (err) => {
        console.error('Error cargando dashboard', err);
        this.error = 'No se pudieron cargar los datos del dashboard.';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }
}
