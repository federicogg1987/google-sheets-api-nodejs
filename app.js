require('dotenv').config();

const express = require('express');
const path = require('path'); // Necesitas el módulo 'path' para rutas absolutas
const { google } = require('googleapis');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ¡Configura Express para servir archivos estáticos desde la carpeta 'public'!
// Esto permite que el navegador pida /css/style.css o /js/script.js
app.use(express.static(path.join(__dirname, 'public')));


async function getSheetsClient() {
  const auth = new google.auth.GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const authClient = await auth.getClient();
  return google.sheets({ version: 'v4', auth: authClient });
}

app.get('/', (req, res) => {
  res.send('API de Google Sheets en Express. Abre /formulario para probar el envío de datos.');
});

// Ruta para mostrar el formulario
app.get('/formulario', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'html', 'formulario.html'));
});

app.post('/enviar-datos', async (req, res) => {
  console.log('Datos recibidos del formulario:', req.body);

  const { jerarquia, nombre, apellido, dni, lugarRevista, telefono } = req.body;

  const now = new Date();
  const dateFormatter = new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
  const formattedDate = dateFormatter.format(now);

  const timeFormatter = new Intl.DateTimeFormat('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  });
  const formattedTime = timeFormatter.format(now);

  const fechaHoraEnvio = `${formattedDate}, ${formattedTime} hs.`;

  try {
    const sheets = await getSheetsClient();
    const spreadsheetId = '1bL9n1f4Kq45_CWpjRFm0i6HXkWJREdYKgewbma9eWug';
    const range = 'Hoja1';
    const values = [[fechaHoraEnvio, jerarquia, nombre, apellido, dni, lugarRevista, telefono]];

    const response = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: 'USER_ENTERED',
      resource: { values },
    });

    // Redirige a una página de confirmación con los datos como parámetros de consulta
    const queryParams = new URLSearchParams({
        fechaHoraEnvio: fechaHoraEnvio,
        jerarquia: jerarquia,
        nombre: nombre,
        apellido: apellido,
        dni: dni,
        lugarRevista: lugarRevista,
        telefono: telefono
    }).toString();
    res.redirect(`/confirmacion?${queryParams}`);

  } catch (error) {
    console.error('Error al enviar datos a Google Sheets:', error.message);
    const errorMessage = encodeURIComponent(error.message);
    res.redirect(`/error?msg=${errorMessage}`);
  }
});

// Nueva ruta para la página de confirmación (si la llamas directamente, no mostrará datos)
app.get('/confirmacion', (req, res) => {
    // res.sendFile(path.join(__dirname, 'public', 'html', 'confirmacion.html'));
    // En lugar de sendFile directo, cargamos el HTML y lo podemos manipular si es necesario
    // Para el ejemplo de `confirmacion.html` que usa JS para leer los params, sendFile es suficiente.
    // Si necesitáramos un motor de plantillas (como EJS, Handlebars), lo haríamos aquí.
    res.sendFile(path.join(__dirname, 'public', 'html', 'confirmacion.html'));
});

// Nueva ruta para la página de error
app.get('/error', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html', 'error.html'));
});


app.get('/about', (req, res) => {
  res.send('Esta es la pagina de informacion.');
});

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
  console.log(`Visita http://localhost:${port}/formulario para probar el formulario.`);
});