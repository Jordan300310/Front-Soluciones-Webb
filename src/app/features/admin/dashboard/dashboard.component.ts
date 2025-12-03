import {
  Component,
  OnInit,
  ChangeDetectorRef,
  ElementRef,
  ViewChild,
  OnDestroy,
  AfterViewInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms'; 
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
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  ventasMes: number = 0;
  gananciasMes: number = 0;
  topProductos: TopProducto[] = [];
  productosBajoStock: ProductoResumen[] = [];
  productosZombies: ProductoResumen[] = [];
  ticketPromedio: number = 0;

  loading = false;
  error: string | null = null;

  // --- FILTROS ---
  filterMode: 'month' | 'range' = 'month'; 
  selectedMonth: string = ''; 
  
  // --- CONFIGURACIÓN TIMELINE ---
  selectedYear: number = new Date().getFullYear();
  maxDays: number = 365;
  
  // Valores del Slider (0 - 365)
  sliderVal1: number = 0;
  sliderVal2: number = 365;
  
  // Variables Visuales
  displayDateStart: string = '';
  displayDateEnd: string = '';
  rangeLeft: string = '0%';
  rangeWidth: string = '100%';
  tooltipLeft1: string = '0%';
  tooltipLeft2: string = '100%';
  tooltipText1: string = '';
  tooltipText2: string = '';

  lineChart: Chart | null = null;
  pieChart: Chart | null = null;

  @ViewChild('lineCanvas') lineCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('pieCanvas') pieCanvas!: ElementRef<HTMLCanvasElement>;

  constructor(
    private dashboardSvc: AdminDashboardService, 
    private cdr: ChangeDetectorRef,
    private router: Router 
  ) {
    const now = new Date();
    const m = (now.getMonth() + 1).toString().padStart(2, '0');
    this.selectedMonth = `${now.getFullYear()}-${m}`;
    this.selectedYear = now.getFullYear();
    this.calculateMaxDays();
  }

  ngOnInit(): void {
    // Inicialización explícita
    this.sliderVal1 = 0;
    this.sliderVal2 = this.maxDays;
    
    // Calcular posiciones iniciales sin cargar datos aún
    this.updateVisuals(); 
    
    // Cargar datos
    this.loadDashboard();
  }

  ngAfterViewInit(): void {
    // Hack para asegurar que los tooltips se posicionen bien al cargar la vista
    setTimeout(() => {
      this.updateVisuals();
      this.cdr.detectChanges();
    }, 100);
  }

  ngOnDestroy(): void {
    if (this.lineChart) this.lineChart.destroy();
    if (this.pieChart) this.pieChart.destroy();
  }

  onDragging(event: any, thumb: 'start' | 'end'): void {
    const val = parseInt(event.target.value, 10);

    if (thumb === 'start') {
      if (val > this.sliderVal2) {
        this.sliderVal1 = this.sliderVal2;
        event.target.value = this.sliderVal1; 
      } else {
        this.sliderVal1 = val;
      }
    } else {
      if (val < this.sliderVal1) {
        this.sliderVal2 = this.sliderVal1;
        event.target.value = this.sliderVal2; 
      } else {
        this.sliderVal2 = val;
      }
    }

    // Actualizar UI inmediatamente
    this.updateVisuals();
    this.cdr.detectChanges(); // Forzar repintado para fluidez 60fps
  }

  // --- 2. LÓGICA DE SOLTAR (Carga de Datos) ---
  // Se ejecuta AL SOLTAR el mouse.
  onDragEnd(): void {
    this.loadDashboard();
  }

  // Actualiza los estilos CSS y textos de fecha
  updateVisuals(): void {
    const min = 0;
    const max = this.maxDays > 0 ? this.maxDays : 365;

    const p1 = ((this.sliderVal1 - min) / (max - min)) * 100;
    const p2 = ((this.sliderVal2 - min) / (max - min)) * 100;

    this.rangeLeft = p1 + '%';
    this.rangeWidth = (p2 - p1) + '%';
    this.tooltipLeft1 = p1 + '%';
    this.tooltipLeft2 = p2 + '%';

    const d1 = this.getDateFromIndex(this.sliderVal1);
    const d2 = this.getDateFromIndex(this.sliderVal2);

    this.tooltipText1 = d1.toLocaleDateString('es-PE', { day: 'numeric', month: 'short' });
    this.tooltipText2 = d2.toLocaleDateString('es-PE', { day: 'numeric', month: 'short' });

    // Guardar formato API (YYYY-MM-DD)
    this.displayDateStart = this.formatDate(d1);
    this.displayDateEnd = this.formatDate(d2);
  }

  calculateMaxDays(): void {
    const y = this.selectedYear;
    const isLeap = (y % 4 === 0 && y % 100 !== 0) || (y % 400 === 0);
    this.maxDays = isLeap ? 365 : 364; 
    if (this.sliderVal2 > this.maxDays) this.sliderVal2 = this.maxDays;
  }

  onYearChange(): void {
    this.calculateMaxDays();
    this.sliderVal1 = 0;
    this.sliderVal2 = this.maxDays;
    this.updateVisuals();
    this.loadDashboard();
  }

  private getDateFromIndex(idx: number): Date {
    const d = new Date(this.selectedYear, 0, 1); // 1 Enero
    d.setDate(1 + idx);
    return d;
  }

  private formatDate(d: Date): string {
    if (!d || isNaN(d.getTime())) return '';
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();
    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;
    return [year, month, day].join('-');
  }

  // --- CARGA DE DATOS CENTRALIZADA ---
  
  // Método auxiliar para el HTML (cambio de modo)
  applyDateFilter(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading = true;
    this.error = null;

    let fi: string | undefined;
    let ff: string | undefined;

    // Lógica inteligente para determinar fechas
    if (this.filterMode === 'month' && this.selectedMonth) {
      const parts = this.selectedMonth.split('-');
      if (parts.length === 2) {
        const year = parseInt(parts[0]);
        const month = parseInt(parts[1]);
        const date = new Date(year, month - 1, 1);
        
        fi = this.formatDate(new Date(date.getFullYear(), date.getMonth(), 1));
        ff = this.formatDate(new Date(date.getFullYear(), date.getMonth() + 1, 0));
      }
    } else {
      // Modo Timeline
      // Asegurarnos de que las fechas visuales estén calculadas
      if (!this.displayDateStart) this.updateVisuals();
      fi = this.displayDateStart;
      ff = this.displayDateEnd;
    }

    // Fallback de seguridad si algo falla
    if (!fi || !ff) {
        console.warn("Fechas no válidas, usando fallback.");
        const now = new Date();
        fi = this.formatDate(new Date(now.getFullYear(), now.getMonth(), 1));
        ff = this.formatDate(new Date(now.getFullYear(), now.getMonth() + 1, 0));
    }

    // Llamada al Backend
    this.dashboardSvc.getDashboard(fi, ff).subscribe({
      next: (res: DashboardResponse) => {
        this.ventasMes = res.ventasMes ?? 0;
        this.gananciasMes = res.gananciasMes ?? 0;
        this.topProductos = res.topProductos ?? [];
        this.productosBajoStock = res.productosBajoStock ?? [];
        this.productosZombies = res.productosSinVentas ?? [];
        this.ticketPromedio = this.ventasMes > 0 ? (this.gananciasMes / this.ventasMes) : 0;
        
        this.loading = false;
        this.cdr.detectChanges();

        if (this.lineChart) this.lineChart.destroy();
        if (this.pieChart) this.pieChart.destroy();

        const chartData = (res.ventasPorPeriodo || []).sort((a, b) => a.fecha.localeCompare(b.fecha));
        this.initCharts(chartData, res.ventasPorCategoria || []);
      },
      error: (err) => {
        console.error("Dashboard Error:", err);
        this.error = 'No se pudieron cargar los datos.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  private initCharts(dias: VentaDiaria[], cats: VentaCategoria[]): void {
     if (this.lineCanvas && dias.length > 0) {
      this.lineChart = new Chart(this.lineCanvas.nativeElement, {
        type: 'line',
        data: {
          labels: dias.map(d => {
             const parts = d.fecha.split('-');
             if (parts.length !== 3) return d.fecha;
             const date = new Date(parseInt(parts[0]), parseInt(parts[1])-1, parseInt(parts[2]));
             return date.toLocaleDateString('es-PE', { day: '2-digit', month: 'short' });
          }),
          datasets: [{
            label: 'Ventas',
            data: dias.map(d => d.total),
            borderColor: '#4361ee',
            backgroundColor: 'rgba(67, 97, 238, 0.1)',
            fill: true,
            tension: 0.4,
            pointRadius: 3,
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false, 
          plugins: { legend: { display: false } },
          scales: {
            y: { beginAtZero: true, grid: { display: true, color: '#f0f0f0' }, ticks: { font: { size: 10 } } },
            x: { grid: { display: false }, ticks: { font: { size: 10 } } }
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
              '#4361ee', '#3f37c9', '#4895ef', '#4cc9f0', '#f72585', '#7209b7', '#b5179e'
            ],
            borderWidth: 0,
            hoverOffset: 10
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false, 
          cutout: '75%',
          plugins: {
            legend: { position: 'right', labels: { boxWidth: 10, usePointStyle: true, font: { size: 11 } } },
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