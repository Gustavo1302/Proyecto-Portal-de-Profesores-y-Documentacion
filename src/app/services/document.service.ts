import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface DocumentItem {
  _id?: string;
  title: string;
  description: string;
  type: string;
  fileUrl: string;
  authorName: string;
  authorEmail: string;
  teacher?: string;
  createdAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  private baseUrl = environment.apiUrl.replace(/\/$/, '').replace(/:3000/, ':4000') + '/documents';

  constructor(private http: HttpClient) {}

  uploadDocument(formData: FormData): Observable<any> {
    return this.http.post(`${this.baseUrl}/upload`, formData);
  }

  getAllDocuments(): Observable<DocumentItem[]> {
    return this.http.get<DocumentItem[]>(this.baseUrl);
  }

  getDocumentsByAuthor(email: string): Observable<DocumentItem[]> {
    return this.http.get<DocumentItem[]>(`${this.baseUrl}/author/${encodeURIComponent(email)}`);
  }

  updateDocument(id: string, formData: FormData): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, formData);
  }

  deleteDocument(id: string, authorEmail: string): Observable<any> {
    const url = `${this.baseUrl}/${id}?authorEmail=${encodeURIComponent(authorEmail)}`;
    return this.http.delete(url);
  }
}
