// データ保護システム - PWA自動更新時のデータ安全性確保

import { loadAllPokemonSettings } from './pokemon-storage';

interface BackupData {
  timestamp: number;
  version: string;
  data: string;
}

// IndexedDB操作クラス
class DataProtection {
  private dbName = 'PokemonSleepDB';
  private storeName = 'backups';
  private version = 1;

  // IndexedDBを開く
  private async openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'id', autoIncrement: true });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  // バックアップ保存
  async saveBackup(data: string): Promise<void> {
    try {
      const db = await this.openDB();
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);

      const backup: BackupData = {
        timestamp: Date.now(),
        version: '1.1.1', // アプリバージョン
        data: data
      };

      return new Promise((resolve, reject) => {
        const request = store.add(backup);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.warn('IndexedDB backup failed:', error);
    }
  }

  // 最新バックアップ取得
  async getLatestBackup(): Promise<string | null> {
    try {
      const db = await this.openDB();
      const transaction = db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const index = store.index('timestamp');

      return new Promise((resolve, reject) => {
        const request = index.openCursor(null, 'prev'); // 最新から取得
        request.onsuccess = () => {
          const cursor = request.result;
          if (cursor) {
            resolve(cursor.value.data);
          } else {
            resolve(null);
          }
        };
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.warn('IndexedDB restore failed:', error);
      return null;
    }
  }

  // 古いバックアップを削除（最新5件のみ保持）
  async cleanupOldBackups(): Promise<void> {
    try {
      const db = await this.openDB();
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const index = store.index('timestamp');

      const request = index.openCursor(null, 'prev');
      let count = 0;

      request.onsuccess = () => {
        const cursor = request.result;
        if (cursor) {
          count++;
          if (count > 5) {
            cursor.delete(); // 5件を超える古いデータを削除
          }
          cursor.continue();
        }
      };
    } catch (error) {
      console.warn('Backup cleanup failed:', error);
    }
  }
}

// データ保護マネージャー
export class DataProtectionManager {
  private protection = new DataProtection();
  private storageKey = 'pokemon-sleep-settings';

  // 多層バックアップ作成
  async createBackup(): Promise<boolean> {
    try {
      const canonicalDataObject = loadAllPokemonSettings();
      const hasCanonicalData = Object.keys(canonicalDataObject).length > 0;

      if (!hasCanonicalData) {
        const existing = localStorage.getItem(this.storageKey);
        if (!existing || existing === '{}' || existing === 'null') {
          return false;
        }
      }

      const canonicalData = hasCanonicalData
        ? JSON.stringify(canonicalDataObject)
        : (localStorage.getItem(this.storageKey) as string);

      if (!canonicalData || canonicalData === '{}' || canonicalData === 'null') {
        return false; // バックアップするデータがない
      }

      console.log('🛡️ Creating multi-layer backup...');

      if (hasCanonicalData) {
        localStorage.setItem(this.storageKey, canonicalData);
      }

      // Layer 1: LocalStorage複製
      localStorage.setItem('pokemon-backup-1', canonicalData);
      localStorage.setItem('pokemon-backup-2', canonicalData);

      // Layer 2: SessionStorage
      sessionStorage.setItem('pokemon-session-backup', canonicalData);

      // Layer 3: IndexedDB（最も永続的）
      await this.protection.saveBackup(canonicalData);
      await this.protection.cleanupOldBackups();

      console.log('✅ Multi-layer backup completed');
      return true;
    } catch (error) {
      console.error('❌ Backup creation failed:', error);
      return false;
    }
  }

  // データ完全性チェック & 自動復旧
  async ensureDataIntegrity(): Promise<boolean> {
    try {
      const mainData = localStorage.getItem(this.storageKey);
      
      // メインデータが正常な場合は何もしない
      if (mainData && mainData !== '{}' && this.isValidData(mainData)) {
        return true;
      }

      console.warn('⚠️ Data loss detected, attempting recovery...');

      // 復旧優先順位
      const backupSources = [
        () => localStorage.getItem('pokemon-backup-1'),
        () => localStorage.getItem('pokemon-backup-2'),
        () => sessionStorage.getItem('pokemon-session-backup'),
        () => this.protection.getLatestBackup()
      ];

      for (const getBackup of backupSources) {
        try {
          const backup = await getBackup();
          if (backup && backup !== '{}' && this.isValidData(backup)) {
            localStorage.setItem(this.storageKey, backup);
            this.showRecoveryNotification(`データを自動復旧しました`);
            console.log('✅ Data recovery successful');
            return true;
          }
        } catch (error) {
          continue; // 次のバックアップソースを試行
        }
      }

      console.error('❌ All recovery attempts failed');
      return false;
    } catch (error) {
      console.error('❌ Data integrity check failed:', error);
      return false;
    }
  }

  // データの妥当性検証
  private isValidData(data: string): boolean {
    try {
      const parsed = JSON.parse(data);
      return typeof parsed === 'object' && parsed !== null;
    } catch {
      return false;
    }
  }

  // 復旧通知表示
  private showRecoveryNotification(message: string) {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #f59e0b;
      color: white;
      padding: 12px 16px;
      border-radius: 8px;
      font-size: 14px;
      z-index: 10000;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      max-width: 300px;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 5000);
  }
}

// グローバルインスタンス
export const dataProtection = new DataProtectionManager();
