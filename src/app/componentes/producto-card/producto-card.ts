import { Component, input, output } from '@angular/core'; // aqui se importan input y output

@Component({
  selector: 'app-producto-card',
  imports: [],
  templateUrl: './producto-card.html',
  styleUrl: './producto-card.css'
})
export class ProductoCard {
  nombre = input.required<string>(); // aqui se recibe el nombre desde el componente padre
  precio = input.required<number>(); // aqui se recibe el precio desde el componente padre
  imagen = input.required<string>(); // aqui se recibe la imagen desde el componente padre
  stock = input.required<number>(); // aqui se recibe el stock desde el componente padre
  agregar = output<void>(); // aqui se avisa al componente padre que se agrego al carrito
}
