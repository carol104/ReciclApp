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
      formik.setStatus(undefined);
      try {
        await signIn(values.email, values.password);
      } catch (error) {
        formik.setStatus(error instanceof Error ? error.message : 'No se pudo iniciar sesión.');
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
            <Text style={styles.title}>Vuelve a tu lado verde.</Text>
            <Text style={styles.subtitle}>Pequeñas acciones para un planeta mejor.</Text>
          </View>

          <View style={styles.formContainer}>
            {!!formik.status && <Text accessibilityLiveRegion="polite" style={styles.error}>{formik.status}</Text>}
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

            <CustomButton
              title="Iniciar Sesión"
              loading={loading}
              onPress={() => formik.handleSubmit()}
              disabled={!formik.isValid || loading}
              style={styles.submitButton}
            />
          </View>

          <View style={styles.footerContainer}>
            <Text style={styles.footerText}>¿No tienes cuenta? </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Register')}
            >
              <Text style={styles.linkText}>Regístrate aquí</Text>
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
