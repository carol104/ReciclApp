# Guía de Uso - Residuos App

## Flujo de Autenticación

### Primera vez usando la aplicación

1. **Pantalla de Login** aparece por defecto
2. Debes **crear una cuenta** haciendo clic en "Regístrate aquí"
3. Completa el formulario de registro:
   - Nombre: Tu nombre completo
   - Email: Tu correo electrónico
   - Contraseña: Mínimo 6 caracteres
   - Confirmar contraseña: Debe coincidir
4. Haz clic en "Registrarse"
5. Se guardará tu cuenta en AsyncStorage (almacenamiento local del dispositivo)

### Iniciar sesión

1. En la pantalla de **Login**:
   - Email: Tu correo registrado
   - Contraseña: Tu contraseña
2. Haz clic en "Iniciar Sesión"
3. Si los datos son correctos, pasarás a la pantalla **Home**

### En la pantalla Home

- Verás un mensaje de bienvenida con tu nombre
- Se muestran tus datos: Email e ID
- Puedes cerrar sesión con el botón "Cerrar Sesión"

## Validaciones Incorporadas

### Email
- Debe ser un correo válido (ej: usuario@ejemplo.com)
- Es requerido

### Contraseña
- Mínimo 6 caracteres
- Es requerida
- Al registrarse, debe coincidir con la confirmación

### Nombre
- Mínimo 2 caracteres
- Es requerido al registrarse

## Almacenamiento de Datos

Todos los datos se guardan **localmente** en el dispositivo:
- **AsyncStorage**: Sistema de almacenamiento clave-valor de React Native
- Los datos persisten entre usos de la aplicación
- Se mantiene la sesión del usuario

## Estructura de Componentes

### AuthContext (context/AuthContext.tsx)
Proporciona:
- Estado global del usuario
- Métodos: `signIn`, `signUp`, `signOut`
- Estado de carga (`isLoading`)

### CustomInput (components/CustomInput.tsx)
Input personalizado con:
- Label
- Validación de errores
- Estilos consistentes

### CustomButton (components/CustomButton.tsx)
Botón personalizado con:
- Estados de loading
- Variantes primary/secondary
- Deshabilitar si hay errores

### RootNavigator (navigation/RootNavigator.tsx)
Maneja la navegación:
- Si `user === null` → Muestra Login/Register
- Si `user !== null` → Muestra Home

## Adaptación para Producción

Si deseas usar esta app en producción:

### 1. Integrar Backend
```typescript
// En authService.ts, reemplazar AsyncStorage con API calls
export async function login(email: string, password: string) {
  const response = await fetch('https://tu-api.com/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
  return response.json();
}
```

### 2. JWT Tokens
```typescript
// Guardar token
await AsyncStorage.setItem('authToken', token);

// Recuperar token al iniciar app
const token = await AsyncStorage.getItem('authToken');
if (token) {
  // Validar token con el servidor
}
```

### 3. Seguridad de Contraseñas
```typescript
// Usar bcrypt o algoritmo similar en el servidor
import bcrypt from 'bcrypt';
const hashedPassword = await bcrypt.hash(password, 10);
```

### 4. Recuperación de Contraseña
```typescript
// Agregar pantalla de olvido de contraseña
// con envío de correo de recuperación
```

## Personalización

### Cambiar Colores
En los estilos de los componentes, reemplazar:
```typescript
backgroundColor: '#007AFF' // Azul actual
// Por tu color deseado
backgroundColor: '#FF6B6B' // Ejemplo: rojo
```

### Agregar Términos y Condiciones
En `RegisterScreen.tsx`, agregar:
```typescript
<View style={styles.termsContainer}>
  <CheckBox
    value={agreedToTerms}
    onValueChange={setAgreedToTerms}
  />
  <Text>Acepto los términos y condiciones</Text>
</View>
```

### Agregar Logo
En `LoginScreen.tsx` y `RegisterScreen.tsx`:
```typescript
<Image
  source={require('./assets/logo.png')}
  style={styles.logo}
/>
```

## Solución de Problemas Comunes

### "Cannot find module"
```bash
rm -rf node_modules package-lock.json
npm install
npm start -- --clear
```

### Errores de TypeScript
Asegúrate de tener `tsconfig.json` correcto:
```json
{
  "compilerOptions": {
    "jsx": "react-native",
    "lib": ["es2020"],
    "target": "es2020"
  }
}
```

### AsyncStorage vacío
```typescript
// Verificar contenido de AsyncStorage en desarrollo:
import AsyncStorage from '@react-native-async-storage/async-storage';

const checkStorage = async () => {
  const keys = await AsyncStorage.getAllKeys();
  console.log('Keys:', keys);
  keys.forEach(async (key) => {
    const value = await AsyncStorage.getItem(key);
    console.log(`${key}:`, value);
  });
};
```

## Recursos Adicionales

- [React Navigation Docs](https://reactnavigation.org/)
- [Formik Docs](https://formik.org/)
- [Yup Docs](https://github.com/jquense/yup)
- [Expo Docs](https://docs.expo.dev/)
- [React Native AsyncStorage](https://react-native-async-storage.github.io/async-storage/)

---

¡Felicidades por crear tu primera app de autenticación en React Native! 🎉
