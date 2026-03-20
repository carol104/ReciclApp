import React from 'react';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

type LessonStatus = 'completed' | 'in_progress' | 'locked';

type Lesson = {
	id: string;
	order: number;
	title: string;
	description: string;
	durationMinutes: number;
	status: LessonStatus;
};

const LESSONS: Lesson[] = [
	{
		id: 'why-separate',
		order: 1,
		title: '¿Por qué separar residuos?',
		description: 'Entiende el impacto ambiental y cómo ayuda tu comunidad.',
		durationMinutes: 6,
		status: 'in_progress',
	},
	{
		id: 'materials',
		order: 2,
		title: 'Identifica los materiales',
		description: 'Diferencia papel, cartón, vidrio, metales y plásticos comunes.',
		durationMinutes: 10,
		status: 'locked',
	},
	{
		id: 'cleaning',
		order: 3,
		title: 'Limpieza y preparación',
		description: 'Qué enjuagar, qué secar y cómo evitar contaminación.',
		durationMinutes: 8,
		status: 'locked',
	},
	{
		id: 'colors',
		order: 4,
		title: 'Contenedores y colores',
		description: 'Guía rápida para ubicar cada residuo en el lugar correcto.',
		durationMinutes: 7,
		status: 'locked',
	},
	{
		id: 'mistakes',
		order: 5,
		title: 'Errores comunes',
		description: 'Aprende qué NO hacer para mejorar tu tasa de reciclaje.',
		durationMinutes: 5,
		status: 'locked',
	},
];

const statusLabel: Record<LessonStatus, string> = {
	completed: 'Completada',
	in_progress: 'En curso',
	locked: 'Pendiente',
};

export const LearningModuleScreen: React.FC = () => {
	const completedCount = LESSONS.filter((lesson) => lesson.status === 'completed').length;
	const totalCount = LESSONS.length;
	const progress = totalCount === 0 ? 0 : completedCount / totalCount;
	const totalMinutes = LESSONS.reduce((acc, lesson) => acc + lesson.durationMinutes, 0);

	return (
		<SafeAreaView style={styles.safeArea}>
			<View style={styles.backgroundAccent} />
			<ScrollView contentContainerStyle={styles.scrollContent}>
				<View style={styles.container}>
					<View style={styles.headerContainer}>
						<Text style={styles.kicker}>Módulo</Text>
						<Text style={styles.title}>Aprendizaje</Text>
						<Text style={styles.subtitle}>
							Recomendaciones y pasos simples para separar y reciclar mejor.
						</Text>
					</View>

					<View style={styles.statsRow}>
						<View style={[styles.statCard, styles.statCardPrimary]}>
							<Text style={styles.statLabel}>Progreso</Text>
							<Text style={styles.statValue}>
								{completedCount}/{totalCount}
							</Text>
							<Text style={styles.statHint}>Lecciones completadas</Text>
						</View>

						<View style={[styles.statCard, styles.statCardSecondary]}>
							<Text style={styles.statLabel}>Duración</Text>
							<Text style={styles.statValue}>{totalMinutes}m</Text>
							<Text style={styles.statHint}>Aprox. total</Text>
						</View>
					</View>

					<View style={styles.progressCard}>
						<View style={styles.progressHeader}>
							<Text style={styles.sectionTitle}>Ruta de aprendizaje</Text>
							<Text style={styles.progressText}>{Math.round(progress * 100)}%</Text>
						</View>
						<View style={styles.progressTrack}>
							<View style={[styles.progressFill, { width: `${Math.round(progress * 100)}%` }]} />
						</View>
						<Text style={styles.progressHint}>
							Completa las lecciones en orden para desbloquear la siguiente.
						</Text>
					</View>

					<View style={styles.lessonListHeader}>
						<Text style={styles.sectionTitle}>Lecciones</Text>
						<Text style={styles.sectionMeta}>{totalCount} en total</Text>
					</View>

					<View style={styles.lessonList}>
						{LESSONS.map((lesson) => (
							<TouchableOpacity
								key={lesson.id}
								activeOpacity={0.85}
								style={[
									styles.lessonCard,
									lesson.status === 'in_progress' && styles.lessonCardActive,
								]}
								disabled={lesson.status === 'locked'}
							>
								<View style={styles.lessonTopRow}>
									<Text style={styles.lessonOrder}>Lección {lesson.order}</Text>
									<View
										style={[
											styles.statusPill,
											lesson.status === 'completed' && styles.statusPillCompleted,
											lesson.status === 'in_progress' && styles.statusPillInProgress,
											lesson.status === 'locked' && styles.statusPillLocked,
										]}
									>
										<Text
											style={[
												styles.statusPillText,
												lesson.status === 'locked' && styles.statusPillTextLocked,
											]}
										>
											{statusLabel[lesson.status]}
										</Text>
									</View>
								</View>

								<Text style={styles.lessonTitle}>{lesson.title}</Text>
								<Text style={styles.lessonDescription}>{lesson.description}</Text>

								<View style={styles.lessonBottomRow}>
									<Text style={styles.lessonMeta}>{lesson.durationMinutes} min</Text>
									<Text style={styles.lessonMetaDot}>•</Text>
									<Text style={styles.lessonMeta}>
										{lesson.status === 'locked' ? 'Bloqueada' : 'Disponible'}
									</Text>
								</View>
							</TouchableOpacity>
						))}
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
		marginBottom: 22,
	},
	kicker: {
		fontSize: 14,
		color: '#047857',
		fontWeight: '700',
		textTransform: 'uppercase',
		letterSpacing: 0.4,
		marginBottom: 6,
	},
	title: {
		fontSize: 34,
		fontWeight: '800',
		color: '#064e3b',
		marginBottom: 6,
	},
	subtitle: {
		fontSize: 16,
		color: '#116947',
		opacity: 0.85,
	},
	statsRow: {
		flexDirection: 'row',
		gap: 16,
		marginBottom: 18,
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
		fontSize: 30,
		fontWeight: '800',
		marginVertical: 6,
	},
	statHint: {
		color: '#dcfce7',
		fontSize: 13,
	},
	progressCard: {
		backgroundColor: '#ffffff',
		borderRadius: 20,
		padding: 18,
		borderWidth: 1,
		borderColor: '#d9f2df',
		marginBottom: 22,
	},
	progressHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 10,
	},
	progressText: {
		fontSize: 14,
		fontWeight: '800',
		color: '#047857',
	},
	progressTrack: {
		height: 10,
		borderRadius: 999,
		backgroundColor: '#dcfce7',
		overflow: 'hidden',
		marginBottom: 10,
	},
	progressFill: {
		height: '100%',
		backgroundColor: '#10b981',
		borderRadius: 999,
	},
	progressHint: {
		fontSize: 13,
		color: '#478063',
	},
	sectionTitle: {
		fontSize: 18,
		fontWeight: '800',
		color: '#064e3b',
	},
	lessonListHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'baseline',
		marginBottom: 12,
	},
	sectionMeta: {
		fontSize: 13,
		color: '#478063',
		fontWeight: '600',
	},
	lessonList: {
		gap: 12,
		paddingBottom: 40,
	},
	lessonCard: {
		backgroundColor: '#ffffff',
		borderRadius: 18,
		padding: 18,
		borderWidth: 1,
		borderColor: '#d9f2df',
	},
	lessonCardActive: {
		borderColor: '#10b981',
	},
	lessonTopRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 10,
	},
	lessonOrder: {
		fontSize: 12,
		fontWeight: '800',
		color: '#478063',
		textTransform: 'uppercase',
		letterSpacing: 0.4,
	},
	statusPill: {
		paddingHorizontal: 10,
		paddingVertical: 6,
		borderRadius: 999,
	},
	statusPillCompleted: {
		backgroundColor: '#bbf7d0',
	},
	statusPillInProgress: {
		backgroundColor: '#a7f3d0',
	},
	statusPillLocked: {
		backgroundColor: '#ecfdf5',
		borderWidth: 1,
		borderColor: '#d9f2df',
	},
	statusPillText: {
		fontSize: 12,
		fontWeight: '800',
		color: '#065f46',
	},
	statusPillTextLocked: {
		color: '#478063',
	},
	lessonTitle: {
		fontSize: 16,
		fontWeight: '800',
		color: '#0f3b2b',
		marginBottom: 6,
	},
	lessonDescription: {
		fontSize: 14,
		color: '#116947',
		opacity: 0.9,
		marginBottom: 12,
	},
	lessonBottomRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
	},
	lessonMeta: {
		fontSize: 13,
		color: '#478063',
		fontWeight: '600',
	},
	lessonMetaDot: {
		fontSize: 14,
		color: '#9bb8aa',
		fontWeight: '800',
	},
});
