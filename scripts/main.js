// main.js - メイン機能
document.addEventListener('DOMContentLoaded', () => {
    // 各種DOM要素の取得
    const importButton = document.getElementById('import-button');
    const importDialog = document.getElementById('import-dialog');
    const cancelImport = document.getElementById('cancel-import');
    const importForm = document.getElementById('import-form');
    const operatorsTable = document.getElementById('operators-table');
    const operatorsBody = document.getElementById('operators-body');
    const shareContainer = document.getElementById('share-container');
    const shareUrl = document.getElementById('share-url');
    const copyButton = document.getElementById('copy-button');
    
    // キャラクター静的データ
    let characterData = {};
    
    // URLからデータIDを取得
    const urlParams = new URLSearchParams(window.location.search);
    const dataId = urlParams.get('d');
    
    // 静的データの読み込み
    loadCharacterData()
        .then(data => {
            characterData = data;
            
            // URLにデータIDがある場合、Firestoreからデータを取得して表示
            if (dataId) {
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
    
    // インポートボタンのイベントリスナー
    importButton.addEventListener('click', () => {
        importDialog.classList.remove('hidden');
    });
    
    // キャンセルボタンのイベントリスナー
    cancelImport.addEventListener('click', () => {
        importDialog.classList.add('hidden');
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
            const data = Array.isArray(rawData) ? processInputData(rawData) : [processInputData([rawData])];
            
            if (data.length === 0) {
                throw new Error('有効なオペレータデータが見つかりませんでした。');
            }
            
            // データの表示
            displayOperators(data);
            
            // Firestoreにデータを保存
            const result = await saveOperatorData(data);
            
            // 共有URLを表示
            shareUrl.value = `${window.location.origin}${window.location.pathname}?d=${result.id}`;
            shareContainer.classList.remove('hidden');
            
            // ダイアログを閉じる
            importDialog.classList.add('hidden');
            
        } catch (error) {
            alert(`エラーが発生しました: ${error.message}`);
            console.error('インポートエラー:', error);
        }
    });
    
    // コピーボタンのイベントリスナー
    copyButton.addEventListener('click', () => {
        shareUrl.select();
        document.execCommand('copy');
        
        const originalText = copyButton.textContent;
        copyButton.textContent = 'コピーしました！';
        setTimeout(() => {
            copyButton.textContent = originalText;
        }, 2000);
    });
    
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
            
            // 昇進 現在
            const tdEliteCurrent = document.createElement('td');
            tdEliteCurrent.textContent = operator.elite || 0;
            tr.appendChild(tdEliteCurrent);
            
            // レベル 現在
            const tdLevelCurrent = document.createElement('td');
            tdLevelCurrent.textContent = operator.level || 1;
            tr.appendChild(tdLevelCurrent);
            
            // スキル 現在
            const tdSkillCurrent = document.createElement('td');
            tdSkillCurrent.textContent = operator.skill || 7;
            tr.appendChild(tdSkillCurrent);
            
            // スキル1特化 現在
            const tdSkill1Current = document.createElement('td');
            tdSkill1Current.textContent = operator.skill1 || 0;
            tr.appendChild(tdSkill1Current);
            
            // スキル2特化 現在
            const tdSkill2Current = document.createElement('td');
            tdSkill2Current.textContent = operator.skill2 || 0;
            tr.appendChild(tdSkill2Current);
            
            // スキル3特化 現在
            const tdSkill3Current = document.createElement('td');
            tdSkill3Current.textContent = operator.skill3 || 0;
            tr.appendChild(tdSkill3Current);
            
            // モジュールX 現在
            const tdModuleXCurrent = document.createElement('td');
            tdModuleXCurrent.textContent = operator.moduleX || 0;
            tr.appendChild(tdModuleXCurrent);
            
            // モジュールY 現在
            const tdModuleYCurrent = document.createElement('td');
            tdModuleYCurrent.textContent = operator.moduleY || 0;
            tr.appendChild(tdModuleYCurrent);
            
            // モジュールD 現在
            const tdModuleDCurrent = document.createElement('td');
            tdModuleDCurrent.textContent = operator.moduleD || 0;
            tr.appendChild(tdModuleDCurrent);
            
            // モジュールA 現在
            const tdModuleACurrent = document.createElement('td');
            tdModuleACurrent.textContent = operator.moduleA || 0;
            tr.appendChild(tdModuleACurrent);
            
            // 行をテーブルに追加
            operatorsBody.appendChild(tr);
        });
    }
});