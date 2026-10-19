import { Component, OnInit, signal } from '@angular/core';
import { Proveedor } from '../../modelos/modelos';
import { ProveedorService } from '../../servicios/proveedor-service';
import { leerFormulario, mensajeError } from '../../util/util';

@Component({
  selector: 'app-proveedores',
  imports: [],
  templateUrl: './proveedores.html',
  styleUrl: './proveedores.css'
})
export class Proveedores implements OnInit {
  proveedores = signal<Proveedor[]>([]);
  editando = signal<Proveedor | null>(null);
  error = signal('');

  constructor(private proveedorService: ProveedorService) {}

  ngOnInit(): void {
    this.cargarProveedores();
  }

  cargarProveedores(): void {
    this.proveedorService.obtenerProveedores().subscribe({
      next: (datos) => this.proveedores.set(datos),
      error: (e) => this.error.set(mensajeError(e))
    });
  }

  guardar(evento: Event): void {
    const { formulario, datos } = leerFormulario(evento);
    const proveedor = {
      nombre: datos['nombre'],
      contacto: datos['contacto'],
      telefono: datos['telefono'],
      correo: datos['correo'],
      direccion: datos['direccion']
    };
    const actual = this.editando();
    const peticion = actual
      ? this.proveedorService.actualizarProveedor(actual.id, proveedor)
      : this.proveedorService.agregarProveedor(proveedor);

    peticion.subscribe({
      next: () => { this.cargarProveedores(); this.cancelar(formulario); },
      error: (e) => this.error.set(mensajeError(e))
    });
  }

  editar(proveedor: Proveedor): void {
    this.editando.set(proveedor);
    this.error.set('');
  }

  cancelar(formulario: HTMLFormElement): void {
    formulario.reset();
    this.editando.set(null);
    this.error.set('');
  }
}
