import {indexedDB} from 'fake-indexeddb';
import assert from 'node:assert/strict';
import test from 'node:test';

// packages/lib/src/infra/IndexedDbStorage.js の onupgradeneeded と同じ判定。
// 既存ストアは削除せず、存在しない場合のみ作成する。
function upgrade(db, tx, stores) {
  for (const meta of stores) {
    let store;
    if (db.objectStoreNames.contains(meta.name)) {
      store = tx.objectStore(meta.name);
    } else {
      store = db.createObjectStore(meta.name, meta.definition);
    }
    for (const idx of (meta.indexes || [])) {
      if (!store.indexNames.contains(idx.name)) {
        store.createIndex(idx.name, idx.keyPath, idx.params);
      }
    }
  }
}

const stores = [
  {
    name: 'cache',
    definition: {keyPath: 'id'},
    indexes: [{name: 'updatedAt', keyPath: 'updatedAt'}]
  }
];

test('upgrade preserves existing records and does not duplicate indexes', async () => {
  const req = indexedDB.open('zenza-indexeddb-upgrade-test', 1);
  req.onupgradeneeded = e => upgrade(e.target.result, e.target.transaction, stores);
  const db = await new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });

  const tx = db.transaction('cache', 'readwrite');
  tx.objectStore('cache').put({id: 1, updatedAt: 100, value: 'keep-me'});
  await new Promise((resolve, reject) => {
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error);
  });
  db.close();

  const req2 = indexedDB.open('zenza-indexeddb-upgrade-test', 2);
  req2.onupgradeneeded = e => upgrade(e.target.result, e.target.transaction, stores);
  const db2 = await new Promise((resolve, reject) => {
    req2.onsuccess = () => resolve(req2.result);
    req2.onerror = () => reject(req2.error);
  });

  const value = await new Promise((resolve, reject) => {
    const r = db2.transaction('cache').objectStore('cache').get(1);
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => reject(r.error);
  });
  assert.deepEqual(value, {id: 1, updatedAt: 100, value: 'keep-me'});

  const indexNames = [...db2.transaction('cache').objectStore('cache').indexNames];
  assert.deepEqual(indexNames, ['updatedAt']);
  db2.close();
});
