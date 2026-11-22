const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const memory = new Map();
const storage = { getItem: async key => memory.get(key) ?? null, setItem: async (key, value) => { memory.set(key, value); } };
const source = ts.transpileModule(fs.readFileSync(require('node:path').join(__dirname, '../services/recyclingService.ts'), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true } }).outputText;
const sandbox = { exports: {}, require: name => { assert.equal(name, '@react-native-async-storage/async-storage'); return storage; } };
vm.runInNewContext(source, sandbox);
const r = sandbox.exports;
const input = () => ({ material: 'Plástico', weight: 5, address: 'Calle de prueba 123', date: r.localDate(new Date(Date.now() + 86400000)), slot: '09:00–12:00' });
test('points are awarded once on completion, never on pending or cancelled requests', () => {
  let data = r.addCollection(r.emptyData(), input());
  assert.equal(r.totals(data).points, 0);
  const id = data.collections[0].id;
  data = r.updateCollection(data, id, 'Completada');
  assert.equal(r.totals(data).points, 100);
  assert.equal(r.totals(data).kg, 5);
  assert.throws(() => r.updateCollection(data, id, 'Completada'));
  data = r.addCollection(data, input());
  data = r.updateCollection(data, data.collections[0].id, 'Cancelada');
  assert.equal(r.totals(data).points, 100);
});
test('redemption debits points and prevents overspending', () => {
  let data = r.addCollection(r.emptyData(), input());
  data = r.updateCollection(data, data.collections[0].id, 'Completada');
  data = r.redeem(data, 'seed');
  assert.equal(r.totals(data).points, 0);
  assert.equal(data.redemptions.length, 1);
  assert.throws(() => r.redeem(data, 'seed'));
});
test('invalid weight, address, dates and slots are rejected', () => {
  for (const weight of [0, -1, NaN, Infinity, 1001]) assert.throws(() => r.addCollection(r.emptyData(), { ...input(), weight }));
  for (const date of ['2020-01-01', 'invalid', '2099-02-30']) assert.throws(() => r.addCollection(r.emptyData(), { ...input(), date }));
  assert.throws(() => r.addCollection(r.emptyData(), { ...input(), address: ' ' }));
  assert.throws(() => r.addCollection(r.emptyData(), { ...input(), slot: 'invalid' }));
});
test('saved data survives reload and remains isolated by user', async () => {
  const data = r.addCollection(r.emptyData(), input());
  await r.recyclingService.save('test-a', data);
  assert.equal((await r.recyclingService.load('test-a')).collections[0].address, input().address);
  assert.equal((await r.recyclingService.load('test-b')).collections.length, 0);
  memory.set('@reciclapp:broken', '{');
  await assert.rejects(r.recyclingService.load('broken'));
});
