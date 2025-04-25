// DOM要素の取得
const textBox = document.getElementById('text-box');
const micButton = document.getElementById('mic-button');
const aiConvertButton = document.getElementById('ai-convert-button');
const promptInputButton = document.getElementById('prompt-input-button');
const statusText = document.getElementById('status');

// --- Web Speech API (音声認識) 関連 ---
// ブラウザがSpeechRecognitionに対応しているかチェック
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition;
let isRecording = false; // 録音状態フラグ

if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.continuous = true; // 継続的に認識
    recognition.interimResults = true; // 途中結果を取得
    recognition.lang = 'ja-JP'; // 言語を日本語に設定

    // 音声認識結果が得られたときの処理
    recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                finalTranscript += event.results[i][0].transcript;
            } else {
                interimTranscript += event.results[i][0].transcript;
            }
        }
        // 確定したテキストをテキストボックスに追加（既存の内容の後ろに追加）
        if (finalTranscript) {
           textBox.value += finalTranscript;
        }
         // 認識中のテキストをステータスに表示（必要なら）
        // statusText.textContent = '認識中: ' + interimTranscript;
    };

    // 音声認識が終了したときの処理
    recognition.onend = () => {
        if (isRecording) {
            // 予期せず終了した場合など、再度開始する場合（必要に応じて調整）
            // recognition.start();
            // 今回は停止ボタンで明示的に止めるので、ここでは何もしないか、
            // ユーザーに通知するなど
            stopRecording(); // 念のため状態をリセット
            console.log("音声認識が終了しました。");
        }
    };

    // エラー発生時の処理
    recognition.onerror = (event) => {
        console.error('音声認識エラー:', event.error);
        statusText.textContent = `エラー: ${event.error}`;
        stopRecording(); // エラー発生時も停止
    };

} else {
    // SpeechRecognition非対応ブラウザの場合
    micButton.disabled = true;
    statusText.textContent = 'お使いのブラウザは音声認識に対応していません。';
    console.warn('SpeechRecognition is not supported in this browser.');
}

// --- マイクボタンのクリックイベント ---
micButton.addEventListener('click', () => {
    if (!recognition) return; // recognitionが初期化されていない場合は何もしない

    if (isRecording) {
        stopRecording();
    } else {
        startRecording();
    }
});

// 録音開始処理
function startRecording() {
    try {
        recognition.start();
        isRecording = true;
        micButton.classList.add('recording'); // 録音中スタイル適用
        micButton.innerHTML = '<i class="fas fa-stop"></i>'; // アイコンを停止に変更
        statusText.textContent = '音声認識中...';
        console.log("音声認識を開始しました。");
    } catch (error) {
        // まれに短期間に連続してstart()を呼ぶとエラーになることがある
        console.error("音声認識の開始に失敗しました:", error);
        statusText.textContent = '認識開始に失敗しました。';
        stopRecording(); // 状態をリセット
    }
}

// 録音停止処理
function stopRecording() {
    if (recognition && isRecording) {
        recognition.stop();
    }
    isRecording = false;
    micButton.classList.remove('recording'); // 録音中スタイル解除
    micButton.innerHTML = '<i class="fas fa-microphone"></i>'; // アイコンをマイクに戻す
    statusText.textContent = ''; // ステータス表示をクリア
    console.log("音声認識を停止しました。");
}

// --- API呼び出し関数 (雛形) ---
async function callApi(endpoint, data) {
    // ここで実際のAPI呼び出し処理を実装します
    // 例: fetch APIを使用
    console.log(`API呼び出し: ${endpoint}`);
    console.log('送信データ:', data);
    statusText.textContent = `${endpoint} API呼び出し中...`; // 処理中の表示

    try {
        // =============== API呼び出し例 (fetch) ===============
        // const response = await fetch(`YOUR_API_BASE_URL/${endpoint}`, {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json',
        //         // 必要に応じて認証トークンなどを追加
        //         // 'Authorization': 'Bearer YOUR_TOKEN'
        //     },
        //     body: JSON.stringify(data)
        // });

        // if (!response.ok) {
        //     throw new Error(`APIエラー: ${response.status} ${response.statusText}`);
        // }

        // const result = await response.json(); // レスポンスをJSONとして解析
        // console.log('APIレスポンス:', result);
        // statusText.textContent = 'API処理完了';

        // // APIの結果をテキストボックスに反映するなどの処理
        // // 例: textBox.value = result.convertedText;

        // return result; // 必要に応じて結果を返す
        // =====================================================

        // --- ▼▼▼ 以下はAPI呼び出しのダミー処理 (動作確認用) ▼▼▼ ---
        await new Promise(resolve => setTimeout(resolve, 1500)); // 1.5秒待機するダミー処理
        const dummyResult = { success: true, message: `${endpoint} のダミー処理完了`, inputData: data };
        console.log('ダミーAPIレスポンス:', dummyResult);
        statusText.textContent = 'ダミーAPI処理完了';
        return dummyResult;
        // --- ▲▲▲ API呼び出しのダミー処理ここまで ▲▲▲ ---

    } catch (error) {
        console.error(`${endpoint} API呼び出し中にエラーが発生しました:`, error);
        statusText.textContent = `エラー: ${error.message}`;
        // エラーハンドリング (ユーザーへの通知など)
        return null; // エラー時はnullを返すなど
    }
}

// --- AI変換ボタンのクリックイベント ---
aiConvertButton.addEventListener('click', async () => {
    const currentText = textBox.value;
    if (!currentText.trim()) {
        alert('テキストが入力されていません。');
        return;
    }

    // API呼び出し (AI変換)
    const result = await callApi('ai-convert', { text: currentText });

    if (result && result.success) {
        // API成功時の処理 (例: 変換後のテキストでテキストボックスを更新)
        // textBox.value = result.convertedText; // 実際のAPIレスポンスに合わせて変更
        console.log("AI変換API呼び出し成功");

        // ★★★ 任意の文字列を表示する処理を追加 ★★★
        textBox.value = "AI変換が完了しました！"; // ここに表示したい文字列を入れる
    } else {
        // API失敗時の処理
        console.log("AI変換API呼び出し失敗");
    }
});

// --- プロンプト入力ボタンのクリックイベント ---
promptInputButton.addEventListener('click', async () => {
    // ここでプロンプトを入力するUIを表示する処理などを実装できます
    // 例: prompt()関数で簡易的に入力
    const promptText = prompt("プロンプトを入力してください:", ""); // promptは簡易的なのでUIライブラリ推奨

    if (promptText === null || !promptText.trim()) {
        // キャンセルされたか、空文字の場合は何もしない
        console.log("プロンプト入力がキャンセルされました。");
        return;
    }

    const currentText = textBox.value;

    // API呼び出し (プロンプト入力)
    const result = await callApi('prompt-process', {
        text: currentText,
        prompt: promptText
    });

    if (result && result.success) {
        // API成功時の処理
        // 例: 結果をテキストボックスに反映
        // textBox.value = result.processedText; // 実際のAPIレスポンスに合わせて変更
         console.log("プロンプト処理API呼び出し成功");
    } else {
        // API失敗時の処理
        console.log("プロンプト処理API呼び出し失敗");
    }
});