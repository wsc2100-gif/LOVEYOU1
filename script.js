document.addEventListener('DOMContentLoaded', () => {
    // Navigation handling
    const navItems = document.querySelectorAll('.nav-item');
    const views = document.querySelectorAll('.view-section');

    function switchView(viewId) {
        // Hide all views
        views.forEach(view => {
            view.style.display = 'none';
        });

        // Show target view
        const targetView = document.getElementById(viewId);
        if (targetView) {
            targetView.style.display = 'block';
        }

        // Update nav active state
        navItems.forEach(item => {
            if (item.dataset.target === viewId) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const target = item.dataset.target;
            if (target) {
                switchView(target);
            }
        });
    });

    // Dashboard "Start Scan" button -> Switches to Deepfake View
    const dashboardScanBtn = document.getElementById('scan-btn-dashboard');
    if (dashboardScanBtn) {
        dashboardScanBtn.addEventListener('click', (e) => {
            e.preventDefault();
            switchView('deepfake-view');
        });
    }

    // Dashboard "Chat Analysis" button -> Switches to Chat View
    const dashboardChatBtn = document.getElementById('chat-btn-dashboard');
    if (dashboardChatBtn) {
        dashboardChatBtn.addEventListener('click', (e) => {
            e.preventDefault();
            switchView('chat-view');
        });
    }

    // File Upload Logic (In Deepfake View)
    const dropArea = document.getElementById('drop-area');
    const fileInput = document.getElementById('file-input');
    const analysisBox = document.querySelector('.analysis-box');

    if (dropArea && fileInput && analysisBox) {
        // Click to upload
        dropArea.addEventListener('click', () => {
            fileInput.click();
        });

        // File Selection
        fileInput.addEventListener('change', (e) => {
            handleFiles(e.target.files);
            fileInput.value = ''; // Reset
        });

        // Drag and Drop
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropArea.addEventListener(eventName, preventDefaults, false);
        });

        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }

        ['dragenter', 'dragover'].forEach(eventName => {
            dropArea.addEventListener(eventName, highlight, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropArea.addEventListener(eventName, unhighlight, false);
        });

        function highlight(e) {
            dropArea.style.borderColor = '#60a5fa';
            dropArea.style.backgroundColor = 'rgba(30, 41, 59, 0.9)';
        }

        function unhighlight(e) {
            dropArea.style.borderColor = 'rgba(255, 255, 255, 0.2)';
            dropArea.style.backgroundColor = '';
        }

        dropArea.addEventListener('drop', handleDrop, false);

        function handleDrop(e) {
            const dt = e.dataTransfer;
            const files = dt.files;
            handleFiles(files);
        }

    }

    function handleFiles(files) {
        if (files.length > 0) {
            const file = files[0];

            // Show Preview
            const reader = new FileReader();
            reader.onload = function (e) {
                dropArea.innerHTML = `
                        <div class="preview-container">
                            <img src="${e.target.result}" class="uploaded-image" alt="Uploaded Image">
                            <button class="remove-btn" id="remove-img-btn"><i class="fa-solid fa-xmark"></i></button>
                            <button class="re-scan-btn" id="rescan-btn"><i class="fa-solid fa-expand"></i> 立即偵測</button>
                        </div>
                    `;

                // Re-bind remove event
                document.getElementById('remove-img-btn').addEventListener('click', (ev) => {
                    ev.stopPropagation(); // Prevent triggering dropArea click
                    resetUpload();
                });

                // Bind "Scan Now" button inside the image if user wants to re-trigger or visual effect
                // In this flow, we auto-start analysis on drop, but having the button matches the UI screenshot
                document.getElementById('rescan-btn').addEventListener('click', (ev) => {
                    ev.stopPropagation();
                    startAnalysis(file);
                });
            }
            reader.readAsDataURL(file);

            startAnalysis(file);
        }
    }

    function resetUpload() {
        analysisBox.classList.remove('results-mode'); // Reset layout
        dropArea.innerHTML = `
                <div class="upload-content">
                    <div class="icon-circle">
                        <i class="fa-solid fa-upload"></i>
                    </div>
                    <h3>點擊上傳或拖放檔案</h3>
                    <p>支援 JPG, PNG, WEBP</p>
                    <input type="file" id="file-input" hidden accept="image/*">
                </div>
            `;
        // Reset Analysis Box
        analysisBox.innerHTML = `
                 <div class="placeholder-content">
                    <div class="icon-circle dim">
                        <i class="fa-solid fa-expand"></i>
                    </div>
                    <h3>準備進行 AI 鑑識</h3>
                    <p>支援名人搜尋比對與特徵物理分析。</p>
                </div>
            `;

        // Re-attach file input listener since we overwrote the HTML
        // Note: In a real app, we'd better toggle visibility instead of innerHTML, but this is quick
        // Actually, fileInput is outside dropArea? No, looking at HTML, input is INSIDE upload-content div.
        // Oh, wait. In HTML line 104, input is inside upload-content. 
        // So when I overwrite dropArea.innerHTML, I lose the input element and its listener.
        // Correction: I should re-create the input or simple re-attach listener.
        // Let's re-attach the listener logic here for simplicity or move input outside in future refactor.
        // For now, I will just re-add the listener.
        const newFileInput = dropArea.querySelector('#file-input');
        if (newFileInput) {
            newFileInput.addEventListener('change', (e) => {
                handleFiles(e.target.files);
            });
        }
    }

    function startAnalysis(file) {
        analysisBox.classList.remove('results-mode'); // Ensure centered for loading
        // Updated UI to show loading
        analysisBox.innerHTML = `
                <div class="result-content">
                    <div class="loading-spinner"></div>
                    <h3>正在分析影像...</h3>
                    <p>正在結合 Google 搜尋與光影物理模型比對中</p>
                </div>
            `;

        // Simulate analysis delay
        setTimeout(() => {
            showResults(file);
        }, 2500);
    }

    function showResults(file) {
        // Mock result logic - For this demo request, we'll mostly show the detailed "Safe" result 
        // because the user provided a specific screenshot for it.
        // But I'll keep the randomization if desired, or bias it heavily towards the demo content.

        const isSafe = true; // Force safe for demo to match screenshot requirements

        let resultHTML = '';

        if (isSafe) {
            analysisBox.classList.add('results-mode'); // Enable scrolling layout
            resultHTML = `
                    <div class="result-content" style="padding: 24px; text-align: left;">
                        
                        <div class="score-card">
                            <div class="score-info">
                                <i class="fa-solid fa-circle-check score-icon"></i>
                                <div class="score-text">
                                    <h3>影像真實性高，無明顯深偽或AI生成痕跡。</h3>
                                    <p>風險等級：低風險</p>
                                </div>
                            </div>
                            <div class="score-value">
                                <div class="score-number">20<span style="font-size:14px; color:#94a3b8; font-weight:400;">/100</span></div>
                                <div class="score-label">威脅評分</div>
                            </div>
                        </div>

                        <div class="analysis-summary">
                            <h4><i class="fa-regular fa-clock"></i> 分析摘要</h4>
                            <p class="summary-text">
                                本影像經過深度鑑識分析，未發現明顯的深偽 (Deepfake) 或AI生成痕跡。在「名人與網路比對」方面，影像中的人物並非廣為人知的公眾人物，且由於技術限制，本分析無法直接執行逆向圖片搜尋以確認該影像是否為已知的假圖片或換臉素材。若能進行逆向圖片搜尋，將能提供更全面的驗證。
                            </p>

                            <h4><i class="fa-solid fa-face-viewfinder"></i> 臉部生理特徵</h4>
                             <p class="summary-text">
                                針對「臉部生理特徵」：瞳孔反光對稱且自然，顯示光源方向一致。耳朵與髮絲邊緣處理自然，特別是髮絲有自然的凌亂感（參見局部放大圖），沒有模糊或不自然的切割痕跡。牙齒數量與形狀自然，存在真實牙齒常見的輕微不規則與色澤，而非AI生成常見的過於完美或扭曲。人物表情自然，臉部肌肉（如眼角、嘴角）的皺紋符合笑容的自然變化，未見僵硬感。
                            </p>

                            <h4><i class="fa-regular fa-sun"></i> 環境與物理光影</h4>
                            <p class="summary-text">
                                在「環境與物理光影」方面：臉部光源方向與背景光線一致，光影過渡自然。頸部連接處膚色均勻，無明顯色差。背景為純色牆壁，無文字或直線物體，因此無法評估AI運算可能造成的扭曲，但牆壁上可見的細微斑點更符合真實環境的特徵。
                            </p>

                             <h4><i class="fa-solid fa-fingerprint"></i> AI 生成偽影</h4>
                            <p class="summary-text">
                                關於「AI生成偽影」：皮膚質感整體而言相對平滑，但仍能觀察到細微毛孔和紋理，尤其在鼻子和臉頰區域。然而，額頭部分（參見局部放大圖）顯得較為均勻光滑並帶有輕微光澤，這可能是自然出油、特定照明條件或輕微修圖的結果，但不足以作為AI生成「塑膠感」皮膚的確鑿證據。影像中未出現手部，因此無法檢查手指數量等常見AI偽影。
                            </p>
                        </div>
                    </div>
                `;
        } else {
            // Keep the simple bad result for fallback
            resultHTML = `
                    <div class="result-content">
                        <div class="icon-circle" style="color: #ef4444; background: rgba(239, 68, 68, 0.1);">
                            <i class="fa-solid fa-triangle-exclamation"></i>
                        </div>
                        <h3>檢測到潛在風險</h3>
                        <div class="result-badge danger"><i class="fa-solid fa-user-robot"></i> 疑似深偽 (Deepfake)</div>
                        
                        <div class="analysis-details">
                            <div class="detail-item">
                                <i class="fa-solid fa-globe"></i>
                                <span><strong>Google 搜尋比對：</strong> 未在官方來源找到匹配影像，來源不明。</span>
                            </div>
                            <div class="detail-item">
                                <i class="fa-regular fa-sun"></i>
                                <span><strong>物理光影：</strong> 臉部高光與背景光源方向不一致。</span>
                            </div>
                            <div class="detail-item">
                                <i class="fa-solid fa-fingerprint"></i>
                                <span><strong>AI 偽影檢測：</strong> 檢測到眼部與輪胎邊緣的高頻噪聲異常。</span>
                            </div>
                        </div>
                    </div>
                `;
        }

        analysisBox.innerHTML = resultHTML;
    }

    // Chat Analysis Logic
    const chatInput = document.getElementById('chat-input');
    const analyzeChatBtn = document.getElementById('analyze-chat-btn');
    const clearChatBtn = document.getElementById('clear-chat-btn');
    const chatAnalysisResult = document.getElementById('chat-analysis-result');

    if (analyzeChatBtn && chatAnalysisResult) {
        clearChatBtn.addEventListener('click', () => {
            if (chatInput) {
                chatInput.value = '';
                chatInput.focus(); // Focus for quick re-entry
            }
            resetChatAnalysis();
        });

        analyzeChatBtn.addEventListener('click', () => {
            const text = chatInput ? chatInput.value.trim() : '';
            if (!text) {
                alert('請先輸入對話內容');
                return;
            }
            startChatAnalysis(text);
        });

        function resetChatAnalysis() {
            chatAnalysisResult.classList.remove('results-mode');
            chatAnalysisResult.innerHTML = `
                <div class="placeholder-content">
                    <div class="icon-circle dim">
                        <i class="fa-solid fa-radar"></i>
                    </div>
                    <h3>AI 語意風險偵測</h3>
                    <p>偵測情緒勒索、誘導匯款、假冒身份等詐騙特徵。</p>
                </div>
            `;
        }

        function startChatAnalysis(text) {
            chatAnalysisResult.classList.remove('results-mode');
            chatAnalysisResult.innerHTML = `
                <div class="result-content">
                    <div class="loading-spinner"></div>
                    <h3>正在分析語意特徵...</h3>
                    <p>正在比對詐騙腳本資料庫與心理語言模型</p>
                </div>
            `;

            setTimeout(() => {
                showChatResults(text);
            }, 2000);
        }

        function showChatResults(text) {
            // Dynamic logic checking for keywords
            const textLower = text.toLowerCase();

            // Keyword Categories
            // Keyword Categories
            // Removed generic '銀行', '帳戶' to prevent false positives in emotional/investment scams
            const phishingKeywords = ['國泰', '世華', '凍結', '解鎖', '身分證', '健保卡', '證件', '登入', '驗證碼', '異常', '涉嫌', '洗錢', '客服', 'service'];
            const emotionalKeywords = ['寶貝', '親愛的', '老公', '老婆', '緣分'];

            // Split Financial into Investment vs Emergency
            const investmentKeywords = ['投資', '獲利', '穩賺', '保證', '規劃', '未來', '銀行', '帳戶', '虛擬貨幣', '比特幣'];
            const emergencyKeywords = ['匯款', '轉帳', '借錢', '手術', '車禍', '10萬', '十萬', '急用', '應急', '救命'];

            // Detection Logic
            const foundPhishing = phishingKeywords.filter(k => textLower.includes(k));
            const foundEmotional = emotionalKeywords.filter(k => textLower.includes(k));
            const foundInvestment = investmentKeywords.filter(k => textLower.includes(k));
            const foundEmergency = emergencyKeywords.filter(k => textLower.includes(k));

            // Scenarios
            const isPhishing = foundPhishing.length > 0;
            // Pig Butchering: Intimacy + Investment/Profit talk
            const isPigButchering = foundEmotional.length > 0 && foundInvestment.length > 0;
            // Emergency Scam: Intimacy + Urgent money request
            const isEmergencyScam = (foundEmotional.length > 0 && foundEmergency.length > 0) || (foundEmergency.length > 0 && text.length > 200);

            chatAnalysisResult.classList.add('results-mode');
            let resultHTML = '';

            if (isPhishing) {
                // --- SCENARIO 1: Phishing / Fake Bank ---
                resultHTML = `
                <div class="result-content" style="padding: 24px; text-align: left;">
                    <div class="score-card" style="background: rgba(239, 68, 68, 0.05); border-color: rgba(239, 68, 68, 0.2);">
                        <div class="score-info">
                            <i class="fa-solid fa-building-columns score-icon" style="color: #ef4444;"></i>
                            <div class="score-text">
                                <h3 style="color: #ef4444;">假冒機構/釣魚詐騙</h3>
                                <p>風險等級：極高風險</p>
                            </div>
                        </div>
                        <div class="score-value">
                            <div class="score-number" style="color: #ef4444;">98<span style="font-size:14px; color:#94a3b8; font-weight:400;">/100</span></div>
                            <div class="score-label">威脅評分</div>
                        </div>
                    </div>

                    <div class="stats-container">
                        <div class="stat-box danger">
                            <div class="stat-value">${Math.max(3, foundPhishing.length)} 項</div>
                            <div class="stat-label">偵測異常數量</div>
                        </div>
                        <div class="stat-box">
                            <div class="stat-value">個資竊盜</div>
                            <div class="stat-label">風險模型類別</div>
                        </div>
                         <div class="stat-box">
                            <div class="stat-value">官方偽冒</div>
                            <div class="stat-label">語氣急迫性</div>
                        </div>
                    </div>

                    <div class="report-section">
                        <div class="section-title"><i class="fa-solid fa-file-contract"></i> 分析摘要</div>
                        <p class="summary-text">
                            此訊息具有「假冒官方機構釣魚」的高度特徵。內容聲稱受害者的「銀行帳戶被凍結」或「涉及非法案件」，利用民眾對法律後果的恐懼心理。接著要求受害者提供極度敏感的個人資料（如身分證正反面、存摺照片），或引導至非官方的電子信箱/連結。這類手法旨在竊取您的身分資料以進行盜用，或詐騙您的銀行憑證。
                        </p>
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">
                        <div>
                             <div class="section-title" style="color:#ef4444;"><i class="fa-solid fa-bug"></i> 偵測到的異常特徵</div>
                            <ul style="list-style: none; padding: 0;">
                                <li style="margin-bottom: 12px; font-size: 13px; color: var(--text-secondary); line-height: 1.5; display: flex; align-items: start; gap: 8px;">
                                    <span style="color: #ef4444; margin-top: 4px;">●</span>
                                    <span>未經核實即聲稱「帳戶凍結」或「涉及刑案」，製造恐慌。</span>
                                </li>
                                <li style="margin-bottom: 12px; font-size: 13px; color: var(--text-secondary); line-height: 1.5; display: flex; align-items: start; gap: 8px;">
                                    <span style="color: #ef4444; margin-top: 4px;">●</span>
                                    <span>透過非官方管道（如一般Email、LINE）要求傳送證件照片。</span>
                                </li>
                                <li style="margin-bottom: 12px; font-size: 13px; color: var(--text-secondary); line-height: 1.5; display: flex; align-items: start; gap: 8px;">
                                    <span style="color: #ef4444; margin-top: 4px;">●</span>
                                    <span>索取身分證正反面、健保卡等足以冒用身分的完整個資。</span>
                                </li>
                            </ul>
                        </div>
                        
                        <div>
                             <div class="section-title" style="color:#10b981;"><i class="fa-solid fa-shield-halved"></i> 建議採取行動</div>
                            <ul style="list-style: none; padding: 0;">
                                <li style="margin-bottom: 12px; font-size: 13px; color: var(--text-secondary); line-height: 1.5; display: flex; align-items: start; gap: 8px;">
                                    <span style="color: #10b981; margin-top: 4px;">●</span>
                                    <span>絕對不要回傳任何證件照片或個人資料。</span>
                                </li>
                                <li style="margin-bottom: 12px; font-size: 13px; color: var(--text-secondary); line-height: 1.5; display: flex; align-items: start; gap: 8px;">
                                    <span style="color: #10b981; margin-top: 4px;">●</span>
                                    <span>直接撥打銀行官方客服電話（信用卡背面的號碼）查證，切勿撥打信中提供的號碼。</span>
                                </li>
                                <li style="margin-bottom: 12px; font-size: 13px; color: var(--text-secondary); line-height: 1.5; display: flex; align-items: start; gap: 8px;">
                                    <span style="color: #10b981; margin-top: 4px;">●</span>
                                    <span>若已提供資料，請立即報警並通知銀行掛失證件。</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>`;
            } else if (isPigButchering) {
                // --- SCENARIO 2: Pig Butchering / Investment Scam (NEW) ---
                resultHTML = `
                <div class="result-content" style="padding: 24px; text-align: left;">
                    <div class="score-card" style="background: rgba(239, 68, 68, 0.05); border-color: rgba(239, 68, 68, 0.2);">
                        <div class="score-info">
                            <i class="fa-solid fa-heart-crack score-icon" style="color: #ef4444;"></i>
                            <div class="score-text">
                                <h3 style="color: #ef4444;">交友投資詐騙 (殺豬盤)</h3>
                                <p>風險等級：極高風險</p>
                            </div>
                        </div>
                        <div class="score-value">
                            <div class="score-number" style="color: #ef4444;">92<span style="font-size:14px; color:#94a3b8; font-weight:400;">/100</span></div>
                            <div class="score-label">威脅評分</div>
                        </div>
                    </div>

                    <div class="stats-container">
                        <div class="stat-box danger">
                            <div class="stat-value">${Math.max(4, foundInvestment.length)} 項</div>
                            <div class="stat-label">偵測異常數量</div>
                        </div>
                        <div class="stat-box">
                            <div class="stat-value">假交友投資</div>
                            <div class="stat-label">風險模型類別</div>
                        </div>
                         <div class="stat-box">
                            <div class="stat-value">誘惑</div>
                            <div class="stat-label">語氣急迫性</div>
                        </div>
                    </div>

                    <div class="report-section">
                        <div class="section-title"><i class="fa-solid fa-file-contract"></i> 分析摘要</div>
                        <p class="summary-text">
                            此對話呈現典型「殺豬盤 (Pig Butchering)」特徵。詐騙者利用長時間的情感培養（親密稱呼、規劃未來）來降低您的戒心，隨後將話題引導至「投資獲利」、「為未來存錢」等金錢議題。這種「先談情、後談錢」的手法，目的是誘騙您將資金投入其控制的假投資平台。
                        </p>
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">
                        <div>
                             <div class="section-title" style="color:#ef4444;"><i class="fa-solid fa-bug"></i> 偵測到的異常特徵</div>
                            <ul style="list-style: none; padding: 0;">
                                <li style="margin-bottom: 12px; font-size: 13px; color: var(--text-secondary); line-height: 1.5; display: flex; align-items: start; gap: 8px;">
                                    <span style="color: #ef4444; margin-top: 4px;">●</span>
                                    <span>建立親密關係後，突然提及「穩賺不賠」或「高報酬」投資。</span>
                                </li>
                                <li style="margin-bottom: 12px; font-size: 13px; color: var(--text-secondary); line-height: 1.5; display: flex; align-items: start; gap: 8px;">
                                    <span style="color: #ef4444; margin-top: 4px;">●</span>
                                    <span>以「為了我們的未來」為由，情緒勒索要求投入資金。</span>
                                </li>
                                <li style="margin-bottom: 12px; font-size: 13px; color: var(--text-secondary); line-height: 1.5; display: flex; align-items: start; gap: 8px;">
                                    <span style="color: #ef4444; margin-top: 4px;">●</span>
                                    <span>引導至不明的數位貨幣或博弈網站。</span>
                                </li>
                            </ul>
                        </div>
                        
                        <div>
                             <div class="section-title" style="color:#10b981;"><i class="fa-solid fa-shield-halved"></i> 建議採取行動</div>
                            <ul style="list-style: none; padding: 0;">
                                <li style="margin-bottom: 12px; font-size: 13px; color: var(--text-secondary); line-height: 1.5; display: flex; align-items: start; gap: 8px;">
                                    <span style="color: #10b981; margin-top: 4px;">●</span>
                                    <span>堅持「談天不談錢」，拒絕任何形式的投資邀請。</span>
                                </li>
                                <li style="margin-bottom: 12px; font-size: 13px; color: var(--text-secondary); line-height: 1.5; display: flex; align-items: start; gap: 8px;">
                                    <span style="color: #10b981; margin-top: 4px;">●</span>
                                    <span>切勿點擊對方提供的任何連結下載APP或註冊帳號。</span>
                                </li>
                                <li style="margin-bottom: 12px; font-size: 13px; color: var(--text-secondary); line-height: 1.5; display: flex; align-items: start; gap: 8px;">
                                    <span style="color: #10b981; margin-top: 4px;">●</span>
                                    <span>對方若情急或指責您不信任，請直接封鎖。</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>`;
            } else if (isEmergencyScam) {
                // Show High Risk Result (Emotional Blackmail Demo)
                resultHTML = `
                <div class="result-content" style="padding: 24px; text-align: left;">
                    <div class="score-card" style="background: rgba(239, 68, 68, 0.05); border-color: rgba(239, 68, 68, 0.2);">
                        <div class="score-info">
                            <i class="fa-solid fa-triangle-exclamation score-icon" style="color: #ef4444;"></i>
                            <div class="score-text">
                                <h3 style="color: #ef4444;">情感勒索式詐騙嘗試</h3>
                                <p>風險等級：極高風險</p>
                            </div>
                        </div>
                        <div class="score-value">
                            <div class="score-number" style="color: #ef4444;">95<span style="font-size:14px; color:#94a3b8; font-weight:400;">/100</span></div>
                            <div class="score-label">威脅評分</div>
                        </div>
                    </div>

                    <div class="stats-container">
                        <div class="stat-box danger">
                            <div class="stat-value">5 項</div>
                            <div class="stat-label">偵測異常數量</div>
                        </div>
                        <div class="stat-box">
                            <div class="stat-value">情感勒索</div>
                            <div class="stat-label">風險模型類別</div>
                        </div>
                         <div class="stat-box">
                            <div class="stat-value">緊急</div>
                            <div class="stat-label">語氣急迫性</div>
                        </div>
                    </div>

                    <div class="report-section">
                        <div class="section-title"><i class="fa-solid fa-file-contract"></i> 分析摘要</div>
                        <p class="summary-text">
                            此對話明確顯示了社交工程詐騙的典型模式。對話者傾向使用親密稱謂（如「寶貝」）試圖快速建立情感連結。隨後，轉向以「緊急突發狀況」（如生病、手術、意外）為由，緊急且帶有強烈情感勒索地要求周轉資金。這種在未建立穩固關係基礎下，突然提出金錢要求的行為，是詐騙集團常見的套路。
                        </p>
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">
                        <div>
                             <div class="section-title" style="color:#ef4444;"><i class="fa-solid fa-bug"></i> 偵測到的異常特徵</div>
                            <ul style="list-style: none; padding: 0;">
                                <li style="margin-bottom: 12px; font-size: 13px; color: var(--text-secondary); line-height: 1.5; display: flex; align-items: start; gap: 8px;">
                                    <span style="color: #ef4444; margin-top: 4px;">●</span>
                                    <span>使用親密稱謂（如「寶貝」、「親愛的」）快速拉近關係。</span>
                                </li>
                                <li style="margin-bottom: 12px; font-size: 13px; color: var(--text-secondary); line-height: 1.5; display: flex; align-items: start; gap: 8px;">
                                    <span style="color: #ef4444; margin-top: 4px;">●</span>
                                    <span>以緊急理由（如手術、危急）索取金錢。</span>
                                </li>
                                <li style="margin-bottom: 12px; font-size: 13px; color: var(--text-secondary); line-height: 1.5; display: flex; align-items: start; gap: 8px;">
                                    <span style="color: #ef4444; margin-top: 4px;">●</span>
                                    <span>金額龐大且語氣急迫。</span>
                                </li>
                            </ul>
                        </div>
                        
                        <div>
                             <div class="section-title" style="color:#10b981;"><i class="fa-solid fa-shield-halved"></i> 建議採取行動</div>
                            <ul style="list-style: none; padding: 0;">
                                <li style="margin-bottom: 12px; font-size: 13px; color: var(--text-secondary); line-height: 1.5; display: flex; align-items: start; gap: 8px;">
                                    <span style="color: #10b981; margin-top: 4px;">●</span>
                                    <span>切勿向未曾實際見面的網友匯款。</span>
                                </li>
                                <li style="margin-bottom: 12px; font-size: 13px; color: var(--text-secondary); line-height: 1.5; display: flex; align-items: start; gap: 8px;">
                                    <span style="color: #10b981; margin-top: 4px;">●</span>
                                    <span>保護個人財務資訊，勿透露帳號密碼。</span>
                                </li>
                                <li style="margin-bottom: 12px; font-size: 13px; color: var(--text-secondary); line-height: 1.5; display: flex; align-items: start; gap: 8px;">
                                    <span style="color: #10b981; margin-top: 4px;">●</span>
                                    <span>立即封鎖該對象並進行檢舉。</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>`;
            } else {
                // Show Low Risk Result (Safe)
                resultHTML = `
                <div class="result-content" style="padding: 24px; text-align: left;">
                    <div class="score-card">
                        <div class="score-info">
                            <i class="fa-solid fa-circle-check score-icon"></i>
                            <div class="score-text">
                                <h3>未發現明顯詐騙特徵</h3>
                                <p>風險等級：低風險</p>
                            </div>
                        </div>
                        <div class="score-value">
                            <div class="score-number">15<span style="font-size:14px; color:#94a3b8; font-weight:400;">/100</span></div>
                            <div class="score-label">詐騙指數</div>
                        </div>
                    </div>

                    <div class="stats-container">
                        <div class="stat-box">
                            <div class="stat-value">0 項</div>
                            <div class="stat-label">偵測異常數量</div>
                        </div>
                        <div class="stat-box">
                            <div class="stat-value">正常</div>
                            <div class="stat-label">風險模型類別</div>
                        </div>
                         <div class="stat-box">
                            <div class="stat-value">平穩</div>
                            <div class="stat-label">語氣急迫性</div>
                        </div>
                    </div>

                    <div class="report-section">
                        <div class="section-title"><i class="fa-solid fa-file-contract"></i> 分析摘要</div>
                        <p class="summary-text">
                            初步分析未發現常見的詐騙關鍵字或誘導模式。對話語氣平穩，內容屬於一般日常交流，無明顯的情緒勒索或緊急性金錢要求。雖然風險較低，但在網路交流中仍建議保持基本的警覺心。
                        </p>
                    </div>
                    
                    <div class="report-section">
                         <div class="section-title" style="color:#10b981;"><i class="fa-solid fa-shield-halved"></i> 建議採取行動</div>
                        <div class="action-suggestion">
                            <i class="fa-regular fa-lightbulb"></i>
                            <span>儘管目前評估風險較低，但若對方開始涉及金錢話題或索取個資，請重新進行分析或提高警覺。</span>
                        </div>
                    </div>
                </div>`;
            }

            chatAnalysisResult.innerHTML = resultHTML;
        }
    }
});
