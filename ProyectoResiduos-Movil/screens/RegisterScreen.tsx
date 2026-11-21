import { useFormik } from 'formik';
import React, { useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CustomButton } from '../components/CustomButton';
import { CustomInput } from '../components/CustomInput';
import { useAuth } from '../context/AuthContext';
import { RegisterFormData } from '../types';
import { registerValidationSchema } from '../utils/validation';

export const RegisterScreen: React.FC<{ navigation: any }> = ({
  navigation,
}) => {
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();

  const formik = useFormik<RegisterFormData>({
    initialValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    validationSchema: registerValidationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      formik.setStatus(undefined);
      try {
        await signUp(values.email, values.password, values.name);
      } catch (error) {
        formik.setStatus(error instanceof Error ? error.message : 'No se pudo crear la cuenta.');
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.headerContainer}>
            <Text style={styles.logo}>♻</Text><Text style={styles.brand}>PrioTask.</Text>
            <Text style={styles.title}>Crear Cuenta</Text>
            <Text style={styles.subtitle}>Tu primera acción por un futuro más verde.</Text>
          </View>

          <View style={styles.formContainer}>
            {!!formik.status && <Text accessibilityLiveRegion="polite" style={styles.error}>{formik.status}</Text>}
            <CustomInput
              label="Nombre Completo"
              placeholder="Juan Pérez"
              value={formik.values.name}
              onChangeText={formik.handleChange('name')}
              onBlur={formik.handleBlur('name')}
              error={formik.touched.name ? formik.errors.name : undefined}
            />

            <CustomInput
              label="Email"
              placeholder="tu@email.com"
              value={formik.values.email}
              onChangeText={formik.handleChange('email')}
              onBlur={formik.handleBlur('email')}
              error={formik.touched.email ? formik.errors.email : undefined}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <CustomInput
              label="Contraseña"
              placeholder="••••••••"
              value={formik.values.password}
              onChangeText={formik.handleChange('password')}
              onBlur={formik.handleBlur('password')}
              error={formik.touched.password ? formik.errors.password : undefined}
              secureTextEntry
            />

            <CustomInput
              label="Confirmar Contraseña"
              placeholder="••••••••"
              value={formik.values.confirmPassword}
              onChangeText={formik.handleChange('confirmPassword')}
              onBlur={formik.handleBlur('confirmPassword')}
              error={
                formik.touched.confirmPassword
                  ? formik.errors.confirmPassword
                  : undefined
              }
              secureTextEntry
            />

            <CustomButton
              title="Registrarse"
              loading={loading}
              onPress={() => formik.handleSubmit()}
              disabled={!formik.isValid || loading}
              style={styles.submitButton}
            />
          </View>

          <View style={styles.footerContainer}>
            <Text style={styles.footerText}>¿Ya tienes cuenta? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.linkText}>Inicia sesión</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  logo: { fontSize: 54, color: '#286343', marginBottom: 8 },
  brand: { fontSize: 34, fontWeight: '800', color: '#205C40', letterSpacing: -1, marginBottom: 24 },
  error: { color: '#9C4036', backgroundColor: '#F8EDE7', padding: 14, borderRadius: 12, marginBottom: 16 },
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F8F3',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    justifyContent: 'center',
    paddingHorizontal: 26,
    paddingVertical: 20,
  },
  headerContainer: {
    marginBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#234631',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  formContainer: {
    marginBottom: 24,
  },
  submitButton: {
    marginTop: 8,
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  footerText: {
    color: '#666',
    fontSize: 14,
  },
  linkText: {
    color: '#286343',
    fontSize: 14,
    fontWeight: '600',
  },
});
