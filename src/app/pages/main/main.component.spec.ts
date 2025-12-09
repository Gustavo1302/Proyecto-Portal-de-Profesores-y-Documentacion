import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { MainComponent } from './main.component';
import { DocumentService } from '../../services/document.service';

describe('MainComponent', () => {
  let component: MainComponent;
  let fixture: ComponentFixture<MainComponent>;
  let documentService: jasmine.SpyObj<DocumentService>;

  beforeEach(async () => {
    const docServiceSpy = jasmine.createSpyObj('DocumentService', ['getAllDocuments']);

    await TestBed.configureTestingModule({
      declarations: [ MainComponent ],
      imports: [RouterTestingModule, HttpClientTestingModule],
      providers: [{ provide: DocumentService, useValue: docServiceSpy }]
    })
    .compileComponents();

    documentService = TestBed.inject(DocumentService) as jasmine.SpyObj<DocumentService>;
    // Valor por defecto para evitar undefined.subscribe en otros tests
    documentService.getAllDocuments.and.returnValue(of([]));
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

   it('should load documents on init', () => {
    const mockDocs = [
      {
        _id: '1',
        title: 'Doc Test',
        description: 'Desc',
        type: 'Temas Importantes',
        fileUrl: '/uploads/test.pdf',
        authorName: 'Autor',
        authorEmail: 'autor@example.com'
      }
    ];

    documentService.getAllDocuments.and.returnValue(of(mockDocs));

    component.ngOnInit();

    expect(documentService.getAllDocuments).toHaveBeenCalled();
    expect(component.documents.length).toBe(1);
    expect(component.documents[0].title).toBe('Doc Test');
  });
});
