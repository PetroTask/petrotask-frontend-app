# PetroTask Frontend - API Falsa

## Resumen de Cambios

He convertido exitosamente el proyecto PetroTask de un frontend que dependía de un backend real a un frontend completamente independiente que usa una API falsa basada en JSON.

## ¿Qué se ha implementado?

### 1. API Falsa Completa
- **Servicio FakeApiService**: Creado en `src/app/core/services/fake-api.service.ts`
- **Datos JSON**: Utiliza el archivo `server/db.json` existente como base de datos
- **Simulación de red**: Incluye delays realistas para simular llamadas HTTP
- **Autenticación falsa**: Sistema completo de login/registro con tokens falsos

### 2. Usuarios por Defecto
La aplicación incluye usuarios predefinidos para testing:

| Usuario | Contraseña | Rol |
|---------|------------|-----|
| admin | admin123 | Administrador (ROLE_ADMIN) |
| supervisor | super123 | Supervisor Logístico (ROLE_LOGISTIC_SUPERVISOR) |
| operario | oper123 | Operador Logístico (ROLE_LOGISTIC_OPERATOR) |

### 3. Configuración Flexible
- **Desarrollo**: Usa API falsa (`environment.development.ts` - `useFakeApi: true`)
- **Producción**: Puede usar API real (`environment.ts` - `useFakeApi: false`)

### 4. Servicios Actualizados
Los siguientes servicios ahora soportan tanto API falsa como real:
- `AuthenticationService` - Login y registro
- `UserService` - Gestión de usuarios
- `EquipmentService` - Gestión de equipos
- `EmployeeService` - Gestión de empleados

## Cómo usar la aplicación

### 1. Iniciar la aplicación
```bash
npm start
```
La aplicación estará disponible en `http://localhost:4200`

### 2. Probar el registro
1. Ve a `http://localhost:4200/register`
2. Completa el formulario de registro (4 pasos)
3. El sistema creará automáticamente una nueva empresa y usuario
4. Serás redirigido al login

### 3. Probar el login
1. Ve a `http://localhost:4200/login`
2. Usa cualquiera de los usuarios por defecto o tu cuenta recién creada
3. Serás redirigido al dashboard principal

### 4. Navegar por la aplicación
Una vez logueado, puedes acceder a:
- Dashboard: `/petrotask/dashboard`
- Gestión de equipos: `/petrotask/equipments-management`
- Gestión de empleados: `/petrotask/employee-management`
- Gestión de actividades: `/petrotask/activity-management`
- Y muchas más funcionalidades...

## Estructura de Datos

La API falsa utiliza los datos existentes en `server/db.json`:
- **Posiciones**: Roles de trabajo (Admin, Operario, Supervisor)
- **Actividades**: Tareas y proyectos
- **Empleados**: Personal de la empresa
- **Equipos**: Vehículos y maquinaria
- **Ubicaciones**: Zonas y lugares de trabajo
- **Tareas**: Trabajos específicos
- **Zonas**: Áreas geográficas
- **Equipos**: Grupos de trabajo
- **Miembros de equipo**: Asignaciones de personal

## Ventajas de esta implementación

1. **Independencia total**: No necesita backend para funcionar
2. **Desarrollo rápido**: Cambios inmediatos sin esperar API
3. **Testing fácil**: Datos consistentes y predecibles
4. **Flexibilidad**: Fácil cambio entre API falsa y real
5. **Datos realistas**: Usa datos reales del proyecto original

## Próximos pasos

Si quieres conectar con un backend real en el futuro:
1. Cambia `useFakeApi: false` en `environment.development.ts`
2. Asegúrate de que el backend esté ejecutándose
3. La aplicación automáticamente usará la API real

## Solución de problemas

### Si el registro no funciona:
- Verifica que el archivo `public/db.json` existe
- Revisa la consola del navegador para errores
- Asegúrate de completar todos los campos requeridos

### Si no puedes acceder a la aplicación:
- Verifica que el servidor esté ejecutándose en puerto 4200
- Limpia el localStorage del navegador
- Reinicia la aplicación con `npm start`

¡La aplicación PetroTask está lista para usar como frontend independiente!
