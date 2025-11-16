import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

interface Thought {
  id: string;
  date: string;
  label: string;
  title: string;
  content: string;
  imageUrl?: string;
}

@Component({
  selector: 'app-thoughts',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule
  ],
  templateUrl: './thoughts.html',
  styleUrl: './thoughts.scss'
})
export class ThoughtsComponent {
  thoughts: Thought[] = [
    {
      id: '1',
      date: '2025-11-15',
      label: 'Research',
      title: 'Example Thought',
      content: 'This is an example thought. Edit the source code to add your own thoughts here.',
      imageUrl: undefined
    }
  ];
}
