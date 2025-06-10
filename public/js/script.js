// public/js/script.js

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('dataForm');
    const fields = ['jerarquia', 'nombre', 'apellido', 'dni', 'lugarRevista', 'telefono'];

    // Cargar datos del localStorage al cargar la página
    fields.forEach(field => {
        const storedValue = localStorage.getItem(field);
        if (storedValue) {
            document.getElementById(field).value = storedValue;
        }
    });

    // Guardar datos en localStorage al enviar el formulario (o al cambiar un campo)
    form.addEventListener('submit', () => {
        fields.forEach(field => {
            localStorage.setItem(field, document.getElementById(field).value);
        });
    });

    // Opcional: Guardar cada vez que un campo pierde el foco
    fields.forEach(field => {
        document.getElementById(field).addEventListener('blur', (event) => {
            localStorage.setItem(field, event.target.value);
        });
    });
});