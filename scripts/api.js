// Firebaseとの連携
// Firestoreにデータを保存する関数
async function saveOperatorData(operators) {
    try {
        // Cloud Functionsを呼び出してデータを保存し、短いIDを生成
        const saveFunction = firebase.functions().httpsCallable('saveCharacterData');
        const result = await saveFunction({ data: operators });
        
        return result.data;
    } catch (error) {
        console.error('データ保存エラー:', error);
        throw error;
    }
}

// Firestoreからデータを取得する関数
async function fetchOperatorData(dataId) {
    try {
        // Cloud Functionsを呼び出してデータを取得
        const fetchFunction = firebase.functions().httpsCallable('getCharacterData');
        const result = await fetchFunction({ id: dataId });
        
        if (result.data && result.data.characters) {
            return result.data.characters;
        } else {
            throw new Error('データが見つかりませんでした');
        }
    } catch (error) {
        console.error('データ取得エラー:', error);
        throw error;
    }
}