import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
@Component({
  selector: 'app-acercade',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './acercade.component.html',
  styleUrls: ['./acercade.component.css'],
})
export class AcercadeComponent implements OnInit {
  primaryColor = '#137fec';

  categories = [
    { name: 'EPPs', icon: 'health_and_safety' },
    { name: 'Confecciones', icon: 'styler' },
    { name: 'Ferretería', icon: 'construction' },
    { name: 'Construcción', icon: 'foundation' },
    { name: 'Tuberías', icon: 'plumbing' },
    { name: 'Luminarias', icon: 'lightbulb' },
    { name: 'Pinturas', icon: 'format_paint' },
  ];

  constructor() {}

  ngOnInit() {}
}
