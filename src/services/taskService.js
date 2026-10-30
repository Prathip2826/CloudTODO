import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  updateDoc,
  writeBatch,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase';

/*
 * Task shape:
 * { id, title, completed, priority: 'low'|'medium'|'high', dueDate: 'YYYY-MM-DD'|'', createdAt }
 * Firestore path: users/{uid}/tasks/{taskId}
 */

const tsToMillis = (v) => (v?.toMillis ? v.toMillis() : typeof v === 'number' ? v : Date.now());
const tasksRef = (uid) => collection(db, 'users', uid, 'tasks');

/* ------------------------------------------------------------------ */
/* Firebase implementation – real-time sync via onSnapshot             */
/* ------------------------------------------------------------------ */
const firebaseTasks = {
  subscribe(uid, onData, onError) {
    return onSnapshot(
      tasksRef(uid),
      (snap) => {
        const list = snap.docs.map((d) => {
          const data = d.data({ serverTimestamps: 'estimate' });
          return { id: d.id, ...data, createdAt: tsToMillis(data.createdAt) };
        });
        onData(list);
      },
      onError
    );
  },
  add(uid, { title, priority, dueDate }) {
    return addDoc(tasksRef(uid), {
      title,
      priority,
      dueDate,
      completed: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  },
  update(uid, id, changes) {
    return updateDoc(doc(db, 'users', uid, 'tasks', id), {
      ...changes,
      updatedAt: serverTimestamp(),
    });
  },
  remove(uid, id) {
    return deleteDoc(doc(db, 'users', uid, 'tasks', id));
  },
  async clearCompleted(uid) {
    const snap = await getDocs(query(tasksRef(uid), where('completed', '==', true)));
    const batch = writeBatch(db);
    snap.forEach((d) => batch.delete(d.ref));
    await batch.commit();
  },
};

/* ------------------------------------------------------------------ */
/* Demo-mode implementation (localStorage + storage event for tabs)    */
/* ------------------------------------------------------------------ */
const key = (uid) => `taskflow_demo_tasks_${uid}`;
const read = (uid) => JSON.parse(localStorage.getItem(key(uid)) || '[]');
const subs = new Set();
const write = (uid, list) => {
  localStorage.setItem(key(uid), JSON.stringify(list));
  subs.forEach((fn) => fn());
};

const demoTasks = {
  subscribe(uid, onData) {
    const push = () => onData(read(uid));
    subs.add(push);
    const onStorage = (e) => e.key === key(uid) && push(); // syncs other tabs
    window.addEventListener('storage', onStorage);
    push();
    return () => {
      subs.delete(push);
      window.removeEventListener('storage', onStorage);
    };
  },
  async add(uid, { title, priority, dueDate }) {
    write(uid, [
      ...read(uid),
      { id: crypto.randomUUID(), title, priority, dueDate, completed: false, createdAt: Date.now() },
    ]);
  },
  async update(uid, id, changes) {
    write(uid, read(uid).map((t) => (t.id === id ? { ...t, ...changes } : t)));
  },
  async remove(uid, id) {
    write(uid, read(uid).filter((t) => t.id !== id));
  },
  async clearCompleted(uid) {
    write(uid, read(uid).filter((t) => !t.completed));
  },
};

export const taskService = isFirebaseConfigured ? firebaseTasks : demoTasks;
