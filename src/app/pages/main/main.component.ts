import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DocumentService, DocumentItem } from '../../services/document.service';

interface Teacher {
  id?: string;
  nombre: string;
  email: string;
  asignaturas: string[] | string;
  institucion?: string;
}

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {
  teacher: Teacher | null = null;
  dropdownOpen = false;
  documents: DocumentItem[] = [];
  readonly filesBaseUrl = 'http://localhost:4000';

  constructor(
    private router: Router,
    private documentService: DocumentService
  ) {}

  ngOnInit(): void {
    this.loadTeacherFromStorage();
    this.loadDocuments();
    this.initializeTagFilters();
    document.addEventListener('click', this.handleOutsideClick.bind(this));
  }

  ngOnDestroy(): void {
    document.removeEventListener('click', this.handleOutsideClick.bind(this));
  }

  loadTeacherFromStorage(): void {
    const stored = localStorage.getItem('teacher');
    if (stored) {
      this.teacher = JSON.parse(stored);
    } else {
      this.teacher = null;
    }
  }

  loadDocuments(): void {
    this.documentService.getAllDocuments().subscribe({
      next: (docs) => {
        this.documents = docs || [];
      },
      error: (err) => {
        console.error('Error al cargar documentos', err);
      }
    });
  }

  // Navegación botones principales
  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  goToRegister(): void {
    this.router.navigate(['/register']);
  }

  goToSettings(event?: Event): void {
    if (event) event.preventDefault();
    this.router.navigate(['/settings']);
    this.dropdownOpen = false;
  }

  // Menú usuario
  toggleDropdown(): void {
    if (!this.teacher) return;
    this.dropdownOpen = !this.dropdownOpen;
  }

  handleOutsideClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    // Si se hace click fuera del menú, lo cerramos
    const menu = document.querySelector('.dropdown-menu');
    const profile = document.querySelector('.user-profile');
    if (menu && profile && !profile.contains(target) && !menu.contains(target)) {
      this.dropdownOpen = false;
    }
  }

  uploadDoc(event: Event): void {
    event.preventDefault();
    if (!this.teacher) return;
    this.router.navigate(['/upload-document']);
    this.dropdownOpen = false;
  }

  showProfile(event: Event): void {
    event.preventDefault();
    if (!this.teacher) return;

    const asignaturas = Array.isArray(this.teacher.asignaturas)
      ? this.teacher.asignaturas.join(', ')
      : this.teacher.asignaturas;

    alert(`👤 PERFIL DE ${this.teacher.nombre.toUpperCase()}
    
Email: ${this.teacher.email}
Asignaturas: ${asignaturas}
Institución: ${this.teacher.institucion || 'No especificada'}`);
    this.dropdownOpen = false;
  }

  logout(event: Event): void {
    event.preventDefault();
    localStorage.removeItem('teacher');
    this.teacher = null;
    alert('Sesión cerrada');
    this.dropdownOpen = false;
  }

  // Filtros de tags (igual que en main.js original)
  initializeTagFilters(): void {
    const tagButtons = document.querySelectorAll('.tag-btn');
    const newsItems = document.querySelectorAll<HTMLElement>('.news-item');

    tagButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const tag = btn.getAttribute('data-tag');
        newsItems.forEach((item) => {
          if (item.getAttribute('data-tag') === tag) {
            item.style.display = 'flex';
          } else {
            item.style.display = 'none';
          }
        });
      });
    });
  }

  mapTypeToTag(type: string): string {
    switch (type) {
      case 'Temas Importantes':
        return 'temas';
      case 'Proyectos Importantes':
        return 'proyectos';
      case 'Interesantes Temas a Investigar':
        return 'investigar';
      case 'Universidades destacadas':
        return 'universidades';
      default:
        return 'temas';
    }
  }

  getIconForType(type: string): string {
    switch (type) {
      case 'Temas Importantes':
        return 'https://cdn-icons-png.flaticon.com/512/3135/3135768.png';
      case 'Proyectos Importantes':
        return 'https://cdn-icons-png.flaticon.com/512/616/616494.png';
      case 'Interesantes Temas a Investigar':
        return 'https://cdn-icons-png.flaticon.com/512/4712/4712027.png';
      case 'Universidades destacadas':
        return 'https://cdn-icons-png.flaticon.com/512/197/197397.png';
      default:
        return 'https://cdn-icons-png.flaticon.com/512/3135/3135768.png';
    }
  }
}