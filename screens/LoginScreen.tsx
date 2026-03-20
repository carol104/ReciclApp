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
import { LoginFormData } from '../types';
import { loginValidationSchema } from '../utils/validation';

export const LoginScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();

  const formik = useFormik<LoginFormData>({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: loginValidationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        await signIn(values.email, values.password);
      } catch (error) {
        Alert.alert('Error', error instanceof Error ? error.message : 'Error al iniciar sesión');
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
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Reciclaje</Text>
            </View>
            <Text style={styles.title}>ReciclApp</Text>
            <Text style={styles.subtitle}>Transforma tus hábitos, comienza hoy</Text>
          </View>

          <View style={styles.formCard}>
            <Text style={styles.cardTitle}>Inicia sesión</Text>
            <Text style={styles.cardSubtitle}>Ingresa tus datos para continuar</Text>

            <View style={styles.formContainer}>
              <CustomInput
                label="Email"
                placeholder="ejemplo@email.com"
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

              <CustomButton
                title="Iniciar Sesión"
                loading={loading}
                onPress={() => formik.handleSubmit()}
                disabled={!formik.isValid || loading}
                style={styles.submitButton}
              />
            </View>

            <View style={styles.footerContainer}>
              <Text style={styles.footerText}>¿No tienes una cuenta?</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={styles.linkText}>Regístrate aquí</Text>
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
    backgroundColor: '#e8f5e9',
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
    top: -120,
    right: -80,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: '#a7f3d0',
    opacity: 0.6,
  },
  heroContainer: {
    marginVertical: 24,
    alignItems: 'flex-start',
  },
  badge: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    marginBottom: 12,
  },
  badgeText: {
    fontSize: 12,
    color: '#065f46',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 40,
    fontWeight: '800',
    color: '#065f46',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 18,
    color: '#115e3c',
    opacity: 0.85,
  },
  formCard: {
    backgroundColor: '#89ff89',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  cardTitle: {
    fontSize: 22,
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
    color: '#059669',
    fontSize: 14,
    fontWeight: '700',
  },
});
