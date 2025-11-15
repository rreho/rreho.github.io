import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';

interface Project {
  title: string;
  description: string;
  image: string;
  link: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, RouterModule],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class HomeComponent implements OnInit {
  projects: Project[] = [
    {
      title: 'Theoretical Spectroscopy',
      description: 'Light-Matter interaction for 2D Materials: Real-Time Dynamics',
      image: '/images/theoreticalspectroscopy-abspl.png',
      link: '/home'
    },
    {
      title: 'Superconducting DFT',
      description: 'Superconductivity for quantum computing',
      image: '/images/superconductivity-DOS.png',
      link: '/home'
    },
    {
      title: 'Topology in Condensed Matter',
      description: 'Geometrical interpretation of electronic and optical properties',
      image: '/images/Devyambopy.webp',
      link: '/home'
    }
  ];

  ngOnInit(): void {}
}
