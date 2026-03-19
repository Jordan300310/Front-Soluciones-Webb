import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'app-checkout-pending',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './checkout-pending.component.html',
  styleUrl: './checkout-pending.component.css',
})
export class CheckoutPendingComponent implements OnInit {
  sessionId: string | null = null;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.sessionId = params['session_id'] || 'No disponible';
    });
  }
}
