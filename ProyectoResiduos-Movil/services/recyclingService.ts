import AsyncStorage from '@react-native-async-storage/async-storage';
export const materials = ['Plástico', 'Papel y cartón', 'Vidrio', 'Metal'] as const;
export type Material = typeof materials[number];
export type Collection = { id: string; material: Material; weight: number; address: string; date: string; slot: string; status: 'Pendiente' | 'Completada' | 'Cancelada' };
export type RecyclingData = { collections: Collection[]; redemptions: { id: string; title: string; cost: number; date: string }[] };
export const emptyData = (): RecyclingData => ({ collections: [], redemptions: [] });
export const rewards = [
  { id: 'seed', title: 'Semillas para tu huerto', detail: 'Una pequeña semilla, un gran cambio.', cost: 100, symbol: '✿' },
  { id: 'bag', title: 'Bolsa reutilizable', detail: 'Lleva tus compras con menos plástico.', cost: 250, symbol: '▧' },
  { id: 'plant', title: 'Una planta para tu hogar', detail: 'Dale un rincón verde a tu espacio.', cost: 500, symbol: '♧' },
];
export function totals(data: RecyclingData) {
  const completed = data.collections.filter(item => item.status === 'Completada');
  const kg = completed.reduce((sum, item) => sum + item.weight, 0);
  const earned = completed.reduce((sum, item) => sum + Math.round(item.weight * 20), 0);
  return { kg, completed: completed.length, points: earned - data.redemptions.reduce((sum, item) => sum + item.cost, 0) };
}
export function localDate(date: Date) { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`; }
const makeId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
export function addCollection(data: RecyclingData, item: Omit<Collection, 'id' | 'status'>): RecyclingData {
  if (!materials.includes(item.material) || !Number.isFinite(item.weight) || item.weight < 0.1 || item.weight > 1000) throw new Error('Ingresa un peso entre 0,1 y 1000 kg.');
  if (item.address.trim().length < 8) throw new Error('Escribe una dirección completa (al menos 8 caracteres).');
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const date = new Date(`${item.date}T00:00:00`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(item.date) || !Number.isFinite(date.getTime()) || date < today || localDate(date) !== item.date) throw new Error('Elige una fecha válida desde hoy (AAAA-MM-DD).');
  if (!['09:00–12:00', '14:00–17:00'].includes(item.slot)) throw new Error('Selecciona un horario.');
  return { ...data, collections: [{ ...item, address: item.address.trim(), id: makeId(), status: 'Pendiente' }, ...data.collections] };
}
export function updateCollection(data: RecyclingData, id: string, status: 'Completada' | 'Cancelada'): RecyclingData {
  if (!data.collections.some(item => item.id === id && item.status === 'Pendiente')) throw new Error('Esta solicitud ya fue procesada.');
  return { ...data, collections: data.collections.map(item => item.id === id ? { ...item, status } : item) };
}
export function redeem(data: RecyclingData, id: string): RecyclingData {
  const reward = rewards.find(item => item.id === id);
  if (!reward || totals(data).points < reward.cost) throw new Error('Aún no tienes suficientes puntos.');
  return { ...data, redemptions: [{ id: makeId(), title: reward.title, cost: reward.cost, date: new Date().toISOString() }, ...data.redemptions] };
}
export const recyclingService = {
  async load(userId: string): Promise<RecyclingData> {
    const value = await AsyncStorage.getItem(`@reciclapp:${userId}`);
    return value ? JSON.parse(value) : emptyData();
  },
  async save(userId: string, data: RecyclingData) { await AsyncStorage.setItem(`@reciclapp:${userId}`, JSON.stringify(data)); },
};
