# API de Productos - Arquitectura en Capas (Persistencia en Memoria)

Bienvenido a este proyecto de aprendizaje. El objetivo de esta API es comprender el flujo de la información en el backend utilizando **Node.js** y **ES Modules**. 

Para enfocarnos 100% en la lógica de programación y la estructura del proyecto, esta primera versión utiliza **persistencia en memoria** (un arreglo de datos) en lugar de un motor de base de datos tradicional. Esto nos permite aislar el aprendizaje de la arquitectura antes de introducir la complejidad de SQL.

---

## 1. Instalación y Configuración Inicial

Para poner en marcha este proyecto, primero debemos inicializar nuestro entorno de Node e instalar las herramientas necesarias.

### Comandos de instalación:
```bash
# 1. Inicializar el proyecto (crea el package.json)
npm init -y

# 2. Instalar el framework principal
npm install express

# 3. Instalar la herramienta de desarrollo (como dependencia de desarrollo)
npm install -D nodemon
``
## 2. Estructura Jerárquica del Proyecto

Para poner en marcha este proyecto, primero debemos inicializar nuestro entorno de Node e instalar las herramientas necesarias.
`
```
## 2. Estructura Jerárquica del Proyecto

La siguiente estructura organiza el código fuente separando la configuración global de la lógica de negocio y el almacenamiento de datos.

```bash
.
├── src/
│   ├── controllers/
│   │   └── product.controller.js    # Manejo de peticiones y respuestas HTTP
│   ├── data/
│   │   └── products.data.js         # Fuente de datos (Arreglo en memoria)
│   ├── models/
│   │   └── product.model.js         # Lógica de acceso y manipulación de datos
│   ├── routes/
│   │   └── product.routes.js        # Definición de rutas y endpoints
│   └── app.js                       # Configuración y middlewares de Express
├── .gitignore                       # Archivos excluidos de Git (node_modules, .env)
├── package.json                     # Dependencias y scripts del proyecto
├── README.md                        # Documentación técnica
└── server.js                        # Punto de entrada y arranque del servidor

```

### 3. Guía de Componentes y Capas

Para que nuestro código sea ordenado y profesional, dividimos las tareas en diferentes "capas". Así es como funciona cada una:

* **Raíz (`/`):** Es la base del proyecto. Aquí se encuentra el archivo **`server.js`**, que funciona únicamente como el **"interruptor"** de encendido. Su única misión es importar la configuración de la aplicación (`app.js`) y dar la orden de inicio para que el servidor empiece a escuchar peticiones.

* **Carpeta `src/` (Source):** Es el corazón del proyecto donde vive todo nuestro código fuente.
    * **`app.js` (El Motor):** Aquí es donde realmente **se configura el servidor**. Es el encargado de preparar a Express, instalar las herramientas de lectura (como el formato JSON) y conectar las rutas globales. Sin este archivo, el servidor no sabría cómo procesar la información.

* **Capas Internas (El flujo de trabajo):**
    * **Routes (Rutas):** Es la "recepción" de nuestra API. Su trabajo es recibir la visita del usuario (la URL) y decidir a qué oficina (Controlador) debe enviarlo según lo que necesite hacer.
    * **Controllers (Controladores):** Es el "cerebro" que toma las decisiones. Recibe los datos que envía el usuario, le pide ayuda al Modelo para procesarlos y finalmente responde al cliente con un mensaje de éxito o de error.
    * **Models (Modelos):** Es el "especialista" en los datos. Es el único que sabe cómo buscar, filtrar o eliminar información. El resto de la aplicación no toca los datos directamente; siempre le pide el favor al Modelo.
    * **Data (Almacén):** Es nuestra "bodega" temporal. Aquí guardamos el arreglo de objetos con nuestros productos. En esta etapa, los datos viven en la memoria, lo que nos permite practicar antes de usar una base de datos real.
---

## Módulo de Autorización RBAC

### Arquitectura de Seguridad

La aplicación implementa dos capas de seguridad en cadena:

```
petición → verifyToken (¿quién eres?) → checkPermission (¿qué puedes hacer?) → controlador
```

### Matriz RBAC

| Rol | Permiso atómico | Campo de acción permitido |
|-----|----------------|--------------------------|
| `admin` | `products.read` | Ver lista y detalle de cualquier producto |
| `admin` | `products.create` | Crear nuevos productos en el inventario |
| `admin` | `products.update` | Editar nombre, precio y categoría de productos |
| `admin` | `products.delete` | Eliminar permanentemente cualquier producto |
| `admin` | `categories.read` | Ver lista y detalle de cualquier categoría |
| `admin` | `categories.create` | Crear nuevas categorías de productos |
| `admin` | `categories.update` | Editar el nombre de una categoría existente |
| `admin` | `categories.delete` | Eliminar categorías sin productos vinculados |
| `admin` | `users.read` | Listar todos los usuarios registrados del sistema |
| `user` | `products.read` | Solo puede ver productos, no modificarlos |
| `user` | `categories.read` | Solo puede ver categorías, no modificarlas |

### Dos versiones del guardia de seguridad

**`checkPermission` (mapa estático):** Verifica permisos contra un mapa hardcodeado en memoria. Rápido, sin consultas a BD. Se usa en rutas de uso frecuente (CRUD de productos y categorías).

**`checkPermissionFromDB` (radio de seguridad):** Consulta la BD en tiempo real en cada petición. Si un admin cambia permisos, el efecto es inmediato sin necesidad de que el usuario cierre sesión. Se usa en rutas críticas de administración (`GET /auth/users`).

### Endpoints y permisos requeridos

| Método | Ruta | Autenticación | Permiso requerido |
|--------|------|--------------|------------------|
| POST | `/auth/register` | No | — |
| POST | `/auth/login` | No | — |
| POST | `/auth/refresh` | No | — |
| GET | `/auth/me` | JWT | — (solo requiere token) |
| GET | `/auth/users` | JWT | `users.read` (solo admin) |
| GET | `/products` | JWT | — |
| GET | `/products/:id` | JWT | — |
| POST | `/products` | JWT | `products.create` |
| PUT | `/products/:id` | JWT | `products.update` |
| DELETE | `/products/:id` | JWT | `products.delete` |
| GET | `/categories` | JWT | — |
| GET | `/categories/:id` | JWT | — |
| GET | `/categories/:id/products` | JWT | — |
| POST | `/categories` | JWT | `categories.create` |
| PUT | `/categories/:id` | JWT | `categories.update` |
| DELETE | `/categories/:id` | JWT | `categories.delete` |

### Ejecutar el proyecto

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
cp .env.example .env
# Editar .env con tu configuración de MySQL

# 3. Inicializar la base de datos
mysql -u SENA -p inventario_adso < sql/database.sql
mysql -u SENA -p inventario_adso < sql/rbac.sql
mysql -u SENA -p inventario_adso < sql/data.sql

# 4. Iniciar el servidor
npm run dev
```