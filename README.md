# 💳 Bill Payments Widget

Aplicación para integrar widgets de pago de servicios, recargas y vouchers crossborder.

## 🚀 Despliegue en Render.com

### Paso 1: Preparar el repositorio

1. Crea un nuevo repositorio en GitHub
2. Sube estos archivos al repositorio:
   ```
   bill-payments-widget/
   ├── package.json
   ├── server.js
   ├── public/
   │   └── index.html
   └── .env.example
   ```

### Paso 2: Crear servicio en Render

1. Ve a [render.com](https://render.com) e inicia sesión
2. Click en **"New +"** → **"Web Service"**
3. Conecta tu repositorio de GitHub
4. Configura el servicio:

   | Campo | Valor |
   |-------|-------|
   | **Name** | `bill-payments-widget` |
   | **Region** | Elige el más cercano |
   | **Branch** | `main` |
   | **Runtime** | `Node` |
   | **Build Command** | `npm install` |
   | **Start Command** | `npm start` |

### Paso 3: Configurar Variables de Entorno

En la sección **"Environment Variables"** de Render, agrega:

| Variable | Descripción |
|----------|-------------|
| `WIDGET_PATH_URL` | URL base del widget (del archivo credentials.json) |
| `WIDGET_CLIENT_ID` | Client ID del widget (GUID) |
| `API_URL` | URL de la API |
| `API_CLIENT_ID` | Client ID de la API |
| `API_CLIENT_SECRET` | Client Secret de la API |

> ⚠️ **Importante**: Obtén estos valores del archivo `credentials.json` que te enviaron.

### Paso 4: Desplegar

Click en **"Create Web Service"**. Render instalará dependencias y desplegará automáticamente.

Tu app estará disponible en: `https://tu-app.onrender.com`

---

## 🧪 Datos de Prueba

| País | Empresa | Tipo | Modalidad | Valor | Resultado |
|------|---------|------|-----------|-------|-----------|
| CHL | Adt | Service | Teléfono | `561122334455` | COMPLETED (1ra deuda) |
| CHL | Adt | Service | Cuenta | `ABC-1234-ADT` | REVERSED (2da deuda) |
| ARG | Arca | Service | DNI | `39694212` | COMPLETED (1ra deuda) |
| ARG | Claro | Recargas | Teléfono | `3411122233` | COMPLETED (1er producto) |
| CHL | Entel | Recargas | Teléfono | `1112223344` | COMPLETED (1er producto) |
| ARG | Xbox | Voucher | — | — | COMPLETED (1er producto) |

---

## 📋 Flujo de Integración

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Tu App        │     │   Widget        │     │   API           │
│   (Frontend)    │     │   (iframe)      │     │   (Backend)     │
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │                       │                       │
         │  1. Carga widget      │                       │
         │──────────────────────>│                       │
         │                       │                       │
         │  2. Usuario completa  │                       │
         │       flujo           │                       │
         │                       │                       │
         │  3. onComplete(quote) │                       │
         │<──────────────────────│                       │
         │                       │                       │
         │  4. POST /pay/{type}  │                       │
         │──────────────────────────────────────────────>│
         │                       │                       │
         │  5. Respuesta pago    │                       │
         │<──────────────────────────────────────────────│
         │                       │                       │
         │  6. GET /operation/{id} (polling)             │
         │──────────────────────────────────────────────>│
         │                       │                       │
```

---

## 🎨 Personalización de Estilos

Puedes personalizar los colores del widget editando el objeto `window.rmt.theme` en `public/index.html`:

```javascript
window.rmt = {
  theme: {
    typography: "Tu Fuente",
    primaryColor: "#TuColor",
    secondaryColor: "#TuColor",
    // ... más opciones
  }
};
```

---

## 📁 Estructura del Proyecto

```
bill-payments-widget/
├── package.json        # Dependencias y scripts
├── server.js           # Servidor Express + rutas API
├── public/
│   └── index.html      # Frontend con widgets embebidos
└── .env.example        # Plantilla de variables de entorno
```

---

## 🔧 Desarrollo Local

```bash
# 1. Clonar e instalar
npm install

# 2. Configurar variables
cp .env.example .env
# Edita .env con tus credenciales

# 3. Ejecutar
npm start

# 4. Abrir http://localhost:3000
```

---

## 📝 Endpoints de la API

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/config` | Configuración del widget |
| `POST` | `/api/pay/service` | Pagar servicio |
| `POST` | `/api/pay/recharge` | Pagar recarga |
| `POST` | `/api/pay/voucher` | Pagar voucher |
| `GET` | `/api/operation/:id` | Estado de operación |

---

## ⚠️ Recomendaciones de Seguridad

- Nunca expongas `API_CLIENT_SECRET` en el frontend
- Usa siempre HTTPS en producción
- Valida `expirationDate` antes de procesar pagos
- Genera `externalReferenceId` único por transacción
- Implementa rate limiting en producción

---

## 🆘 Soporte

Si tienes problemas con las credenciales o el widget, contacta al proveedor de Bill Payments.
