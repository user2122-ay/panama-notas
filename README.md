# Notas Escolares — Panamá RP / Colegio

Web app para que cada estudiante registre sus notas (diarias, apreciación, examen) y
ausencias por materia y por trimestre, y vea su boletín calculado automáticamente.

## Fórmula de cálculo

Por cada materia, en cada trimestre:

```
Nota Final = (promedio de notas diarias + promedio de apreciación + promedio de examen) / 3
```

Promedio general del trimestre:

```
Promedio General = (suma de las notas finales de todas las materias) / cantidad de materias
```

## Stack

- Backend: Node.js + Express + MongoDB (Mongoose)
- Autenticación: JWT en cookie httpOnly (cada estudiante tiene su propia cuenta y solo ve sus datos)
- Frontend: HTML/CSS/JS vanilla, responsivo para celular

## Instalación local

1. Instala dependencias:
   ```
   npm install
   ```
2. Copia `.env.example` a `.env` y completa:
   - `MONGO_URI`: cadena de conexión de MongoDB (puedes usar un clúster gratis en MongoDB Atlas)
   - `JWT_SECRET`: cualquier cadena larga y aleatoria
3. Corre en desarrollo:
   ```
   npm run dev
   ```
   o en producción:
   ```
   npm start
   ```
4. Abre `http://localhost:3000`

## Desplegar para que tus compañeros lo usen

Cualquier hosting de Node.js gratuito funciona (Render, Railway, Fly.io, etc.), igual que
sueles desplegar el bot de Panamá RP. Pasos generales:

1. Sube este proyecto a un repositorio de GitHub.
2. Conéctalo a la plataforma de hosting elegida.
3. Configura las variables de entorno `MONGO_URI` y `JWT_SECRET` en el panel del hosting.
4. Despliega — el servicio detecta `npm start` automáticamente.
5. Comparte la URL pública con tus compañeros; cada uno crea su cuenta y ve solo sus propias notas.

## Estructura del proyecto

```
panama-notas/
  server.js              Punto de entrada de Express
  config/db.js           Conexión a MongoDB
  models/                User, Materia, Nota, Ausencia
  middleware/auth.js      Protección de rutas con JWT
  routes/                 auth, materias, notas, ausencias, boletin
  utils/calculos.js       Lógica de promedios y nota final
  public/                 Frontend (index.html = login, app.html = app)
```

## Posibles mejoras futuras

- Editar una nota existente (hoy solo se agrega o elimina)
- Exportar el boletín a PDF
- Vista de profesor/administrador para ver el progreso de varios estudiantes
- Notificaciones cuando una nota baja del mínimo de aprobación
