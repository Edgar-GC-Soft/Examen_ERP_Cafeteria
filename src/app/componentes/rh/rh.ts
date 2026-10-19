import { Component, OnInit, signal } from '@angular/core';
import { Asistencia, Nomina, Usuario } from '../../modelos/modelos';
import { RhService } from '../../servicios/rh-service';
import { UsuarioService } from '../../servicios/usuario-service';
import { leerFormulario, mensajeError } from '../../util/util';

@Component({
  selector: 'app-rh',
  imports: [],
  templateUrl: './rh.html',
  styleUrl: './rh.css'
})
export class Rh implements OnInit {
  asistencias = signal<Asistencia[]>([]);
  nominas = signal<Nomina[]>([]);
  administradores = signal<Usuario[]>([]);
  montoSugerido = signal<number | ''>(''); // salario del administrador elegido
  error = signal('');
  mensaje = signal('');

  constructor(private rhService: RhService, private usuarioService: UsuarioService) {}

  ngOnInit(): void {
    this.cargarAsistencias();
    this.cargarNominas();
    this.usuarioService.obtenerUsuarios().subscribe((usuarios) =>
      this.administradores.set(usuarios.filter((u) => u.rol === 'admin'))
    );
  }

  cargarAsistencias(): void {
    this.rhService.obtenerAsistencias().subscribe((datos) => this.asistencias.set(datos));
  }

  cargarNominas(): void {
    this.rhService.obtenerNominas().subscribe((datos) => this.nominas.set(datos));
  }

  // cada administrador registra su propia asistencia
  registrarLlegada(): void {
    this.rhService.registrarLlegada().subscribe({
      next: () => { this.mensaje.set('Llegada registrada'); this.error.set(''); this.cargarAsistencias(); },
      error: (e) => this.error.set(mensajeError(e))
    });
  }

  registrarSalida(): void {
    this.rhService.registrarSalida().subscribe({
      next: () => { this.mensaje.set('Salida registrada'); this.error.set(''); this.cargarAsistencias(); },
      error: (e) => this.error.set(mensajeError(e))
    });
  }

  elegirAdministrador(id: string): void {
    const admin = this.administradores().find((a) => a.id === Number(id));
    this.montoSugerido.set(admin?.salario ?? '');
  }

  pagarNomina(evento: Event): void {
    const { formulario, datos } = leerFormulario(evento);
    this.rhService.pagarNomina(Number(datos['administradorId']), Number(datos['monto'])).subscribe({
      next: () => {
        this.mensaje.set('Pago de nómina registrado');
        this.error.set('');
        formulario.reset();
        this.montoSugerido.set('');
        this.cargarNominas();
      },
      error: (e) => this.error.set(mensajeError(e))
    });
  }
}
