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
"""
