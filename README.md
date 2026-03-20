# Residuos - React Native App

Aplicación React Native con autenticación (Login y Registro) usando AsyncStorage para almacenamiento local.

## Características

- ✅ Pantalla de Login
- ✅ Pantalla de Registro
- ✅ Pantalla de Inicio (Home)
- ✅ Validación de formularios con Formik y Yup
- ✅ Almacenamiento seguro con AsyncStorage
- ✅ Navegación con React Navigation
- ✅ Componentes reutilizables (CustomInput, CustomButton)

## Estructura del Proyecto

```
ProyectoResiduos/
├── app/                 # Archivos de Expo Router (puede ignorarse)
├── components/          # Componentes reutilizables
│   ├── CustomInput.tsx
│   └── CustomButton.tsx
├── context/             # Context API para autenticación
│   └── AuthContext.tsx
├── screens/             # Pantallas de la aplicación
│   ├── LoginScreen.tsx
│   ├── RegisterScreen.tsx
│   └── HomeScreen.tsx
├── services/            # Servicios (autenticación)
│   └── authService.ts
├── navigation/          # Navegación
│   └── RootNavigator.tsx
├── types/               # Tipos TypeScript
│   └── index.ts
├── utils/               # Utilidades
│   └── validation.ts
├── App.tsx              # Componente principal
└── package.json
```

## Instalación

```bash
# Instalar dependencias
npm install

# Instalar Expo CLI globalmente (si no lo tienes)
npm install -g expo-cli
```

## Ejecutar la Aplicación

### En desarrollo

```bash
# Iniciar servidor de desarrollo
npm start

# En Android
npm run android

# En iOS (solo en macOS)
npm run ios

# En Web
npm run web
```

### Credenciales de Prueba

Como la aplicación usa almacenamiento local, puedes:
1. Crear una nueva cuenta durante el registro
2. Usar esa misma cuenta para iniciar sesión

**Datos guardados localmente:**
- Email
- Nombre
- Contraseña (en el formulario de registro)
- Sesión actual del usuario

## Validaciones

### Login
- Email: formato válido requerido
- Contraseña: mínimo 6 caracteres

### Registro
- Nombre: mínimo 2 caracteres
- Email: formato válido requerido
- Contraseña: mínimo 6 caracteres
- Confirmación de contraseña: debe coincidir

## Tecnologías Utilizadas

- **React Native**: Framework para desarrollo móvil
- **Expo**: Plataforma para construir apps de React Native
- **React Navigation**: Manejo de navegación
- **Formik**: Gestión de formularios
- **Yup**: Validación de esquemas
- **AsyncStorage**: Almacenamiento local
- **Gesture Handler**: Manejo de gestos

## Struktura de Autenticación

El flujo de autenticación utiliza:
1. **AuthContext**: Proporciona estado global de autenticación
2. **authService**: Interfaz con AsyncStorage
3. **RootNavigator**: Maneja la navegación basada en estado de autenticación

El usuario se guarda en AsyncStorage cuando inicia sesión, y se recupera al abrir la app.

## Próximos Pasos

Para mejorar la aplicación, considere:

1. **Backend real**: Conectar a un servidor backend
2. **Autenticación segura**: Usar JWT tokens
3. **Encriptación**: Hash de contraseñas con bcrypt
4. **Recuperación de contraseña**: Implementar reset
5. **Autenticación social**: Google, Facebook, etc.
6. **Pruebas automatizadas**: Jest, React Native Testing Library

## Notas de Desarrollo

- El almacenamiento es local. Para producción, integre con un backend
- Las contraseñas se guardan en texto plano en AsyncStorage (solo para demostración)
- La aplicación cambia automáticamente entre Login/Registro y Home basándose en el estado de autenticación

## Solución de Problemas

Si encuentras problemas:

1. **Limpiar caché**: `npm start -- --clear`
2. **Reinstalar dependencias**: `rm -rf node_modules && npm install`
3. **Resetear proyecto**: `npm run reset-project`

---

**Desarrollado con ❤️**
