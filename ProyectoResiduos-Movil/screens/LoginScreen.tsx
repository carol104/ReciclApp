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
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.headerContainer}>
            <Text style={styles.title}>Bienvenido</Text>
            <Text style={styles.subtitle}>Inicia sesión en tu cuenta</Text>
          </View>

          <View style={styles.formContainer}>
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
