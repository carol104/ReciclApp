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
      <View style={styles.backgroundAccent} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.heroContainer}>
            <Text style={styles.kicker}>Únete al movimiento verde</Text>
            <Text style={styles.title}>Crear Cuenta</Text>
            <Text style={styles.subtitle}>Comparte y registra tus acciones de reciclaje</Text>
          </View>

          <View style={styles.formCard}>
            <Text style={styles.cardTitle}>Tus datos</Text>
            <Text style={styles.cardSubtitle}>Completa la información para comenzar</Text>

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
              <Text style={styles.footerText}>¿Ya tienes cuenta?</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.linkText}>Inicia sesión</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#eefcf3',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  backgroundAccent: {
    position: 'absolute',
    bottom: -80,
    left: -60,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: '#bbf7d0',
    opacity: 0.5,
  },
  heroContainer: {
    marginBottom: 24,
  },
  kicker: {
    fontSize: 13,
    letterSpacing: 0.5,
    color: '#15803d',
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: '#065f46',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 16,
    color: '#115e3c',
    opacity: 0.8,
  },
  formCard: {
    backgroundColor: '#ffffff',
    borderRadius: 28,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#064e3b',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#2f6c4e',
    marginBottom: 20,
  },
  formContainer: {
    marginBottom: 12,
  },
  submitButton: {
    marginTop: 12,
  },
  footerContainer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e3f2e1',
    marginTop: 16,
    paddingTop: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
  },
  footerText: {
    color: '#1e3a34',
    fontSize: 14,
  },
  linkText: {
    color: '#047857',
    fontSize: 14,
    fontWeight: '700',
  },
});
