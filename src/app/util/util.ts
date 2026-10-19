// lee los campos de un <form> (por su atributo name) y evita que la pagina se recargue
export function leerFormulario(evento: Event) {
  evento.preventDefault();
  const formulario = evento.target as HTMLFormElement;
  const datos = Object.fromEntries(new FormData(formulario)) as Record<string, string>;
  return { formulario, datos };
}

// mensaje de error que manda el backend ({ mensaje: '...' })
export function mensajeError(error: any, defecto = 'No se pudo completar la operación'): string {
  if (error?.status === 0) {
    return 'No se pudo conectar con el servidor';
  }
  return error?.error?.mensaje ?? defecto;
}
