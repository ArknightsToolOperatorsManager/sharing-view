// HTTP APIを使用してデータを取得する関数
async function fetchOperatorData(dataId) {
    try {
        const response = await fetch(`https://us-central1-arknights-sharing-view.cloudfunctions.net/getCharacterDataHttp?id=${dataId}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data && data.characters) {
            return data.characters;
        } else {
            throw new Error('データが見つかりませんでした');
        }
    } catch (error) {
        console.error('データ取得エラー:', error);
        throw error;
    }
}
