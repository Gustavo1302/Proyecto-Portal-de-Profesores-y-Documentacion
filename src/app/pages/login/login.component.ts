import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TeacherService } from '../../services/teacher.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  email: string = '';
  password: string = '';
  statusMessage: string = '';
  messageType: 'success' | 'error' | '' = '';
  loading: boolean = false;

  constructor(
    private teacherService: TeacherService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.setupNavigation();
  }

  onSubmit(): void {
    this.loading = true;
    this.showMessage('Iniciando sesión...', 'success');
    const data = {
      email: this.email,
      password: this.password
    };

    this.teacherService.login(data).subscribe({
      next: (json: any) => {
        localStorage.setItem('teacher', JSON.stringify(json.teacher));
        this.showMessage(`Iniciando, ${json.teacher.nombre}...`, 'success');

        setTimeout(() => {
          this.router.navigate(['/main']);
        }, 1500);
      },
      error: (err: any) => {
        console.error(err);
        const backendMessage = err?.error?.message as string | undefined;
        this.showMessage(backendMessage || 'No fue posible iniciar sesión. Verifica tus datos e inténtalo nuevamente.', 'error');
        this.loading = false;
      }
    });
  }

  showMessage(message: string, type: 'success' | 'error'): void {
    this.statusMessage = message;
    this.messageType = type;
  }

  setupNavigation(): void {
    const goRegister = document.getElementById('goRegister');
    if (goRegister) {
      goRegister.addEventListener('click', () => {
        this.router.navigate(['/register']);
      });
    }

    const goHome = document.getElementById('goHome');
    if (goHome) {
      goHome.addEventListener('click', () => {
        this.router.navigate(['/main']);
      });
    }
  }
}