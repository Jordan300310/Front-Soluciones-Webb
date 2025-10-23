import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterOutlet, RouterLinkActive } from '@angular/router';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-panel',
  imports: [CommonModule, RouterLink, RouterOutlet, RouterLinkActive],
  templateUrl: './panel.component.html',
  styleUrls: ['./panel.component.css']
})
export class panelComponent {

}
