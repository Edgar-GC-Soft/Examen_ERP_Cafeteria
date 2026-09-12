class Usuario {
    constructor(id, nombre, correo, passwordHash, rol, salario) {
        this.id = id;
        this.nombre = nombre;
        this.correo = correo;
        this.passwordHash = passwordHash;
        this.rol = rol;
        this.salario = salario;
    }
}

module.exports = Usuario;