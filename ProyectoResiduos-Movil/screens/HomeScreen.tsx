import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { CustomButton } from '../components/CustomButton';
import { useAuth } from '../context/AuthContext';
import type { RootStackParamList } from '../navigation/types';

export const HomeScreen: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.backgroundAccent} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.container}>
          <View style={styles.headerContainer}>
            <Text style={styles.kicker}>Hola nuevamente</Text>
            <Text style={styles.nameText}>{user?.name}</Text>
            <Text style={styles.welcomeText}>Gracias por reciclar y cuidar el planeta</Text>
          </View>

          <View style={styles.statsRow}>
            <View style={[styles.statCard, styles.statCardPrimary]}>
              <Text style={styles.statLabel}>Acciones</Text>
              <Text style={styles.statValue}>12</Text>
              <Text style={styles.statHint}>Últimos 7 días</Text>
            </View>
            <View style={[styles.statCard, styles.statCardSecondary]}>
              <Text style={styles.statLabel}>Materiales</Text>
              <Text style={styles.statValue}>6</Text>
              <Text style={styles.statHint}>Registrados</Text>
            </View>
          </View>

          <View style={styles.infoContainer}>
            <Text style={styles.sectionTitle}>Tu perfil</Text>
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{user?.email}</Text>
            </View>

            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>ID de Usuario</Text>
              <Text style={styles.infoValue}>{user?.id}</Text>
            </View>
          </View>

          <View style={styles.actionCard}>
            <Text style={styles.actionTitle}>¿Listo para registrar un nuevo reciclaje?</Text>
            <Text style={styles.actionSubtitle}>Mantén el hábito y comparte tus avances con la comunidad.</Text>
            <View style={styles.actionButtons}>
              <CustomButton
                title="Módulo de aprendizaje"
                variant="secondary"
                onPress={() => navigation.navigate('LearningModule')}
              />
              <CustomButton title="Cerrar Sesión" onPress={handleLogout} />
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ecfdf5',
  },
  backgroundAccent: {
    position: 'absolute',
    top: -140,
    left: -60,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: '#bbf7d0',
    opacity: 0.5,
  },
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 28,
  },
  headerContainer: {
    marginBottom: 32,
  },
  kicker: {
    fontSize: 14,
    color: '#047857',
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 6,
    letterSpacing: 0.4,
  },
  nameText: {
    fontSize: 34,
    fontWeight: '800',
    color: '#064e3b',
    marginBottom: 6,
  },
  welcomeText: {
    fontSize: 16,
    color: '#116947',
    opacity: 0.85,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 28,
  },
  statCard: {
    flex: 1,
    borderRadius: 20,
    padding: 18,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  statCardPrimary: {
    backgroundColor: '#10b981',
  },
  statCardSecondary: {
    backgroundColor: '#34d399',
  },
  statLabel: {
    color: '#f0fdf4',
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statValue: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: '800',
    marginVertical: 6,
  },
  statHint: {
    color: '#dcfce7',
    fontSize: 13,
  },
  infoContainer: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#064e3b',
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#d9f2df',
  },
  infoLabel: {
    fontSize: 12,
    color: '#478063',
    marginBottom: 4,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 16,
    color: '#0f3b2b',
    fontWeight: '600',
  },
  actionCard: {
    backgroundColor: '#047857',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
    marginBottom: 40,
  },
  actionTitle: {
    fontSize: 20,
    color: '#ecfdf5',
    fontWeight: '700',
    marginBottom: 6,
  },
  actionSubtitle: {
    fontSize: 14,
    color: '#d1fae5',
    marginBottom: 16,
  },
  actionButtons: {
    gap: 12,
  },
});
