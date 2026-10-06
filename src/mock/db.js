// Mock database: in-memory tables seeded from ./seed, persisted to localStorage.
// Shape of every API response mimics the real backend: { require: true, data, total }.
import seed from "./seed";

const STORAGE_KEY = "tracking-mock-db-v2";
const DELAY = 150;

let db = null;

const load = () => {
  if (db) return db;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      db = JSON.parse(raw);
      // add tables introduced after the snapshot was saved
      Object.keys(seed).forEach((t) => {
        if (!db[t]) db[t] = structuredClone(seed[t]);
      });
      return db;
    }
  } catch (e) {
    console.warn("mock db: cannot read localStorage", e);
  }
  db = structuredClone(seed);
  return db;
};

const save = () => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch (e) {
    console.warn("mock db: cannot write localStorage", e);
  }
};

const wait = (v) => new Promise((r) => setTimeout(() => r(v), DELAY));
const ok = (data) => ({ require: true, data, total: Array.isArray(data) ? data.length : 1 });

export const uid = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

const match = (row, where) =>
  Object.entries(where || {}).every(([k, v]) => {
    if (v === undefined || v === null || v === "") return true;
    if (typeof v === "function") return v(row[k], row);
    if (Array.isArray(v)) return v.map(String).includes(String(row[k]));
    return String(row[k]) === String(v);
  });

// ---- sync helpers (used by pages that compute summaries) ----
export const table = (name) => {
  load();
  if (!db[name]) db[name] = [];
  return db[name];
};

export const findSync = (name, where) => table(name).filter((r) => match(r, where));
export const getSync = (name, id) => table(name).find((r) => String(r.id) === String(id));

// ---- async CRUD ----
export const list = async (name, where, { sort } = {}) => {
  let rows = findSync(name, where).map((r) => ({ ...r }));
  if (sort) {
    const [field, dir = "asc"] = sort.split(":");
    rows.sort((a, b) => (a[field] > b[field] ? 1 : a[field] < b[field] ? -1 : 0) * (dir === "desc" ? -1 : 1));
  }
  return wait(ok(rows));
};

export const get = async (name, id) => {
  const row = getSync(name, id);
  return wait(row ? ok({ ...row }) : { require: false, data: null });
};

export const insert = async (name, data) => {
  const rows = table(name);
  const numeric = rows.length && rows.every((r) => typeof r.id === "number");
  const id = data.id ?? (numeric || !rows.length ? Math.max(0, ...rows.map((r) => r.id)) + 1 : uid());
  const now = new Date().toISOString();
  const row = { ...data, id, created_at: now, updated_at: now };
  rows.push(row);
  save();
  return wait(ok({ ...row }));
};

export const update = async (name, id, patch) => {
  const row = getSync(name, id);
  if (!row) return wait({ require: false, data: null });
  Object.assign(row, patch, { updated_at: new Date().toISOString() });
  save();
  return wait(ok({ ...row }));
};

export const remove = async (name, id) => {
  const rows = table(name);
  const idx = rows.findIndex((r) => String(r.id) === String(id));
  if (idx >= 0) rows.splice(idx, 1);
  save();
  return wait(ok({ id }));
};

export const removeWhere = async (name, where) => {
  load();
  db[name] = table(name).filter((r) => !match(r, where));
  save();
  return wait(ok(true));
};

export const resetDb = () => {
  localStorage.removeItem(STORAGE_KEY);
  db = null;
  load();
};

// read a File into a data URL so mock "uploads" survive reloads (small files only)
export const fileToMock = (file) =>
  new Promise((resolve) => {
    if (!file) return resolve(null);
    const meta = { name: file.name, size: file.size, type: file.type, uploaded_at: new Date().toISOString() };
    if (file.size > 400 * 1024) return resolve({ ...meta, url: null });
    const reader = new FileReader();
    reader.onload = () => resolve({ ...meta, url: reader.result });
    reader.onerror = () => resolve({ ...meta, url: null });
    reader.readAsDataURL(file);
  });

export default { list, get, insert, update, remove, removeWhere, table, findSync, getSync, resetDb, uid, fileToMock };
