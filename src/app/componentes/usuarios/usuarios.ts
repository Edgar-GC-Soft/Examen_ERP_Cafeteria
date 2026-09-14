import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms'; // aqui se importa para usar [(ngModel)]
import { Usuario, UsuarioService } from '../../servicios/usuario-service';

@Component({
  selector: 'app-usuarios',
  imports: [FormsModule],
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.css'
})
export class Usuarios implements OnInit {
  usuarios = signal<Usuario[]>([]); // aqui se guarda la lista que viene del backend

  form = {
    id: 0,
    nombre: '',
    correo: '',
    passwordHash: '',
    rol: 'Administrador',
    salario: null as number | null
  };

  editando = signal(false); // aqui se sabe si el formulario esta editando o creando

  constructor(private usuarioService: UsuarioService) {}

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  cargarUsuarios(): void {
    this.usuarioService.obtenerUsuarios().subscribe({
      next: (datos) => this.usuarios.set(datos),
      error: (error) => console.error('Error al obtener usuarios', error)
    });
  }

  guardar(): void {
    if (this.editando()) {
      this.usuarioService.actualizarUsuario(this.form.id, this.form).subscribe({
        next: () => { this.cargarUsuarios(); this.limpiarFormulario(); },
        error: (error) => console.error('Error al actualizar usuario', error)
      });
    } else {
      this.usuarioService.agregarUsuario(this.form).subscribe({
        next: () => { this.cargarUsuarios(); this.limpiarFormulario(); },
        error: (error) => console.error('Error al agregar usuario', error)
      });
    }
  }

  editar(usuario: Usuario): void {
    this.form = { ...usuario }; // aqui se copian los datos de la fila al formulario
    this.editando.set(true);
  }

  eliminar(id: number): void {
    this.usuarioService.eliminarUsuario(id).subscribe({
      next: () => this.cargarUsuarios(),
      error: (error) => console.error('Error al eliminar usuario', error)
    });
  }

  limpiarFormulario(): void {
    this.form = { id: 0, nombre: '', correo: '', passwordHash: '', rol: 'Administrador', salario: null };
    this.editando.set(false);
  }
}