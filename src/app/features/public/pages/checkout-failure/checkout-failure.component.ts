import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-checkout-failure',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './checkout-failure.component.html',
    styleUrl: './checkout-failure.component.css',
})
export class CheckoutFailureComponent { }
