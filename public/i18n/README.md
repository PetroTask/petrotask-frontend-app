# Sistema de i18n Modular

Este sistema permite organizar las traducciones por feature para facilitar el mantenimiento.

## Estructura

```
public/i18n/
├── es.json                    # Archivo principal español
├── en.json                    # Archivo principal inglés
├── shared/                    # Traducciones compartidas
│   ├── es.json
│   └── en.json
└── features/                  # Traducciones por feature
    ├── iam/
    │   ├── es.json
    │   └── en.json
    ├── resources/
    │   ├── es.json
    │   └── en.json
    ├── planning/
    │   ├── es.json
    │   └── en.json
    └── ...
```

## Cómo funciona

1. **Desarrollo**: Trabajas en los archivos separados por feature
2. **Build**: Ejecutas `npm run i18n:merge` para combinar todo
3. **Runtime**: La app usa los archivos principales combinados

## Uso

### Agregar traducciones a un feature

1. Ve al directorio del feature: `public/i18n/features/[feature-name]/`
2. Edita los archivos `es.json` y `en.json`
3. Ejecuta `npm run i18n:merge` para actualizar los archivos principales

### Ejemplo para IAM

```json
// public/i18n/features/iam/es.json
{
  "login-container": {
    "slogan": "Tu operación en orden, en todo momento",
    "username": "Nombre de Usuario"
  }
}
```

### Traducciones compartidas

Las traducciones comunes van en `shared/`:

```json
// public/i18n/shared/es.json
{
  "common": {
    "save": "Guardar",
    "cancel": "Cancelar"
  }
}
```

## Comandos

- `npm run i18n:merge` - Combina todos los archivos de traducción

## Ventajas

- ✅ **Organización**: Cada feature tiene sus propias traducciones
- ✅ **Mantenimiento**: Fácil encontrar y editar traducciones específicas
- ✅ **Colaboración**: Múltiples desarrolladores pueden trabajar en diferentes features
- ✅ **Simplicidad**: No requiere cambios en el código de la app
- ✅ **Compatibilidad**: Funciona con tu `language.service.ts` existente

## Notas

- Los archivos principales (`es.json`, `en.json`) se regeneran automáticamente
- No edites directamente los archivos principales durante el desarrollo
- Siempre trabaja en los archivos de features o shared
- Ejecuta el merge antes de hacer commit 