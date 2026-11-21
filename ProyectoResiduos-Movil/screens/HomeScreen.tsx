import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CustomButton } from '../components/CustomButton';
import { CustomInput } from '../components/CustomInput';
import { useAuth } from '../context/AuthContext';
import { addCollection, emptyData, localDate, Material, materials, RecyclingData, recyclingService, redeem, rewards, totals, updateCollection } from '../services/recyclingService';

type Tab = 'Inicio' | 'Recolectar' | 'Mapa' | 'Historial' | 'Premios';
const tabs: { name: Tab; icon: string }[] = [{ name: 'Inicio', icon: '⌂' }, { name: 'Recolectar', icon: '♻' }, { name: 'Mapa', icon: '◎' }, { name: 'Historial', icon: '◷' }, { name: 'Premios', icon: '✿' }];
export const HomeScreen: React.FC = () => {
  const { user, signOut } = useAuth();
  const [tab, setTab] = useState<Tab>('Inicio');
  const [data, setData] = useState<RecyclingData>(emptyData);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const scroll = useRef<ScrollView>(null);
  const [message, setMessage] = useState('');
  const [material, setMaterial] = useState<Material>('Plástico');
  const [weight, setWeight] = useState('');
  const [address, setAddress] = useState('');
  const [date, setDate] = useState(localDate(new Date(Date.now() + 86400000)));
  const [slot, setSlot] = useState('09:00–12:00');
  const [filter, setFilter] = useState('Todas');
  const [city, setCity] = useState('');
  const [mapMaterial, setMapMaterial] = useState<Material>('Plástico');
  const [confirmation, setConfirmation] = useState<{ text: string; action: () => RecyclingData } | null>(null);
  const stats = totals(data);
  const pending = data.collections.filter(item => item.status === 'Pendiente');
  useEffect(() => {
    let active = true;
    recyclingService.load(user!.id).then(value => { if (active) setData(value); }).catch(() => { if (active) setLoadError(true); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [user?.id]);
  async function retry() {
    setLoading(true);
    try { setData(await recyclingService.load(user!.id)); setLoadError(false); }
    catch { setLoadError(true); }
    finally { setLoading(false); }
  }
  function go(next: Tab) { setTab(next); setMessage(''); setConfirmation(null); scroll.current?.scrollTo({ y: 0, animated: false }); }
  async function commit(change: () => RecyclingData, success: string) {
    if (lock.current) return false;
    lock.current = true; setBusy(true); setMessage('');
    try { const next = change(); await recyclingService.save(user!.id, next); setData(next); setConfirmation(null); setMessage(success); return true; }
    catch (error) { setMessage(error instanceof Error ? error.message : 'No se pudo guardar. Inténtalo de nuevo.'); return false; }
    finally { lock.current = false; setBusy(false); }
  }
  async function request() {
    if (await commit(() => addCollection(data, { material, weight: Number(weight.replace(',', '.')), address, date, slot }), 'Solicitud de demostración guardada.')) {
      setWeight(''); setAddress(''); setTab('Historial'); setFilter('Todas'); scroll.current?.scrollTo({ y: 0 });
    } else { scroll.current?.scrollTo({ y: 0 }); }
  }
  async function openMap() {
    try { await Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`puntos de reciclaje ${mapMaterial} ${city.trim() || 'cerca de mí'}`)}`); }
    catch { setMessage('No se pudo abrir el mapa. Revisa tu conexión e inténtalo otra vez.'); }
  }
  function confirm(text: string, action: () => RecyclingData) { setConfirmation({ text, action }); scroll.current?.scrollTo({ y: 0 }); }
  const section = (title: string, subtitle?: string) => <View style={s.section}><Text style={s.heading}>{title}</Text>{subtitle && <Text style={s.muted}>{subtitle}</Text>}</View>;
  const empty = (title: string, detail: string) => <View style={s.empty}><Text style={s.emptyIcon}>♧</Text><Text style={s.cardTitle}>{title}</Text><Text style={s.centered}>{detail}</Text></View>;
  const chips = (items: readonly string[], selected: string, onSelect: (item: string) => void) => <View style={s.chips}>{items.map(item => <Pressable key={item} accessibilityRole="button" accessibilityState={{ selected: selected === item }} onPress={() => onSelect(item)} style={[s.chip, selected === item && s.selected]}><Text style={[s.chipText, selected === item && s.selectedText]}>{item}</Text></Pressable>)}</View>;
  if (loading) return <SafeAreaView style={s.loading}><ActivityIndicator color="#23734E" size="large" /><Text style={s.muted}>Preparando tu espacio verde…</Text></SafeAreaView>;
  if (loadError) return <SafeAreaView style={s.loading}><Text style={s.cardTitle}>No pudimos cargar tus datos</Text><Text style={s.centered}>Vuelve a intentarlo para acceder a tus solicitudes.</Text><CustomButton title="Reintentar" onPress={retry} /></SafeAreaView>;
  return <SafeAreaView style={s.safe} edges={['top', 'left', 'right', 'bottom']}>
    <View style={s.topbar}><View style={s.brand}><View style={s.brandIcon}><Text style={s.brandSymbol}>♻</Text></View><View><Text style={s.brandName}>PrioTask<Text style={s.brandDot}>.</Text></Text><Text style={s.eyebrow}>PEQUEÑAS ACCIONES, GRAN CAMBIO</Text></View></View><Pressable accessibilityRole="button" accessibilityLabel="Cerrar sesión" onPress={async () => { try { await signOut(); } catch { setMessage('No se pudo cerrar sesión.'); } }} style={s.avatar}><Text style={s.avatarText}>{user?.name.slice(0, 1).toUpperCase()}</Text><Text style={s.exit}>Salir</Text></Pressable></View>
    <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <ScrollView ref={scroll} style={s.flex} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
      <View style={s.demo}><View style={s.dot} /><Text style={s.demoText}>Demostración · datos guardados en este dispositivo</Text></View>
      {!!message && <View accessibilityLiveRegion="polite" style={s.notice}><Text style={s.noticeText}>{message}</Text><Pressable accessibilityRole="button" accessibilityLabel="Cerrar aviso" onPress={() => setMessage('')} style={s.close}><Text style={s.noticeText}>✕</Text></Pressable></View>}
      {confirmation && <View style={s.card}><Text style={s.cardTitle}>Confirmar acción</Text><Text style={s.muted}>{confirmation.text}</Text><CustomButton title="Confirmar simulación" loading={busy} onPress={() => commit(confirmation.action, 'Simulación guardada correctamente.')} /><CustomButton title="Volver" variant="secondary" disabled={busy} onPress={() => setConfirmation(null)} /></View>}
      {tab === 'Inicio' && <>
        <View style={s.greeting}><Text style={s.muted}>Qué bueno verte, {user?.name.split(' ')[0]} ☀</Text><Text style={s.title}>{'Un futuro más verde\nempieza contigo.'}</Text></View>
        <View style={s.hero}><View style={s.heroCircle} /><Text style={s.heroTag}>DALE OTRA VIDA</Text><Text style={s.heroTitle}>{'Lo que separas hoy,\ntransforma el mañana.'}</Text><Text style={s.heroBody}>Convierte tus reciclables en nuevas oportunidades para el planeta.</Text><Pressable accessibilityRole="button" style={s.heroButton} onPress={() => go('Recolectar')}><Text style={s.heroButtonText}>Programar recolección  ↗</Text></Pressable><Text style={s.heroLeaf}>♧</Text></View>
        {section('Tu huella positiva', 'Cada kilo cuenta. Cada acción suma.')}
        <View style={s.stats}>{[{ icon: '♻', value: `${Number(stats.kg.toFixed(1))}`, label: 'kg reciclados' }, { icon: '✦', value: stats.points, label: 'Puntos verdes' }, { icon: '✓', value: stats.completed, label: 'Entregas' }].map(item => <View key={item.label} style={s.stat}><Text style={s.statIcon}>{item.icon}</Text><Text style={s.statValue}>{item.value}</Text><Text style={s.statLabel}>{item.label}</Text></View>)}</View>
        <View style={s.goal}><View style={s.row}><Text style={s.cardTitle}>Tu próximo logro</Text><Text style={s.pill}>{Math.min(stats.kg, 10).toFixed(1)} / 10 kg</Text></View><View style={s.track}><View style={[s.progress, { width: `${Math.min(stats.kg / 10, 1) * 100}%` }]} /></View><Text style={s.muted}>{stats.kg >= 10 ? '¡Llegaste a tus primeros 10 kg! Sigue creciendo.' : 'Camino a tus primeros 10 kg reciclados. ¡Tú puedes!'}</Text></View>
        {section('Todo a un toque')}
        <View style={s.quickRow}><Pressable accessibilityRole="button" style={s.quick} onPress={() => go('Mapa')}><Text style={s.quickIcon}>◎</Text><Text style={s.cardTitle}>Puntos de reciclaje</Text><Text style={s.muted}>Encuentra dónde llevarlos ↗</Text></Pressable><Pressable accessibilityRole="button" style={[s.quick, s.quickLime]} onPress={() => go('Premios')}><Text style={s.quickIcon}>✿</Text><Text style={s.cardTitle}>Tus recompensas</Text><Text style={s.muted}>Dale valor a tu esfuerzo ↗</Text></Pressable></View>
        {pending.length > 0 && <Pressable accessibilityRole="button" style={s.card} onPress={() => go('Historial')}><Text style={s.step}>PRÓXIMA RECOLECCIÓN · DEMO</Text><Text style={s.cardTitle}>{pending[0].material} · {pending[0].weight} kg</Text><Text style={s.muted}>{pending[0].date} · {pending[0].slot} →</Text></Pressable>}
        <View style={s.tip}><Text style={s.tipLabel}>EL CONSEJO VERDE</Text><Text style={s.tipTitle}>Antes de reciclar, un pequeño paso.</Text><Text style={s.muted}>Enjuaga y seca los envases. Separa las tapas y aplana las cajas para aprovechar el espacio.</Text></View>
      </>}
      {tab === 'Recolectar' && <>
        {section('Reciclar se siente bien.', 'Prepara tus materiales y organiza tu próxima entrega.')}
        <View style={s.card}><Text style={s.step}>01 / ¿QUÉ VAS A RECICLAR?</Text>{chips(materials, material, item => setMaterial(item as Material))}<CustomInput label="Peso estimado (kg)" placeholder="Ej. 2,5" value={weight} onChangeText={setWeight} keyboardType="decimal-pad" /><Text style={s.muted}>Gana 20 puntos por kg al simular una entrega completada.</Text></View>
        <View style={s.card}><Text style={s.step}>02 / ¿DÓNDE Y CUÁNDO?</Text><CustomInput label="Dirección de recolección" placeholder="Calle, número, sector y referencia" value={address} onChangeText={setAddress} maxLength={240} /><CustomInput label="Fecha (AAAA-MM-DD)" placeholder="AAAA-MM-DD" value={date} onChangeText={setDate} maxLength={10} /><Text style={s.cardTitle}>Franja horaria</Text>{chips(['09:00–12:00', '14:00–17:00'], slot, setSlot)}</View>
        <Text style={s.muted}>Esta solicitud es una simulación local. No enviará un recolector a tu dirección.</Text><CustomButton title="Guardar solicitud de demostración  ↗" loading={busy} onPress={request} />
      </>}
      {tab === 'Mapa' && <>
        {section('Tu próximo punto verde.', 'Encuentra lugares para darle otra vida a tus materiales.')}
        <View style={s.map}><View style={s.parkOne} /><View style={s.parkTwo} /><View style={s.roadOne} /><View style={s.roadTwo} /><View style={s.roadThree} /><View style={s.mapPin}><Text style={s.pinText}>♻</Text></View><View style={s.mapBadge}><Text style={s.chipText}>Explora puntos de reciclaje</Text></View><Text style={s.mapCaption}>Ilustración · sin ubicaciones en tiempo real</Text></View>
        <View style={s.card}><Text style={s.cardTitle}>Busca cerca de ti</Text><CustomInput label="Ciudad o sector (opcional)" placeholder="Ej. Guayaquil, Urdesa" value={city} onChangeText={setCity} maxLength={100} />{chips(materials, mapMaterial, item => setMapMaterial(item as Material))}<CustomButton title="Buscar puntos en Google Maps  ↗" onPress={openMap} /><Text style={s.muted}>Se abrirá Google Maps con tu búsqueda. Verifica los horarios y los materiales aceptados antes de ir.</Text></View>
        {section('Una entrega bien preparada')}{['Separa los materiales por tipo.', 'Lleva envases limpios, secos y sin restos.', 'Consulta si el punto recibe tu material.'].map((item, i) => <View key={item} style={s.guide}><Text style={s.guideNumber}>0{i + 1}</Text><Text style={s.guideText}>{item}</Text></View>)}
      </>}
      {tab === 'Historial' && <>
        {section('Cada acción deja huella.', 'Tus solicitudes y entregas, en un solo lugar.')}{chips(['Todas', 'Pendiente', 'Completada', 'Cancelada'], filter, setFilter)}
        {data.collections.filter(item => filter === 'Todas' || item.status === filter).length === 0 && <>{empty('Tu historia verde empieza aquí', 'Las solicitudes que guardes aparecerán en este espacio.')}<CustomButton title="Programar una recolección" onPress={() => go('Recolectar')} /></>}
        {data.collections.filter(item => filter === 'Todas' || item.status === filter).map(item => <View key={item.id} style={s.card}><View style={s.row}><Text style={s.cardTitle}>{item.material}</Text><Text style={[s.pill, item.status === 'Cancelada' && s.cancelled]}>{item.status}</Text></View><Text style={s.statValue}>{item.weight} kg</Text><Text style={s.muted}>{item.date} · {item.slot}</Text><Text style={s.body}>{item.address}</Text>{item.status === 'Completada' && <Text style={s.points}>+{Math.round(item.weight * 20)} puntos · entrega simulada</Text>}{item.status === 'Pendiente' && <><CustomButton title="Simular entrega completada" disabled={busy} onPress={() => confirm(`Se registrarán ${item.weight} kg y ${Math.round(item.weight * 20)} puntos de demostración.`, () => updateCollection(data, item.id, 'Completada'))} /><CustomButton title="Cancelar solicitud" variant="secondary" disabled={busy} onPress={() => confirm('Esta solicitud quedará cancelada y no sumará puntos.', () => updateCollection(data, item.id, 'Cancelada'))} /></>}</View>)}
      </>}
      {tab === 'Premios' && <>
        {section('Tu esfuerzo florece.', 'Recicla, suma y descubre tus próximos logros.')}
        <View style={s.balance}><Text style={s.heroTag}>TUS PUNTOS VERDES</Text><Text style={s.balanceNumber}>{stats.points} <Text style={s.balanceStar}>✦</Text></Text><Text style={s.heroBody}>20 puntos por cada kilo entregado en la demo.</Text></View>
        <Text style={s.muted}>Catálogo de demostración. Los canjes descuentan puntos locales; no entregan productos ni cupones reales.</Text>
        {rewards.map(reward => <View key={reward.id} style={s.card}><View style={s.row}><View style={s.rewardArt}><Text style={s.rewardSymbol}>{reward.symbol}</Text></View><Text style={s.pill}>{reward.cost} pts</Text></View><Text style={s.cardTitle}>{reward.title}</Text><Text style={s.muted}>{reward.detail}</Text><CustomButton title={stats.points >= reward.cost ? 'Simular canje' : `Te faltan ${reward.cost - stats.points} puntos`} disabled={busy || stats.points < reward.cost} onPress={() => confirm(`¿Canjear ${reward.cost} puntos por «${reward.title}» en la demostración?`, () => redeem(data, reward.id))} /></View>)}
        {section('Tus canjes')}{data.redemptions.length === 0 ? empty('Algo bueno está creciendo', 'Tus canjes aparecerán aquí cuando alcances tu primera recompensa.') : data.redemptions.map(item => <View key={item.id} style={s.card}><Text style={s.cardTitle}>{item.title}</Text><Text style={s.muted}>{new Date(item.date).toLocaleDateString('es-EC')} · −{item.cost} puntos</Text><Text style={s.points}>Canje de demostración registrado</Text></View>)}
      </>}
      <Text style={s.footer}>Hecho de pequeñas acciones. Pensado para un gran cambio. ♧</Text>
    </ScrollView></KeyboardAvoidingView>
    <View style={s.nav}>{tabs.map(item => <Pressable key={item.name} accessibilityRole="tab" accessibilityState={{ selected: tab === item.name }} accessibilityLabel={item.name} onPress={() => go(item.name)} style={[s.navItem, tab === item.name && s.navActive]}><Text style={[s.navIcon, tab === item.name && s.navSelected]}>{item.icon}</Text><Text style={[s.navLabel, tab === item.name && s.navSelected]}>{item.name}</Text></Pressable>)}</View>
  </SafeAreaView>;
};

const s = StyleSheet.create({
  flex: { flex: 1 }, safe: { flex: 1, backgroundColor: '#F5F8F3' }, loading: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 20, padding: 24, backgroundColor: '#F5F8F3' },
  topbar: { paddingHorizontal: 22, paddingVertical: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#E4EBE0' }, brand: { flexDirection: 'row', alignItems: 'center', gap: 10 }, brandIcon: { backgroundColor: '#216044', width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center' }, brandSymbol: { color: '#DCEDAC', fontSize: 28 }, brandName: { fontSize: 26, fontWeight: '800', letterSpacing: -1, color: '#163F2D' }, brandDot: { color: '#8FAD47' }, eyebrow: { fontSize: 8, letterSpacing: 1, color: '#65816D', fontWeight: '700' }, avatar: { minWidth: 44, minHeight: 48, alignItems: 'center', justifyContent: 'center' }, avatarText: { fontSize: 16, color: '#24573C', fontWeight: '700', backgroundColor: '#E1ECD9', borderRadius: 14, paddingHorizontal: 12, paddingVertical: 6 }, exit: { fontSize: 10, color: '#52725C', marginTop: 3 },
  content: { padding: 22, gap: 18, maxWidth: 680, width: '100%', alignSelf: 'center' }, demo: { flexDirection: 'row', alignItems: 'center', gap: 7 }, dot: { width: 6, height: 6, backgroundColor: '#6C9150', borderRadius: 4 }, demoText: { fontSize: 10, color: '#667D66', flex: 1 }, greeting: { gap: 7, marginTop: 5 }, title: { fontSize: 31, lineHeight: 38, letterSpacing: -1, fontWeight: '700', color: '#193F2D' }, muted: { fontSize: 13, lineHeight: 20, color: '#657469' }, body: { color: '#314C39', fontSize: 14, lineHeight: 21 },
  hero: { backgroundColor: '#205C40', padding: 25, borderRadius: 26, overflow: 'hidden', gap: 13 }, heroCircle: { width: 210, height: 210, borderRadius: 105, backgroundColor: '#2D6B49', position: 'absolute', right: -90, top: -60 }, heroTag: { fontSize: 10, fontWeight: '700', letterSpacing: 2, color: '#C9E49A' }, heroTitle: { color: '#FFFDF0', fontSize: 27, lineHeight: 34, fontWeight: '600', letterSpacing: -0.6, maxWidth: 360 }, heroBody: { color: '#D2E3D2', fontSize: 13, lineHeight: 21, maxWidth: 300 }, heroButton: { backgroundColor: '#D8ECA4', borderRadius: 13, padding: 15, marginTop: 8, alignSelf: 'flex-start', zIndex: 1 }, heroButtonText: { color: '#20492D', fontWeight: '700', fontSize: 13 }, heroLeaf: { fontSize: 140, color: '#94B671', position: 'absolute', right: -10, bottom: -40, opacity: 0.25 },
  section: { gap: 5, marginTop: 8 }, heading: { fontSize: 23, letterSpacing: -0.7, fontWeight: '700', color: '#203F2E' }, stats: { flexDirection: 'row', gap: 10 }, stat: { flex: 1, padding: 13, borderRadius: 18, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E6EBE2', gap: 7 }, statIcon: { color: '#57884F', fontSize: 22 }, statValue: { fontSize: 27, color: '#20482F', fontWeight: '700' }, statLabel: { fontSize: 11, color: '#657469' }, goal: { padding: 18, borderRadius: 18, borderWidth: 1, borderColor: '#DFE7D8', gap: 12 }, row: { flexDirection: 'row', justifyContent: 'space-between', gap: 10, alignItems: 'center', flexWrap: 'wrap' }, cardTitle: { fontSize: 16, color: '#284833', fontWeight: '700' }, pill: { backgroundColor: '#EBF2DE', color: '#4B6A39', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, fontSize: 11, fontWeight: '600' }, cancelled: { backgroundColor: '#F0E8DF', color: '#816548' }, track: { height: 7, backgroundColor: '#E1E9D9', borderRadius: 5, overflow: 'hidden' }, progress: { height: 7, backgroundColor: '#739B44', borderRadius: 5 }, quickRow: { flexDirection: 'row', gap: 12, flexWrap: 'wrap' }, quick: { flex: 1, minWidth: 140, borderRadius: 20, padding: 18, backgroundColor: '#E4EEDF', gap: 9 }, quickLime: { backgroundColor: '#EDF0D8' }, quickIcon: { color: '#4D7040', fontSize: 28 }, tip: { borderRadius: 20, padding: 21, backgroundColor: '#EEEFE3', gap: 9 }, tipLabel: { color: '#6F7D46', fontSize: 9, letterSpacing: 2, fontWeight: '700' }, tipTitle: { color: '#3E5135', fontSize: 19, lineHeight: 25, fontWeight: '600' },
  card: { backgroundColor: '#FFFFFF', borderRadius: 21, padding: 20, gap: 14, borderWidth: 1, borderColor: '#E5EBE0' }, step: { fontSize: 11, letterSpacing: 1.4, fontWeight: '700', color: '#6A8556' }, chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 }, chip: { paddingHorizontal: 14, paddingVertical: 13, borderRadius: 14, backgroundColor: '#EAF0E5', minHeight: 44 }, chipText: { color: '#526B45', fontSize: 12, fontWeight: '600' }, selected: { backgroundColor: '#286343' }, selectedText: { color: '#FFFFFF' }, notice: { padding: 15, backgroundColor: '#DEECCC', borderRadius: 14, flexDirection: 'row', alignItems: 'center', gap: 12 }, noticeText: { flexShrink: 1, color: '#315631', fontSize: 13, lineHeight: 20 }, close: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' }, empty: { paddingVertical: 30, alignItems: 'center', gap: 12 }, emptyIcon: { color: '#79985B', fontSize: 48 }, centered: { textAlign: 'center', color: '#687B66', fontSize: 14, lineHeight: 21, maxWidth: 300 }, points: { color: '#4D7A3D', fontSize: 12, fontWeight: '600' },
  map: { height: 250, backgroundColor: '#E5E9DC', borderRadius: 24, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' }, parkOne: { position: 'absolute', left: -10, top: 30, width: 150, height: 105, backgroundColor: '#CEDDB9', borderRadius: 40, transform: [{ rotate: '-20deg' }] }, parkTwo: { position: 'absolute', right: -10, bottom: 20, width: 170, height: 95, backgroundColor: '#CEDDB9', borderRadius: 40 }, roadOne: { position: 'absolute', width: '150%', height: 16, backgroundColor: '#FAFAF1', transform: [{ rotate: '-30deg' }] }, roadTwo: { position: 'absolute', width: '140%', height: 20, backgroundColor: '#FAFAF1', transform: [{ rotate: '50deg' }] }, roadThree: { position: 'absolute', width: '130%', height: 10, top: 45, backgroundColor: '#FAFAF1', transform: [{ rotate: '10deg' }] }, mapPin: { backgroundColor: '#286343', width: 58, height: 58, borderRadius: 29, borderBottomRightRadius: 5, alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '45deg' }] }, pinText: { color: '#E2EEBE', fontSize: 32, transform: [{ rotate: '-45deg' }] }, mapBadge: { position: 'absolute', top: 15, left: 15, backgroundColor: '#FFFFFF', padding: 10, borderRadius: 10 }, mapCaption: { position: 'absolute', bottom: 13, fontSize: 10, backgroundColor: '#F5F8F3', color: '#66745F', padding: 6, borderRadius: 7 }, guide: { flexDirection: 'row', alignItems: 'center', gap: 15, paddingVertical: 8 }, guideNumber: { color: '#79964F', fontSize: 22, fontWeight: '600' }, guideText: { flex: 1, fontSize: 14, color: '#4D634A', lineHeight: 21 },
  balance: { backgroundColor: '#205C40', borderRadius: 24, padding: 26, gap: 8 }, balanceNumber: { color: '#F8FFE7', fontSize: 56, fontWeight: '700', letterSpacing: -2 }, balanceStar: { color: '#CCE68C', fontSize: 36 }, rewardArt: { backgroundColor: '#EDF2DE', paddingHorizontal: 22, paddingVertical: 8, borderRadius: 18 }, rewardSymbol: { fontSize: 46, color: '#608146' }, footer: { fontSize: 10, color: '#8B9982', textAlign: 'center', paddingVertical: 15, lineHeight: 17 }, nav: { flexDirection: 'row', backgroundColor: '#FFFFFF', paddingTop: 10, paddingBottom: 8, paddingHorizontal: 8, borderTopWidth: 1, borderColor: '#E3EADB' }, navItem: { flex: 1, alignItems: 'center', paddingVertical: 7, gap: 3, borderRadius: 14, minHeight: 53 }, navActive: { backgroundColor: '#EAF1DF' }, navIcon: { fontSize: 24, color: '#87967C' }, navLabel: { fontSize: 10, color: '#7B8A72' }, navSelected: { color: '#2B6644', fontWeight: '700' },
});
