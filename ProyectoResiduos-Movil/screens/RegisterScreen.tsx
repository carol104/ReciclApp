import { useFormik } from 'formik';
import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
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
      try {
        await signUp(values.email, values.password, values.name);
      } catch (error) {
        Alert.alert('Error', error instanceof Error ? error.message : 'Error al registrarse');
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
            <Text style={styles.title}>Crear Cuenta</Text>
            <Text style={styles.subtitle}>Regístrate para continuar</Text>
          </View>

          <View style={styles.formContainer}>
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
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  headerContainer: {
    marginBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
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
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
