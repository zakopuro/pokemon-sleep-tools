// データ移行ユーティリティ

export interface MigrationResult {
  success: boolean;
  dataFound: boolean;
  migratedRecords: number;
  error?: string;
}

// 旧ドメインからのデータ移行を試行
export const attemptDataMigration = (): Promise<MigrationResult> => {
  return new Promise((resolve) => {
    try {
      // 現在のドメインにデータが既に存在する場合はスキップ
      const existingData = localStorage.getItem('pokemon-sleep-settings');
      if (existingData && existingData !== '{}') {
        resolve({
          success: true,
          dataFound: false,
          migratedRecords: 0,
          error: 'Data already exists in current domain'
        });
        return;
      }

      // リファラーチェック（開発環境では localhost:4173 を想定）
      const referrer = document.referrer;
      const isFromOldDomain = referrer.includes('localhost:4173') || 
                            referrer.includes('zakopuro.github.io/pokemon-sleep-tools');
      
      // 開発環境でのテスト用（リファラーチェックを緩和）
      const isDevelopment = window.location.hostname === 'localhost';

      if (!isFromOldDomain && !isDevelopment) {
        resolve({
          success: true,
          dataFound: false,
          migratedRecords: 0,
          error: 'Not coming from old domain'
        });
        return;
      }

      // iframe経由でデータ取得を試行
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.style.width = '0';
      iframe.style.height = '0';
      
      // 開発環境とプロダクション環境で分岐
      const oldDomainUrl = referrer.includes('localhost:4173') 
        ? 'http://localhost:4173/data-bridge.html'
        : 'https://zakopuro.github.io/pokemon-sleep-tools/data-bridge.html';
      
      iframe.src = oldDomainUrl;

      // タイムアウト設定
      const timeout = setTimeout(() => {
        document.body.removeChild(iframe);
        resolve({
          success: false,
          dataFound: false,
          migratedRecords: 0,
          error: 'Migration timeout'
        });
      }, 5000);

      // PostMessage受信
      const messageHandler = (event: MessageEvent) => {
        // 開発環境とプロダクション環境のオリジンチェック
        const validOrigins = [
          'http://localhost:4173',
          'https://zakopuro.github.io'
        ];
        
        if (!validOrigins.includes(event.origin)) {
          return;
        }

        clearTimeout(timeout);
        window.removeEventListener('message', messageHandler);
        
        try {
          const data = event.data;
          if (data && data.pokemonSettings) {
            // データを新ドメインに保存
            localStorage.setItem('pokemon-sleep-settings', data.pokemonSettings);
            
            // 移行されたレコード数をカウント
            const parsedData = JSON.parse(data.pokemonSettings);
            const recordCount = Object.keys(parsedData).length;
            
            document.body.removeChild(iframe);
            resolve({
              success: true,
              dataFound: true,
              migratedRecords: recordCount,
            });
          } else {
            document.body.removeChild(iframe);
            resolve({
              success: true,
              dataFound: false,
              migratedRecords: 0,
              error: 'No data found in old domain'
            });
          }
        } catch (error) {
          document.body.removeChild(iframe);
          resolve({
            success: false,
            dataFound: false,
            migratedRecords: 0,
            error: `Failed to process migrated data: ${error}`
          });
        }
      };

      window.addEventListener('message', messageHandler);
      document.body.appendChild(iframe);

    } catch (error) {
      resolve({
        success: false,
        dataFound: false,
        migratedRecords: 0,
        error: `Migration error: ${error}`
      });
    }
  });
};

// 開発環境用：手動データ移行テスト
export const testDataMigration = () => {
  console.log('🧪 Test migration starting...');
  
  // 現在のデータを確認
  const existingData = localStorage.getItem('pokemon-sleep-settings');
  console.log('Current data:', existingData);
  
  // localhost:4173のデータをシミュレート
  const testData = `{"0010025-ピカチュウ":{"1":{"level":45,"selectedIngredients":[1,2],"subskillByLevel":{},"upParam":"なし","downParam":"なし","selectedNeutralNature":null,"managementStatus":"厳選中(A)","mainSkillLevel":1}},"0010004-ヒトカゲ":{"1":{"level":30,"selectedIngredients":[3,4],"subskillByLevel":{},"upParam":"なし","downParam":"なし","selectedNeutralNature":null,"managementStatus":"完了","mainSkillLevel":2}}}`;
  
  try {
    console.log('Setting test data...');
    localStorage.setItem('pokemon-sleep-settings', testData);
    
    // 保存確認
    const savedData = localStorage.getItem('pokemon-sleep-settings');
    console.log('Saved data:', savedData);
    
    const result = JSON.parse(testData);
    const recordCount = Object.keys(result).length;
    console.log(`Record count: ${recordCount}`);
    
    showMigrationResult({
      success: true,
      dataFound: true,
      migratedRecords: recordCount
    });
    
    console.log('✅ Test migration completed, reloading page...');
    // ページリロード
    setTimeout(() => window.location.reload(), 1000);
  } catch (error) {
    console.error('❌ Test migration failed:', error);
  }
};

// デバッグ用：グローバルに公開（開発環境のみ）
if (window.location.hostname === 'localhost') {
  (window as any).testDataMigration = testDataMigration;
}

// 移行結果をユーザーに表示
export const showMigrationResult = (result: MigrationResult) => {
  if (result.success && result.dataFound && result.migratedRecords > 0) {
    console.log(`✅ データ移行成功: ${result.migratedRecords}件のポケモンデータを移行しました`);
    
    // 成功通知（控えめに表示）
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #10b981;
      color: white;
      padding: 12px 16px;
      border-radius: 8px;
      font-size: 14px;
      z-index: 10000;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    notification.textContent = `データ移行完了: ${result.migratedRecords}件`;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 5000);
    
  } else if (result.error && !result.error.includes('already exists') && !result.error.includes('Not coming from')) {
    console.warn('⚠️ データ移行エラー:', result.error);
  }
};