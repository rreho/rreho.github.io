import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-talks',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  templateUrl: './talks.html',
  styleUrl: './talks.scss'
})
export class TalksComponent {}
