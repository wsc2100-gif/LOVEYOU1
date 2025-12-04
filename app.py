import streamlit as st
import google.generativeai as genai

# 1. 設定標題與說明
st.set_page_config(page_title="AI 情感詐騙辨識器", page_icon="🛡️")
st.title("🛡️ AI 情感詐騙辨識器")
st.markdown("請將對方傳來的**對話截圖內容**或**文字**貼在下方，AI 將為您分析是否為詐騙陷阱。")

# 2. 設定 API Key (從雲端 secrets 讀取)
if "GOOGLE_API_KEY" in st.secrets:
    genai.configure(api_key=st.secrets["GOOGLE_API_KEY"])
else:
    st.error("尚未設定 API Key，請聯絡管理員。")
    st.stop()

# 3. 初始化模型與 Prompt
# ---------------------------------------------------------
# 請將你在 AI Studio 的 System Instructions 貼在下方引號內
system_instruction = """
你是一位資深的詐騙防制專家，專精於分析「殺豬盤」與情感詐騙。
請針對使用者提供的對話內容進行分析，指出其中的疑點、心理操縱手法，
並給出風險評估（低、中、高）。如果內容涉及金錢、投資、緊急匯款，請給予強烈警告。
請用溫和但在地的台灣繁體中文口吻回答，適合長輩閱讀。
<main>
    <section id="input-section">
        <h2>📝 貼上您的對話內容</h2>
        <p>請將您與對象（「雲端情人」）從認識到開始談錢的連續對話貼入下方，包含多日時間軸的紀錄。</p>
        <textarea id="conversationInput" rows="15" placeholder="請在此貼上您的對話紀錄..."></textarea>
        <button onclick="analyzeConversation()">開始 AI 模式分析</button>
    </section>

    <section id="result-section" class="hidden">
        <h2>🤖 AI 深度分析報告</h2>
        <div id="riskScore"></div>
        
        <h3>📊 關鍵模式分析（三大警訊）</h3>
        <div id="analysisDetails"></div>

        <h3>💬 情感操控關鍵詞雲</h3>
        <p>AI 從對話中提取的高頻詞彙。請注意「情感詞」與「金錢詞」的交錯。</p>
        <div id="keywordCloud" class="cloud-container"></div>
        
        <div id="support-message">
            <h3>💡 溫馨提醒與防禦</h3>
            [span_0](start_span)<p class="warm-message">如果您被判定為高風險，請記得：這不是你的錯。這是工業化犯罪集團的心理操控。請立即尋求協助！[span_0](end_span)</p>
        </div>

        <a href="https://165.npa.gov.tw/" target="_blank" class="help-button">🚨 撥打 165 反詐騙專線</a>
    </section>
</main>

<footer>
    <p>&copy; 情感詐騙 AI 解構計畫 | [span_1](start_span)支援系統性責任與個人防範[span_1](end_span)</p>
</footer>

<script src="script.js"></script>



model = genai.GenerativeModel(
    model_name="gemini-1.5-flash", # 或 gemini-1.5-pro
    system_instruction=system_instruction
)

# 4. 管理聊天記錄 (讓 AI 記得上文)
if "messages" not in st.session_state:
    st.session_state.messages = []

# 顯示歷史訊息
for message in st.session_state.messages:
    with st.chat_message(message["role"]):
        st.markdown(message["content"])

# 5. 處理使用者輸入
if prompt := st.chat_input("請輸入或是貼上可疑的對話內容..."):
    # 顯示使用者訊息
    st.chat_message("user").markdown(prompt)
    st.session_state.messages.append({"role": "user", "content": prompt})

    # AI 生成回答
    try:
        chat = model.start_chat(history=[
            {"role": m["role"], "parts": [m["content"]]} 
            for m in st.session_state.messages[:-1] # 轉換歷史格式
        ])
        
        response = chat.send_message(prompt)
        
        with st.chat_message("assistant"):
            st.markdown(response.text)
        
        st.session_state.messages.append({"role": "model", "content": response.text})
        
    except Exception as e:
        st.error(f"發生錯誤，請稍後再試：{e}")
if (input.trim() === '') {
    alert('請貼上對話內容才能進行分析。');
    return;
}

// 初始化結果區塊
resultSection.classList.remove('hidden');
document.getElementById('analysisDetails').innerHTML = '';
document.getElementById('keywordCloud').innerHTML = '';

// 將輸入轉為小寫，方便比對
const lowerInput = input.toLowerCase();

let moneyCount = 0;
let emotionCount = 0;
let riskLevel = 0; // 0=低, 1=中, 2=高

const analysisDetails = document.getElementById('analysisDetails');
const keywordCloud = document.getElementById('keywordCloud');

// --- 1. 關鍵詞計數與詞雲生成 ---
const detectedKeywords = [];

for (const type in keywords) {
    keywords[type].forEach(word => {
        const regex = new RegExp(word, 'g');
        const matches = lowerInput.match(regex);
        
        if (matches) {
            matches.forEach(() => {
                detectedKeywords.push({ word: word, type: type });
                if (type === 'money') moneyCount++;
                if (type === 'emotion') emotionCount++;
            });
        }
    });
}

// 隨機排列並顯示關鍵詞
detectedKeywords.sort(() => 0.5 - Math.random()).forEach(item => {
    const span = document.createElement('span');
    span.textContent = item.word;
    span.className = `keyword ${item.type}`;
    keywordCloud.appendChild(span);
});

// --- 2. 風險判定與模式分析 ---
let analysisOutput = '';

[span_2](start_span)// 警訊 1: 虛擬的完美 vs. 真實的迴避[span_2](end_span)
let avoidanceDetected = exclusionPhrases.some(phrase => lowerInput.includes(phrase.toLowerCase()));
if (avoidanceDetected) {
    analysisOutput += createAlertItem('虛擬的完美 vs. 真實的迴避', '偵測到：對話中包含「拒絕視訊」或「在國外」等詞彙。', '風險：假帳號通常會拒絕在真實世界連結。請查核照片來源。', 'warning');
    riskLevel = Math.max(riskLevel, 1);
} else {
    analysisOutput += createAlertItem('虛擬的完美 vs. 真實的迴避', '偵測到：**未明確偵測到**明顯的迴避詞彙。', '請仍保持警惕，並使用「以圖搜圖」工具查核其照片來源。', 'info');
}

[span_3](start_span)[span_4](start_span)// 警訊 2: 情感高峰 vs. 金錢切入 (致命交叉點)[span_3](end_span)[span_4](end_span)
// 模擬判斷：情感詞與金錢詞都高，且金錢詞佔比超過一定門檻 (模擬交叉點)
if (emotionCount > 5 && moneyCount > 3) {
    analysisOutput += createAlertItem('情感高峰 vs. 金錢切入 (致命交叉)', `偵測到：**親密詞彙 (e.g., 寶貝) ${emotionCount} 次**，與**金錢詞彙 (e.g., 投資) ${moneyCount} 次**同時出現。`, '核心轉折：這極度符合情感親密度達到頂點後，金錢要求急遽上升的「致命交叉點」模式。這是一場精心設計的心理戰！', 'critical');
    riskLevel = Math.max(riskLevel, 2); // 最高風險
} else if (emotionCount > 5 && moneyCount > 0) {
    analysisOutput += createAlertItem('情感高峰 vs. 金錢切入 (早期訊號)', `偵測到：親密詞彙多，金錢詞彙 (e.g., 投資, 賺錢) 開始出現 (${moneyCount} 次)。`, '早期訊號：詐騙集團正在進入「養豬」的後期，準備切入主題。請立即停止投入情感！', 'medium');
    riskLevel = Math.max(riskLevel, 1);
} else {
     analysisOutput += createAlertItem('情感高峰 vs. 金錢切入 (未明顯偵測)', '偵測到：情感詞彙或金錢詞彙數量均不高。', '持續觀察：這可能處於「養豬」的早期，尚未引入金錢話題。請持續警惕。', 'info');
}

[span_5](start_span)[span_6](start_span)// 警訊 3: 獲利小甜頭 vs. 加碼大要求[span_5](end_span)[span_6](end_span)
if (lowerInput.includes('先投一點點') || lowerInput.includes('提領') && moneyCount > 5) {
    analysisOutput += createAlertItem('獲利小甜頭 vs. 加碼大要求', '偵測到：「先試試看」、「可提領」等話術，與高頻金錢詞彙重疊。', '警惕：這是為了建立信任的「給點甜頭」階段。所有需要你不斷投錢才能領回本金的「投資」都是騙局。', 'critical');
    riskLevel = Math.max(riskLevel, 2);
} else {
    analysisOutput += createAlertItem('獲利小甜頭 vs. 加碼大要求', '偵測到：**未明確偵測到**明顯的初期「小甜頭」話術。', '請保持警惕，如果未來出現「保證獲利」或「保證金/稅金」等要求，請立即停止。', 'info');
}

analysisDetails.innerHTML = analysisOutput;

// --- 3. 總體風險評分顯示 ---
const riskScoreElement = document.getElementById('riskScore');
if (riskLevel === 2) {
    riskScoreElement.className = 'high-risk';
    riskScoreElement.innerHTML = `🚨 總體風險等級：**高風險** - 您的對話極度符合「殺豬盤」模式。`;
} else if (riskLevel === 1) {
    riskScoreElement.className = 'medium-risk';
    riskScoreElement.innerHTML = `⚠️ 總體風險等級：**中等風險** - 偵測到數個早期警訊，請立即警惕！`;
} else {
    riskScoreElement.className = 'low-risk';
    riskScoreElement.innerHTML = `✅ 總體風險等級：**低風險** - 目前未偵測到明顯的詐騙模式。`;
}
return `
    <div class="alert-item">
        <h4>${icon} ${title}</h4>
        <p><strong>偵測結果：</strong>${detection}</p>
        <p><strong>AI 解讀：</strong>${interpretation}</p>
    </div>
`;
"""
