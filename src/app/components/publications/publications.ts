import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-publications',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  templateUrl: './publications.html',
  styleUrl: './publications.scss'
})
export class PublicationsComponent {}
