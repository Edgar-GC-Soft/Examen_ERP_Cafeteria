import { Injectable, computed, signal } from '@angular/core';
import { ItemCarrito, Producto, ProductoCarrito } from '../modelos/modelos';

@Injectable({
  providedIn: 'root'
})
export class CarritoService {
  items = signal<ItemCarrito[]>([]);

  // solo para mostrar: el backend vuelve a calcular todo con los precios de la BD
  subtotal = computed(() =>
    this.items().reduce((total, i) => total + Math.round(i.producto.costoVenta * 100) * i.cantidad, 0) / 100
  );
  iva = computed(() => Math.round(this.subtotal() * 16) / 100);
  total = computed(() => Math.round((this.subtotal() + this.iva()) * 100) / 100);

  agregar(producto: Producto): void {
    const existe = this.items().find((i) => i.producto.id === producto.id);
    if (existe) {
      this.cambiarCantidad(producto.id, 1);
    } else if (producto.stock > 0) {
      this.items.update((lista) => [...lista, { producto, cantidad: 1 }]);
    }
  }

  // suma o resta cantidad (sin pasar de 1 ni del stock disponible)
  cambiarCantidad(id: number, cambio: number): void {
    this.items.update((lista) =>
      lista.map((i) => {
        const cantidad = i.cantidad + cambio;
        return i.producto.id === id && cantidad >= 1 && cantidad <= i.producto.stock ? { ...i, cantidad } : i;
      })
    );
  }

  quitar(id: number): void {
    this.items.update((lista) => lista.filter((i) => i.producto.id !== id));
  }

  vaciar(): void {
    this.items.set([]);
  }

  // formato que espera el backend
  productos(): ProductoCarrito[] {
    return this.items().map((i) => ({ id: i.producto.id, cantidad: i.cantidad }));
  }
}
