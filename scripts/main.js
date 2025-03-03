// 全オペレーターを表示する関数
function displayAllOperators() {
    // テーブルの内容をクリア
    allOperatorsBody.innerHTML = '';
    
    // キャラクターコードでソート
    const sortedOperators = Object.keys(characterData).sort();
    
    // 各オペレーターの行を生成
    sortedOperators.forEach(code => {
        const operator = characterData[code];
        const tr = document.createElement('tr');
        
        // インポートデータに存在する場合、クラスを追加
        const importedData = findOperatorData(code);
        if (importedData) {
            tr.classList.add('has-data');
        }
        
        // コード
        const tdCode = document.createElement('td');
        tdCode.textContent = code;
        tr.appendChild(tdCode);
        
        // オペレータ名
        const tdName = document.createElement('td');
        tdName.textContent = operator.name;
        tdName.classList.add(`rarity-${operator.rarity}`);
        tr.appendChild(tdName);
        
        // レアリティ
        const tdRarity = document.createElement('td');
        tdRarity.textContent = '★'.repeat(operator.rarity);
        tdRarity.classList.add(`rarity-${operator.rarity}`);
        tr.appendChild(tdRarity);
        
        // クラス
        const tdClass = document.createElement('td');
        tdClass.textContent = getClassNameJapanese(operator.class);
        tr.appendChild(tdClass);
        
        // 以下、インポートデータがある場合はその値を表示、なければ空欄または初期値
        
        // 潜在
        const tdPotential = document.createElement('td');
        tdPotential.textContent = importedData ? importedData.potential : '';
        tr.appendChild(tdPotential);
        
        // 昇進
        const tdElite = document.createElement('td');
        tdElite.textContent = importedData ? importedData.elite : '';
        tr.appendChild(tdElite);
        
        // レベル
        const tdLevel = document.createElement('td');
        tdLevel.textContent = importedData ? importedData.level : '';
        tr.appendChild(tdLevel);
        
        // スキル
        const tdSkill = document.createElement('td');
        tdSkill.textContent = importedData ? importedData.skill : '';
        tr.appendChild(tdSkill);
        
        // スキル1特化
        const tdSkill1 = document.createElement('td');
        tdSkill1.textContent = importedData ? importedData.skill1 : '';
        tr.appendChild(tdSkill1);
        
        // スキル2特化
        const tdSkill2 = document.createElement('td');
        tdSkill2.textContent = importedData ? importedData.skill2 : '';
        tr.appendChild(tdSkill2);
        
        // スキル3特化
        const tdSkill3 = document.createElement('td');
        tdSkill3.textContent = importedData ? importedData.skill3 : '';
        tr.appendChild(tdSkill3);
        
        // モジュールX
        const tdModuleX = document.createElement('td');
        tdModuleX.textContent = importedData ? importedData.moduleX : '';
        tr.appendChild(tdModuleX);
        
        // モジュールY
        const tdModuleY = document.createElement('td');
        tdModuleY.textContent = importedData ? importedData.moduleY : '';
        tr.appendChild(tdModuleY);
        
        // モジュールD
        const tdModuleD = document.createElement('td');
        tdModuleD.textContent = importedData ? importedData.moduleD : '';
        tr.appendChild(tdModuleD);
        
        // モジュールA
        const tdModuleA = document.createElement('td');
        tdModuleA.textContent = importedData ? importedData.moduleA : '';
        tr.appendChild(tdModuleA);
        
        // 行をテーブルに追加
        allOperatorsBody.appendChild(tr);
    });
}

// コードを元にインポートデータを検索する関数
function findOperatorData(code) {
    return importedOperators.find(op => op.code === code);
}

// クラス名を日本語に変換する関数
function getClassNameJapanese(className) {
    const classMap = {
        'guard': '前衛',
        'vanguard': '先鋒',
        'defender': '重装',
        'sniper': '狙撃',
        'caster': '術師',
        'medic': '医療',
        'supporter': '補助',
        'specialist': '特殊'
    };
    
    return classMap[className] || className;
}// main.js - メイン機能
document.addEventListener('DOMContentLoaded', () => {
// 各種DOM要素の取得
const copyUrlButton = document.getElementById('copy-url-button');
const tweetButton = document.getElementById('tweet-button');

// タブボタンの取得
const tabImported = document.getElementById('tab-imported');
const tabAll = document.getElementById('tab-all');
const importedDataContainer = document.getElementById('imported-data');
const allOperatorsContainer = document.getElementById('all-operators');

// 各テーブルのbody要素
const operatorsBody = document.getElementById('operators-body');
const allOperatorsBody = document.getElementById('all-operators-body');

// インポートされたオペレーターデータ
let importedOperators = [];

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
        
        // 全オペレーターリストの表示
        displayAllOperators();
        
        // URLにデータIDがある場合、Firestoreからデータを取得して表示
        if (dataId) {
            currentDataId = dataId;
            return fetchOperatorData(dataId);
        }
    })
    .then(operatorData => {
        if (operatorData) {
            importedOperators = operatorData;
            displayOperators(operatorData);
        }
    })
    .catch(error => {
        console.error('初期化エラー:', error);
    });
    
// タブ切り替えのイベントリスナー
tabImported.addEventListener('click', () => {
    tabImported.classList.add('active');
    tabAll.classList.remove('active');
    importedDataContainer.classList.remove('hidden');
    allOperatorsContainer.classList.add('hidden');
});

tabAll.addEventListener('click', () => {
    tabAll.classList.add('active');
    tabImported.classList.remove('active');
    allOperatorsContainer.classList.remove('hidden');
    importedDataContainer.classList.add('hidden');
});

// URLコピーボタンのイベントリスナー
copyUrlButton.addEventListener('click', () => {
    if (!currentDataId) {
        alert('表示するデータがありません。');
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

// Xツイートボタンのイベントリスナー
tweetButton.addEventListener('click', () => {
    if (!currentDataId) {
        alert('表示するデータがありません。');
        return;
    }
    
    // オペレーター数を取得
    const operatorCount = document.querySelectorAll('#operators-body tr').length;
    
    // ツイート用テキストとURLを生成
    const shareUrl = `${window.location.origin}${window.location.pathname}?d=${currentDataId}`;
    const tweetText = `私のオペレーターの育成状況を共有します！ ${url} #Arknights #アークナイツ #ANManager`;
    
    // Xの投稿画面を開く（ポップアップ）
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(twitterUrl, '_blank', 'width=550,height=420');
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
        const response = await fetch('data/operators.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('オペレータデータの読み込みに失敗しました:', error);
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