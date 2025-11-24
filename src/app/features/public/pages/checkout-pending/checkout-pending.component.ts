import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-checkout-pending',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './checkout-pending.component.html',
    styleUrl: './checkout-pending.component.css',
})
export class CheckoutPendingComponent { }
