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
"""
# ---------------------------------------------------------

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
