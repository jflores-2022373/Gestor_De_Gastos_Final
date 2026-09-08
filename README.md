SpendWise: Sistema Integral de Gestión Financiera Personal

SpendWise es una solución tecnológica completa y avanzada orientada al registro, estructuración, análisis y control absoluto de las finanzas personales. Diseñado bajo una arquitectura modular y moderna de alto rendimiento, este sistema permite a los usuarios gestionar sus recursos económicos con precisión quirúrgica, asegurando la confidencialidad de los datos mediante protocolos avanzados de autenticación y cifrado.
1. Arquitectura y Estructura del Sistema

El proyecto opera bajo un modelo de desarrollo estructurado en un entorno monorepositorio que separa rigurosamente la capa de presentación de la interfaz de usuario y la capa de servicios del servidor, garantizando escalabilidad, independencia de despliegue y un mantenimiento modular limpio:
Plaintext

Gestor_De_Gastos_Dashboard/
│
├── backend/           # Capa de servicios, API REST, modelos y lógica de negocio
└── frontend/          # Capa de cliente, vistas interactivas y componentes de Angular

2. Tecnologías y Herramientas Utilizadas

El ecosistema tecnológico del proyecto se compone de herramientas modernas de desarrollo de software:

    Frontend: Angular estructurado mediante Standalone Components, TypeScript, HTML5 y CSS avanzado con diseño responsivo.

    Backend: Node.js y Express para la creación y gestión eficiente de la API RESTful.

    Base de Datos y Persistencia: Prisma ORM para la administración de modelos relacionales y no relacionales de manera segura.

    Gestor de Paquetes: pnpm para la optimización en la instalación de dependencias, resolución estricta de versiones y ejecución rápida de scripts de desarrollo.

3. Requisitos Previos del Entorno

Para asegurar un despliegue y funcionamiento óptimo en cualquier máquina local, es indispensable contar previamente con las siguientes herramientas instaladas y configuradas en el sistema operativo:

    Node.js: Entorno de ejecución de JavaScript en su versión LTS actual.

    pnpm: Gestor de paquetes de alto rendimiento instalado de forma global en el sistema.

    Git: Sistema de control de versiones para la clonación y seguimiento del repositorio.

4. Guía Exhaustiva de Instalación y Ejecución Paso a Paso

Siga detalladamente los comandos a continuación para clonar, configurar y poner en marcha todo el proyecto desde cero en su entorno local.
Paso 1: Clonación del Repositorio Oficial

Abra su terminal de comandos habitual y ejecute la clonación del repositorio en su directorio de trabajo local:
Bash

git clone https://github.com/tu-usuario/Gestor_De_Gastos_Dashboard.git
cd Gestor_De_Gastos_Dashboard

Paso 2: Configuración y Despliegue del Servidor (Backend)

El servidor se encarga de procesar las peticiones HTTP, manejar la lógica de autenticación y conectar con el motor de base de datos a través de Prisma.

    Acceda al directorio del servidor:
    Bash

    cd backend

    Instale todas las dependencias del proyecto utilizando el gestor optimizado:
    Bash

    pnpm install

    Configure las variables de entorno creando o rellenando el archivo .env en la raíz de la carpeta backend con las credenciales de conexión a su base de datos.

    Genere los esquemas, migraciones y el cliente tipado del ORM Prisma:
    Bash

    pnpm prisma generate

    Ejecute las migraciones necesarias para sincronizar la base de datos:
    Bash

    pnpm prisma migrate dev

    Inicie el servidor backend en modo de desarrollo activo:
    Bash

    pnpm start

Paso 3: Configuración y Despliegue de la Interfaz (Frontend)

La aplicación cliente proporciona los paneles visuales, formularios de autenticación y dashboards interactivos para el usuario final.

    Abra una nueva ventana o pestaña independiente en su terminal y diríjase a la carpeta del cliente desde la raíz del proyecto:
    Bash

    cd frontend

    Instale las dependencias requeridas para la interfaz gráfica:
    Bash

    pnpm install

    Inicie el servidor de desarrollo de la aplicación cliente en Angular:
    Bash

    pnpm start

Una vez completado satisfactoriamente este proceso, abra su navegador web de preferencia e ingrese a la siguiente dirección local para interactuar con la plataforma:
http://localhost:4200/
5. Módulos, Componentes Principales y Mejoras Implementadas

    Módulo de Autenticación y Seguridad Avanzada: Contiene las vistas de inicio de sesión (/login) y registro de cuentas (/register), diseñadas con un estilo visual profesional de dos columnas en modo oscuro, tarjetas estructuradas y elementos interactivos fluidos. Valida credenciales de forma cifrada e integra de manera nativa los servicios de Google Identity Services para autenticación externa.

    Dashboard Financiero Central: Panel analítico principal que agrupa métricas esenciales de ingresos totales, egresos totales y balances históricos expresados rigurosamente en la moneda local (Quetzales - Q) mediante representaciones visuales claras y actualizadas en tiempo real.

    Módulo de Gestión de Transacciones Dinámicas: Vistas estructuradas enfocadas en permitir al usuario el alta, modificación y eliminación de registros financieros individuales separados de manera estricta entre los botones de Vista Ingresos y Vista Egresos. Incluye formularios dedicados para la descripción, montos numéricos precisos y asignación de categorías específicas, alimentando de forma automática los historiales correspondientes.

    Integración de Configuración Global y Estructura Core: Se han incorporado librerías externas de autenticación directamente en el archivo base de la aplicación (src/index.html) y se ha optimizado la gestión de servicios HTTP mediante interceptores y validadores robustos en TypeScript.
