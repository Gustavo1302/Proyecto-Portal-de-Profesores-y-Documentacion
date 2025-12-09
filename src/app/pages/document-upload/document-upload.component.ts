import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DocumentService, DocumentItem } from '../../services/document.service';

@Component({
  selector: 'app-document-upload',
  templateUrl: './document-upload.component.html',
  styleUrls: ['./document-upload.component.css']
})
export class DocumentUploadComponent implements OnInit {
  title: string = '';
  description: string = '';
  type: string = '';
  selectedFile: File | null = null;
  teacherEmail: string = '';
  teacherName: string = '';
  statusMessage: string = '';
  messageType: 'success' | 'error' | '' = '';
  documents: DocumentItem[] = [];
  selectedDocument: DocumentItem | null = null;
  isEditing: boolean = false;

  readonly allowedTypes: string[] = [
    'Temas Importantes',
    'Proyectos Importantes',
    'Interesantes Temas a Investigar',
    'Universidades destacadas'
  ];

  constructor(
    private documentService: DocumentService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const teacher = localStorage.getItem('teacher');
    if (!teacher) {
      alert('Debes estar autenticado para subir documentos');
      this.router.navigate(['/login']);
      return;
    }

    const teacherData = JSON.parse(teacher);
    this.teacherEmail = teacherData.email || '';
    this.teacherName = teacherData.nombre || '';

    this.loadMyDocuments();
  }

  loadMyDocuments(): void {
    if (!this.teacherEmail) {
      return;
    }
    this.documentService.getDocumentsByAuthor(this.teacherEmail).subscribe({
      next: (docs) => {
        this.documents = docs || [];
      },
      error: (err) => {
        console.error('Error al cargar documentos del autor', err);
      }
    });
  }

  onFileChange(event: any): void {
    const file = event.target.files && event.target.files[0];
    this.selectedFile = file || null;
  }

  onSubmit(): void {
    if (!this.title.trim() || !this.description.trim() || !this.type.trim()) {
      this.showMessage('Por favor completa todos los campos requeridos', 'error');
      return;
    }

    if (this.isEditing) {
      this.updateCurrentDocument();
    } else {
      this.createNewDocument();
    }
  }

  createNewDocument(): void {
    if (!this.selectedFile) {
      this.showMessage('Debes seleccionar un archivo PDF o PPT/PPTX', 'error');
      return;
    }

    const formData = new FormData();
    formData.append('title', this.title);
    formData.append('description', this.description);
    formData.append('type', this.type);
    formData.append('authorEmail', this.teacherEmail);
    formData.append('file', this.selectedFile);

    this.documentService.uploadDocument(formData).subscribe({
      next: (res) => {
        this.showMessage('Documento subido correctamente', 'success');
        if (res && res.document) {
          this.documents.unshift(res.document);
        } else {
          this.loadMyDocuments();
        }
        this.resetForm();
      },
      error: (err) => {
        console.error(err);
        const msg = err?.error?.message || 'Error al subir el documento';
        this.showMessage(msg, 'error');
      }
    });
  }

  updateCurrentDocument(): void {
    if (!this.selectedDocument || !this.selectedDocument._id) {
      return;
    }

    const formData = new FormData();
    formData.append('title', this.title);
    formData.append('description', this.description);
    formData.append('type', this.type);
    formData.append('authorEmail', this.teacherEmail);

    if (this.selectedFile) {
      formData.append('file', this.selectedFile);
    }

    this.documentService.updateDocument(this.selectedDocument._id, formData).subscribe({
      next: (res) => {
        this.showMessage('Documento actualizado correctamente', 'success');
        if (res && res.document) {
          const idx = this.documents.findIndex(d => d._id === res.document._id);
          if (idx >= 0) {
            this.documents[idx] = res.document;
          }
        } else {
          this.loadMyDocuments();
        }
        this.resetForm();
      },
      error: (err) => {
        console.error(err);
        const msg = err?.error?.message || 'Error al actualizar el documento';
        this.showMessage(msg, 'error');
      }
    });
  }

  resetForm(): void {
    this.title = '';
    this.description = '';
    this.type = '';
    this.selectedFile = null;
    this.selectedDocument = null;
    this.isEditing = false;
  }

  showMessage(message: string, type: 'success' | 'error'): void {
    this.statusMessage = message;
    this.messageType = type;

    if (type === 'success') {
      setTimeout(() => {
        this.statusMessage = '';
        this.messageType = '';
      }, 1500);
    }
  }

  startEdit(doc: DocumentItem): void {
    this.selectedDocument = doc;
    this.isEditing = true;
    this.title = doc.title;
    this.description = doc.description;
    this.type = doc.type;
    this.selectedFile = null;
  }

  deleteSelected(): void {
    if (!this.selectedDocument || !this.selectedDocument._id) {
      return;
    }
    if (!confirm('¿Seguro que deseas eliminar este documento?')) {
      return;
    }

    this.documentService.deleteDocument(this.selectedDocument._id, this.teacherEmail).subscribe({
      next: () => {
        this.showMessage('Documento eliminado correctamente', 'success');
        this.documents = this.documents.filter(d => d._id !== this.selectedDocument!._id);
        this.resetForm();
      },
      error: (err) => {
        console.error(err);
        const msg = err?.error?.message || 'Error al eliminar el documento';
        this.showMessage(msg, 'error');
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/settings']);
  }

  goToMain(): void {
    this.router.navigate(['/main']);
  }
}
