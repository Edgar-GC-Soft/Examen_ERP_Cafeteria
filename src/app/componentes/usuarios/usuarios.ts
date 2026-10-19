import { Component, OnInit, signal } from '@angular/core';
import { Usuario } from '../../modelos/modelos';
import { UsuarioService } from '../../servicios/usuario-service';
import { leerFormulario, mensajeError } from '../../util/util';

@Component({
  selector: 'app-usuarios',
  imports: [],
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.css'
})
export class Usuarios implements OnInit {
  usuarios = signal<Usuario[]>([]); // aqui se guarda la lista que viene del backend
  editando = signal<Usuario | null>(null); // usuario que se esta editando (null = nuevo)
  error = signal('');

  constructor(private usuarioService: UsuarioService) {}

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  cargarUsuarios(): void {
    this.usuarioService.obtenerUsuarios().subscribe({
      next: (datos) => this.usuarios.set(datos),
      error: (e) => this.error.set(mensajeError(e))
    });
  }

  guardar(evento: Event): void {
    const { formulario, datos } = leerFormulario(evento);
    const usuario = {
      nombre: datos['nombre'],
      correo: datos['correo'],
      rol: datos['rol'],
      salario: datos['salario'] === '' ? null : Number(datos['salario']),
      contrasena: datos['contrasena']
    };
    const actual = this.editando();
    const peticion = actual
      ? this.usuarioService.actualizarUsuario(actual.id, usuario)
      : this.usuarioService.agregarUsuario(usuario);

    peticion.subscribe({
      next: () => { this.cargarUsuarios(); this.cancelar(formulario); },
      error: (e) => this.error.set(mensajeError(e))
    });
  }

  editar(usuario: Usuario): void {
    this.editando.set(usuario); // aqui se copian los datos de la fila al formulario
    this.error.set('');
  }

  eliminar(id: number): void {
    this.usuarioService.eliminarUsuario(id).subscribe({
      next: () => this.cargarUsuarios(),
      error: (e) => this.error.set(mensajeError(e))
    });
  }

  cancelar(formulario: HTMLFormElement): void {
    formulario.reset();
    this.editando.set(null);
    this.error.set('');
  }
}
