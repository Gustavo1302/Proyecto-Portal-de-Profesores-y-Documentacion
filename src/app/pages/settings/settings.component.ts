import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TeacherService } from '../../services/teacher.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
  nombre: string = '';
  email: string = '';
  asignaturas: string = '';
  institucion: string = '';
  currentPassword: string = '';
  newPassword: string = '';
  confirmPassword: string = '';
  statusMessage: string = '';
  messageType: 'success' | 'error' | '' = '';
  teacherData: any = null;

  constructor(
    private teacherService: TeacherService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const teacher = localStorage.getItem('teacher');
    if (!teacher) {
      alert('Debes estar autenticado para acceder a configuración');
      this.router.navigate(['/login']);
      return;
    }

    this.teacherData = JSON.parse(teacher);
    this.loadFormData();
  }

  loadFormData(): void {
    this.nombre = this.teacherData.nombre || '';
    this.email = this.teacherData.email || '';
    const asignaturas = Array.isArray(this.teacherData.asignaturas)
      ? this.teacherData.asignaturas.join(', ')
      : this.teacherData.asignaturas || '';
    this.asignaturas = asignaturas;
    this.institucion = this.teacherData.institucion || '';
  }

  onSubmit(): void {
    // Validaciones
    if (!this.nombre.trim() || !this.email.trim() || !this.asignaturas.trim() || !this.institucion.trim()) {
      this.showMessage('Por favor completa todos los campos requeridos', 'error');
      return;
    }

    // Verificar si realmente hay cambios en los datos básicos
    const asignaturasNorm = this.asignaturas.trim();
    const asignaturasOriginal = Array.isArray(this.teacherData.asignaturas)
      ? this.teacherData.asignaturas.join(', ')
      : (this.teacherData.asignaturas || '');

    const noBasicChanges =
      this.nombre.trim() === (this.teacherData.nombre || '').trim() &&
      this.email.trim() === (this.teacherData.email || '').trim() &&
      asignaturasNorm === asignaturasOriginal.trim() &&
      this.institucion.trim() === (this.teacherData.institucion || '').trim();

    // Validar cambio de contraseña SOLO si el usuario intenta cambiarla
    const wantsPasswordChange = this.newPassword.trim() !== '' || this.confirmPassword.trim() !== '';

    // Si no cambió nada y tampoco quiere cambiar la contraseña, avisar y no llamar a la API
    if (noBasicChanges && !wantsPasswordChange) {
      this.showMessage('No se realizó ningún cambio', 'error');
      return;
    }

    if (wantsPasswordChange) {
      if (!this.currentPassword.trim()) {
        this.showMessage('Debes ingresar tu contraseña actual para cambiarla', 'error');
        return;
      }
      if (!this.newPassword.trim() || !this.confirmPassword.trim()) {
        this.showMessage('Debes ingresar y confirmar la nueva contraseña', 'error');
        return;
      }
      if (this.newPassword !== this.confirmPassword) {
        this.showMessage('Las contraseñas nuevas no coinciden', 'error');
        return;
      }
      if (this.newPassword.length < 6) {
        this.showMessage('La nueva contraseña debe tener al menos 6 caracteres', 'error');
        return;
      }
    }

    this.sendUpdateRequest();
  }

  sendUpdateRequest(): void {
    const data = {
      nombre: this.nombre,
      email: this.email,
      asignaturas: this.asignaturas,
      institucion: this.institucion,
      currentPassword: this.currentPassword || undefined,
      newPassword: this.newPassword || undefined
    };

    this.teacherService.updateTeacher(data).subscribe({
      next: (json: any) => {
        if (json.success) {
          const teacherData = JSON.parse(localStorage.getItem('teacher')!);
          const updatedData = {
            ...teacherData,
            nombre: data.nombre,
            email: data.email,
            asignaturas: data.asignaturas.split(',').map((s: string) => s.trim()),
            institucion: data.institucion
          };
          localStorage.setItem('teacher', JSON.stringify(updatedData));
          this.showMessage('✓ Cambios guardados correctamente', 'success');

          setTimeout(() => {
            this.router.navigate(['/main']);
          }, 1500);
        } else {
          this.showMessage(json.message || 'Error al guardar los cambios', 'error');
        }
      },
      error: (err: any) => {
        console.error(err);
        this.showMessage('Error de conexión con el servidor', 'error');
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
      }, 1500);
    }
  }

  goToUpload(): void {
    this.router.navigate(['/upload-document']);
  }

  goBack(): void {
    window.history.back();
  }

  goToMain(): void {
    this.router.navigate(['/main']);
  }
}