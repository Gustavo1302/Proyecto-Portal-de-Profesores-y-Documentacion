import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { DocumentUploadComponent } from './document-upload.component';

describe('DocumentUploadComponent', () => {
  let component: DocumentUploadComponent;
  let fixture: ComponentFixture<DocumentUploadComponent>;

  beforeEach(async () => {
    // Simular un teacher logueado para que no salte el alert de ngOnInit
    localStorage.setItem('teacher', JSON.stringify({
      nombre: 'Profesor Prueba',
      email: 'prueba@example.com',
      asignaturas: [],
      institucion: 'Test'
    }));

    await TestBed.configureTestingModule({
      declarations: [DocumentUploadComponent],
      imports: [FormsModule, RouterTestingModule, HttpClientTestingModule]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize teacher data from localStorage', () => {
    expect(component.teacherEmail).toBe('prueba@example.com');
    expect(component.teacherName).toBe('Profesor Prueba');
  });
});
