import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TeacherService } from '../../services/teacher.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  nombre: string = '';
  email: string = '';
  asignaturas: string = '';
  institucion: string = '';
  password: string = '';
  confirmar: string = '';
  statusMessage: string = '';
  messageType: 'success' | 'error' | '' = '';

  constructor(
    private teacherService: TeacherService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.setupNavigation();
  }

  onSubmit(): void {
    const data = {
      nombre: this.nombre,
      email: this.email,
      asignaturas: this.asignaturas,
      institucion: this.institucion,
      password: this.password,
      confirmar: this.confirmar
    };

    this.teacherService.register(data).subscribe({
      next: (json: any) => {
        this.showMessage(json.message || 'Profesor registrado exitosamente', 'success');
        this.nombre = '';
        this.email = '';
        this.asignaturas = '';
        this.institucion = '';
        this.password = '';
        this.confirmar = '';
      },
      error: (err: any) => {
        console.error(err);

        const backendMessage = err?.error?.message as string | undefined;

        if (backendMessage && backendMessage.includes('correo ya está registrado')) {
          this.showMessage('El correo ingresado ya se encuentra registrado. Por favor utiliza una dirección de correo diferente.', 'error');
        } else {
          this.showMessage(backendMessage || 'Ocurrió un error al procesar el registro. Inténtalo nuevamente más tarde.', 'error');
        }
      }
    });
  }

  showMessage(message: string, type: 'success' | 'error'): void {
    this.statusMessage = message;
    this.messageType = type;

    if (type === 'success') {
      setTimeout(() => {
        this.statusMessage = '';
        this.messageType = '';
      }, 2000);
    }
  }

  setupNavigation(): void {
    const backLogin = document.getElementById('backLogin');
    if (backLogin) {
      backLogin.addEventListener('click', () => {
        this.router.navigate(['/login']);
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