# Arquitectura de DevMatte

## Decisión aplicada

El proyecto conserva una **arquitectura de monolito modular por capas**, adecuada para un sitio corporativo pequeño con formularios y correo transaccional. No se introdujo un framework ni un bundler adicional: el servidor sigue siendo Express y el navegador carga módulos JavaScript vanilla, reduciendo el riesgo de regresiones y manteniendo el despliegue simple.

## Capas

```text
Navegador
  ├── Presentación: index.html + assets/css/styles.css
  ├── Features: assets/js/main.js, portfolio.js, booking.js, estimator.js,
  │             lead-magnet.js, chatbot.js, roi-calculator.js
  └── Datos visuales: assets/js/projects-data.js + assets/images/

Express
  ├── Transporte HTTP: server.js
  ├── Validación de entrada: validaciones dentro de cada endpoint
  ├── Integración externa: Nodemailer/Gmail
  └── Entrega: archivos estáticos y fallback de index.html
```

## Límites funcionales

- **Landing y navegación:** composición HTML, navegación responsive, animaciones y contacto visual.
- **Identidad visual:** Google Fonts Outfit/Raleway y paleta Pantone DevMatte PMS 546, PMS 548 y PMS 549, con gradientes reservados para los momentos de marca.
- **Motion design:** animaciones de entrada, órbita, brillo, elevación y parallax sutil distribuidas en hero, portafolio, métricas y contacto; todas respetan `prefers-reduced-motion`.
- **Layout:** las secciones de página ocupan el 100% del viewport; el centrado del contenido se resuelve con padding fluido y contenedores internos únicamente donde corresponde.
- **Portafolio:** datos de proyectos, filtros, tarjetas y modal de casos de éxito.
- **Reservas:** modal de Calendly con carga diferida del iframe, control de foco, cooldown de cinco minutos y cierre automático tras diez minutos sin interacción.
- **Carga del cliente:** las librerías y funcionalidades se cargan con `defer` en un orden
  explícito; el iframe de Calendly se crea únicamente al abrir la agenda.
- **Cotizador:** wizard de tres pasos, cálculo referencial, validación, envío a `/api/estimate` y cooldown anti-repetición de 60 segundos.
- **Contacto:** formulario, envío a `/api/contact` y cooldown anti-repetición de 60 segundos.
- **Chatbot:** pausa de 1,2 segundos antes de ejecutar una opción para dar feedback natural y evitar activaciones repetidas.
- **Servidor:** entrega estática, CORS, validación, escape HTML y transporte SMTP.
- **Comunicaciones:** las notificaciones de contacto, cotización y ROI usan una plantilla
  HTML corporativa compartida con colores DevMatte, logotipo inline y jerarquía responsive.
- **Fichas comerciales:** el endpoint de lead magnet genera un PDF de una página con
  composición editorial, tarjetas de capacidades, datos de contacto y branding vectorial.

## Organización de recursos

Los recursos binarios se concentran en `assets/images/`. El logo oficial está disponible como `logo_DevMatte.webp` y se usa tanto en el encabezado como en el pie de página y como favicon. Las rutas de imágenes de proyectos son relativas al documento servido y no dependen del directorio de ejecución del proceso.

## Contratos que se conservan

- `POST /api/contact`: valida `nombre`, `email` y `mensaje`; responde JSON con `success` o `error`.
- `POST /api/estimate`: valida la solución, contacto y estimación; responde JSON con `success` o `error`.
- `data-calendly-url` permanece en el `body` para que `booking.js` controle la configuración sin acoplarla al HTML del modal.
- `window.projectsData` sigue siendo la fuente de datos consumida por `portfolio.js` y `main.js`.
- Los filtros del portafolio usan los sectores corporativos definidos en `index.html`. Si un
  sector todavía no tiene un caso publicado en `projects-data.js`, la interfaz muestra un estado
  vacío accesible en lugar de inventar información.

## Criterio de evolución

Si el proyecto crece, el siguiente paso seguro es extraer `server.js` en `api/routes`, `api/services` y `api/templates`, manteniendo los contratos HTTP. No se hizo esa extracción en esta fase porque el archivo es el entrypoint de producción y el objetivo inmediato era ordenar recursos y branding sin cambiar el comportamiento de envío.
