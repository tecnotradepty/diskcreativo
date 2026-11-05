# 💿 Disk Creativo — Infraestructura Digital

> **Agencia de infraestructura digital, desarrollo de ecosistemas B2B, plataformas SaaS y Landing Pages transaccionales de alto rendimiento en Panamá.**

---

## 🏗️ Arquitectura del Repositorio

El proyecto implementa un flujo de trabajo de 3 niveles para desarrollo ágil y seguro:

```
diskcreativo/
│
├── index.html                  # 🟢 VERSIÓN ESTABLE (Producción / Landing Oficial)
├── experimento.html            # 🧪 VERSIÓN VALIDACIÓN (Staging de mejoras probadas)
├── exper.html                  # 🔬 LABORATORIO EXPERIMENTAL (Pruebas puras y sandbox)
├── dex.html                    # 💻 COMPILADOR B2B (Terminal interactiva / Cotizador OS)
│
├── server.js                   # Servidor HTTP ultraligero local en Node.js
├── iniciar-servidor.bat        # Acceso directo para levantar el entorno en Windows
├── README.md                   # Esta documentación
│
├── assets/                     # 📦 RECURSOS MODULARES
│   ├── css/
│   │   ├── main.css            # Estilos globales (Variables, Reset, Navbar, Footer, Lienzo)
│   │   ├── landing.css         # Hero 3D, cubos espaciales, tipografía y portafolio dinámico
│   │   └── terminal.css        # Consola OS interactiva de compilación B2B
│   │
│   ├── js/
│   │   ├── main.js             # Comportamiento reactivo de Navbar y scroll
│   │   ├── portfolio.js        # Integración con Google Sheets API y físicas 3D de tarjetas
│   │   └── terminal.js         # Lógica de la terminal OS y generador de brief para WhatsApp
│   │
│   └── images/
│       ├── brand/              # Identidad visual (disco-3d.png, logo-nav.png, tocadiscos-cta.png)
│       ├── backgrounds/        # Fondos (escenario-lampara.png, cinta-analogica.jpg)
│       ├── editorial/          # Renders 3D (playground-3d.png, maqueta-movil.png, laptop-proyectos.png)
│       └── projects/           # Capturas de pantalla de proyectos en portafolio
│
└── _archive/                   # 🗄️ Historial de renders anteriores para resguardo
```

---

## ⚡ Cómo Iniciar el Proyecto Localmente

### Opción 1: Acceso rápido en Windows
Haz doble clic sobre:
```
iniciar-servidor.bat
```
Esto levantará el servidor local y abrirá tu navegador automáticamente en `http://localhost:3000/`.

### Opción 2: Desde la terminal
```bash
node server.js
```

### URLs del entorno:
* **Producción Estable:** [http://localhost:3000/](http://localhost:3000/)
* **Compilador B2B:** [http://localhost:3000/dex.html](http://localhost:3000/dex.html)
* **Staging / Validación:** [http://localhost:3000/experimento.html](http://localhost:3000/experimento.html)
* **Laboratorio Experimental:** [http://localhost:3000/exper.html](http://localhost:3000/exper.html)

---

## 🛠️ Tecnologías y Características

* **Frontend Nativo:** HTML5 semántico, CSS3 moderno (Variables CSS, Flexbox, Grid 3D, Transform 3D, Clamps fluidos) y Vanilla JavaScript sin dependencias pesadas.
* **Responsive Móvil Blindado:**
  * Uso de `100dvh` (Dynamic Viewport Height) para evitar saltos en barras de navegación móviles.
  * Tipografía con matemática proporcional en unidades `em` y blindaje contra ruptura de palabras (`word-break: keep-all; hyphens: none`).
  * Ajuste de capas para que el disco 3D, el título y el reproductor no colisionen en pantallas estrechas.
* **Integración Dinámica:** Consumo asíncrono de base de datos de proyectos vía Google Apps Script (Google Sheets).
* **Compilador B2B a WhatsApp:** Sistema interactivo que califica requerimientos y presupuesto generando un payload preformateado para WhatsApp Business.
