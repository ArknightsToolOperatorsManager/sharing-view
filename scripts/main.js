// main.js - メイン機能
document.addEventListener('DOMContentLoaded', () => {
    // 各種DOM要素の取得
    const importForm = document.getElementById('import-form');
    const operatorsTable = document.getElementById('operators-table');
    const operatorsBody = document.getElementById('operators-body');
    const copyUrlButton = document.getElementById('copy-url-button');
    const copyTweetButton = document.getElementById('copy-tweet-button');
    
    // キャラクター静的データ
    let characterData = {};
    
    // 現在のデータID
    let currentDataId = null;
    
    // URLからデータIDを取得
    const urlParams = new URLSearchParams(window.location.search);
    const dataId = urlParams.get('d');
    
    // 静的データの読み込み
    loadCharacterData()
        .then(data => {
            characterData = data;
            
            // URLにデータIDがある場合、Firestoreからデータを取得して表示
            if (dataId) {
                currentDataId = dataId;
                return fetchOperatorData(dataId);
            }
        })
        .then(operatorData => {
            if (operatorData) {
                displayOperators(operatorData);
            }
        })
        .catch(error => {
            console.error('初期化エラー:', error);
        });
    
    // インポートフォームのイベントリスナー
    importForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        
        const importDataElement = document.getElementById('import-data');
        const jsonData = importDataElement.value;
        
        try {
            // JSONデータをパース
            const rawData = JSON.parse(jsonData);
            
            // データの検証
            if (!rawData) {
                throw new Error('無効なデータ形式です。');
            }
            
            // 入力データを処理して必要な形式に変換
            const data = Array.isArray(rawData) ? processInputData(rawData) : processInputData([rawData]);
            
            if (data.length === 0) {
                throw new Error('有効なオペレータデータが見つかりませんでした。');
            }
            
            // データの表示
            displayOperators(data);
            
            // Firestoreにデータを保存
            const result = await saveOperatorData(data);
            currentDataId = result.id;
            
            // URLを更新（履歴に残さず）
            const newUrl = `${window.location.origin}${window.location.pathname}?d=${result.id}`;
            window.history.replaceState({}, '', newUrl);
            
            // 成功メッセージ
            alert('データを表示しました。URLが更新されました。');
            
        } catch (error) {
            alert(`エラーが発生しました: ${error.message}`);
            console.error('データ処理エラー:', error);
        }
    });
    
    // URLコピーボタンのイベントリスナー
    copyUrlButton.addEventListener('click', () => {
        if (!currentDataId) {
            alert('先にデータを表示してください。');
            return;
        }
        
        const url = `${window.location.origin}${window.location.pathname}?d=${currentDataId}`;
        copyToClipboard(url);
        
        // ボタンのテキストを一時的に変更
        const originalText = copyUrlButton.textContent;
        copyUrlButton.textContent = 'コピーしました！';
        setTimeout(() => {
            copyUrlButton.textContent = originalText;
        }, 2000);
    });
    
    // Xツイート用テキストコピーボタンのイベントリスナー
    copyTweetButton.addEventListener('click', () => {
        if (!currentDataId) {
            alert('先にデータを表示してください。');
            return;
        }
        
        // オペレーター数を取得
        const operatorCount = document.querySelectorAll('#operators-body tr').length;
        
        // ツイート用テキストを生成
        const url = `${window.location.origin}${window.location.pathname}?d=${currentDataId}`;
        const tweetText = `私のオペレーターの育成状況を共有します！ ${url} #Arknights #アークナイツ #ANManager`;
        
        copyToClipboard(tweetText);
        
        // ボタンのテキストを一時的に変更
        const originalText = copyTweetButton.textContent;
        copyTweetButton.textContent = 'コピーしました！';
        setTimeout(() => {
            copyTweetButton.textContent = originalText;
        }, 2000);
    });
    
    // クリップボードにコピーする関数
    function copyToClipboard(text) {
        // navigator.clipboard APIが利用可能な場合はそちらを使用
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(text).catch(err => {
                console.error('クリップボードへのコピーに失敗しました:', err);
                fallbackCopyToClipboard(text);
            });
        } else {
            fallbackCopyToClipboard(text);
        }
    }
    
    // フォールバックコピー方法
    function fallbackCopyToClipboard(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        
        // オフスクリーンに配置
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        
        textArea.focus();
        textArea.select();
        
        try {
            const successful = document.execCommand('copy');
            if (!successful) {
                console.error('クリップボードへのコピーに失敗しました');
            }
        } catch (err) {
            console.error('クリップボードへのコピーに失敗しました:', err);
        }
        
        document.body.removeChild(textArea);
    }
    
    // キャラクター静的データを読み込む関数
    async function loadCharacterData() {
        try {
            const response = await fetch('data/characters.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('キャラクターデータの読み込みに失敗しました:', error);
            return {};
        }
    }
    
    // 入力データを処理する関数
    function processInputData(data) {
        // 配列でない場合は配列に変換
        if (!Array.isArray(data)) {
            data = [data];
        }
        
        // 必要なデータを抽出
        return data.map(item => {
            // コードの取得（大文字小文字を区別しない）
            const code = item.Code || item.code;
            if (!code) return null; // コードがない場合はスキップ
            
            // 潜在の取得と数値変換
            let potential = item.Potential || item.potential;
            potential = parseInt(potential) || 1;
            
            // 現在のレベル情報を取得
            const currentLevel = item.CurrentLevel || {};
            
            // 必要なデータを抽出して返す
            return {
                code: code,
                potential: potential,
                elite: parseInt(currentLevel.Elite) || 0,
                level: parseInt(currentLevel.Level) || 1,
                skill: parseInt(currentLevel.Skill) || 7,
                skill1: parseInt(currentLevel.Skill1) || 0,
                skill2: parseInt(currentLevel.Skill2) || 0,
                skill3: parseInt(currentLevel.Skill3) || 0,
                moduleX: parseInt(currentLevel.ModuleX) || 0,
                moduleY: parseInt(currentLevel.ModuleY) || 0,
                moduleD: parseInt(currentLevel.ModuleD) || 0,
                moduleA: parseInt(currentLevel.ModuleA) || 0
            };
        }).filter(item => item !== null); // nullの項目を除外
    }
    
    // オペレーターデータをテーブルに表示する関数
    function displayOperators(operators) {
        // テーブルの内容をクリア
        operatorsBody.innerHTML = '';
        
        // 各オペレーターの行を生成
        operators.forEach(operator => {
            const tr = document.createElement('tr');
            
            // キャラクター基本情報を取得
            const charInfo = characterData[operator.code] || { name: 'Unknown' };
            
            // コード
            const tdCode = document.createElement('td');
            tdCode.textContent = operator.code;
            tr.appendChild(tdCode);
            
            // オペレータ名
            const tdName = document.createElement('td');
            tdName.textContent = charInfo.name || operator.code;
            tr.appendChild(tdName);
            
            // 潜在
            const tdPotential = document.createElement('td');
            tdPotential.textContent = operator.potential || 1;
            tr.appendChild(tdPotential);
            
            // 昇進
            const tdElite = document.createElement('td');
            tdElite.textContent = operator.elite || 0;
            tr.appendChild(tdElite);
            
            // レベル
            const tdLevel = document.createElement('td');
            tdLevel.textContent = operator.level || 1;
            tr.appendChild(tdLevel);
            
            // スキル
            const tdSkill = document.createElement('td');
            tdSkill.textContent = operator.skill || 7;
            tr.appendChild(tdSkill);
            
            // スキル1特化
            const tdSkill1 = document.createElement('td');
            tdSkill1.textContent = operator.skill1 || 0;
            tr.appendChild(tdSkill1);
            
            // スキル2特化
            const tdSkill2 = document.createElement('td');
            tdSkill2.textContent = operator.skill2 || 0;
            tr.appendChild(tdSkill2);
            
            // スキル3特化
            const tdSkill3 = document.createElement('td');
            tdSkill3.textContent = operator.skill3 || 0;
            tr.appendChild(tdSkill3);
            
            // モジュールX
            const tdModuleX = document.createElement('td');
            tdModuleX.textContent = operator.moduleX || 0;
            tr.appendChild(tdModuleX);
            
            // モジュールY
            const tdModuleY = document.createElement('td');
            tdModuleY.textContent = operator.moduleY || 0;
            tr.appendChild(tdModuleY);
            
            // モジュールD
            const tdModuleD = document.createElement('td');
            tdModuleD.textContent = operator.moduleD || 0;
            tr.appendChild(tdModuleD);
            
            // モジュールA
            const tdModuleA = document.createElement('td');
            tdModuleA.textContent = operator.moduleA || 0;
            tr.appendChild(tdModuleA);
            
            // 行をテーブルに追加
            operatorsBody.appendChild(tr);
        });
    }
});