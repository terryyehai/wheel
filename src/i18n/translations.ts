export type Language = 'zh-TW' | 'en' | 'ja';

export const translations = {
    'zh-TW': {
        app: {
            title: '福緣試煉場',
            subtitle: '選擇一種玩法，轉動你的命運',
            back: '返回首頁',
            sound_on: '開啟音效',
            sound_off: '靜音',
            history_title: '最近中獎紀錄',
            history_clear: '清除歷史',
            history_empty: '尚無抽獎紀錄'
        },
        selector: {
            title: '選擇抽獎模式',
            instruction: '選擇一個模式開始'
        },
        input: {
            title: '編輯選項',
            placeholder: '請輸入選項 (每行一個)',
            add: '新增選項',
            clear: '清單清空',
            import: '匯入文字/CSV',
            export: '匯出清單',
            spinning_hint: '抽獎進行中，暫時無法編輯',
            items_count: '個項目',
            at_least: '至少需要 2 個項目',
            max_limit: '僅取前 50 個項目',
            label: '每行一個抽獎項目',
            toggle_expanded: '展開設定',
            toggle_collapsed: '收起設定'
        },
        overlay: {
            congrats: '恭喜獲得',
            spin_again: '再抽一次',
            close: '點擊關閉'
        },
        modes: {
            wheel: {
                name: '幸運轉盤',
                description: '經典轉盤，命運的輪迴',
                spin: '開始轉動！'
            },
            scratch: {
                name: '刮刮樂',
                description: '刮出驚喜，指尖的幸運',
                instruction: '請在下方區塊進行刮除',
                start_btn: '領取刮刮卡'
            },
            gachapon: {
                name: '扭蛋機',
                description: '轉動旋鈕，收集小確幸',
                instruction: '點擊旋鈕開啟'
            },
            card: {
                name: '塔羅抽卡',
                description: '神秘牌陣，預見未來',
                instruction: '點擊開始洗牌',
                choose: '請憑直覺選一張牌'
            },
            omikuji: {
                name: '開運抽籤',
                description: '虔誠搖晃，尋求指引',
                instruction: '點擊籤筒求籤'
            },
            'red-envelope': {
                name: '紅包抽獎',
                description: '新春賀歲，開門紅大吉',
                instruction: '請選擇一個紅包'
            }
        }
    },
    'en': {
        app: {
            title: 'Fortune Trial Ground',
            subtitle: 'Choose a game and spin your fate',
            back: 'Back to Home',
            sound_on: 'Sound On',
            sound_off: 'Mute',
            history_title: 'Recent Results',
            history_clear: 'Clear',
            history_empty: 'No history yet'
        },
        selector: {
            title: 'Select Game Mode',
            instruction: 'Pick a mode to start'
        },
        input: {
            title: 'Edit Items',
            placeholder: 'Enter items (one per line)',
            add: 'Add Item',
            clear: 'Clear List',
            import: 'Import CSV',
            export: 'Export',
            spinning_hint: 'Spinning... Editing disabled',
            items_count: 'items',
            at_least: 'At least 2 items required',
            max_limit: 'Up to 50 items allowed',
            label: 'One item per line',
            toggle_expanded: 'Expand Settings',
            toggle_collapsed: 'Collapse Settings'
        },
        overlay: {
            congrats: 'Congratulations!',
            spin_again: 'Spin Again',
            close: 'Click to close'
        },
        modes: {
            wheel: {
                name: 'Lucky Wheel',
                description: 'Classic wheel, the cycle of fate',
                spin: 'Spin!'
            },
            scratch: {
                name: 'Scratch Card',
                description: 'Scratch for surprises, luck at your fingertips',
                instruction: 'Scratch in the area below',
                start_btn: 'Get Scratch Card'
            },
            gachapon: {
                name: 'Gachapon',
                description: 'Turn the knob, collect small joys',
                instruction: 'Tap the knob to spin'
            },
            card: {
                name: 'Tarot Draw',
                description: 'Mysterious spread, foreseeing the future',
                instruction: 'Tap to shuffle',
                choose: 'Trust your intuition and pick a card'
            },
            omikuji: {
                name: 'Fortune Slip',
                description: 'Shake with reverence, seek guidance',
                instruction: 'Tap to shake'
            },
            'red-envelope': {
                name: 'Red Envelope Draw',
                description: 'Lunar New Year, good luck from the start',
                instruction: 'Please select a red envelope'
            }
        }
    },
    'ja': {
        app: {
            title: '福縁試練場',
            subtitle: 'モードを選んで、運命を回そう',
            back: 'ホームに戻る',
            sound_on: '音声をオン',
            sound_off: 'ミュート',
            history_title: '最近の結果',
            history_clear: 'クリア',
            history_empty: '履歴はありません'
        },
        selector: {
            title: 'モード選択',
            instruction: '開始するモードを選択してください'
        },
        input: {
            title: '項目編集',
            placeholder: '項目を入力（一行に一つ）',
            add: '追加',
            clear: 'クリア',
            import: 'CSVインポート',
            export: 'エクスポート',
            spinning_hint: '実行中... 編集不可',
            items_count: '個の項目',
            at_least: '少なくとも 2 つの項目が必要です',
            max_limit: '最初の 50 項目のみ',
            label: '一行に一つの項目',
            toggle_expanded: '設定を展開',
            toggle_collapsed: '設定を閉じる'
        },
        overlay: {
            congrats: 'おめでとうございます！',
            spin_again: 'もう一度回す',
            close: 'クリックして閉じる'
        },
        modes: {
            wheel: {
                name: 'ラッキーホイール',
                description: 'クラシックホイール、運命の輪',
                spin: '回す！'
            },
            scratch: {
                name: 'スクラッチカード',
                description: '驚きを削り出す、指先の幸運',
                instruction: '下のエリアを削ってください',
                start_btn: 'カードを受け取る'
            },
            gachapon: {
                name: 'ガチャポン',
                description: 'ノブを回して、小さな幸せを集めよう',
                instruction: 'ノブをタップして回してください'
            },
            card: {
                name: 'タロットカード',
                description: '神秘的な配置、未来を予見する',
                instruction: 'タップしてシャッフル',
                choose: '直感を信じてカードを1枚選んでください'
            },
            omikuji: {
                name: 'おみくじ',
                description: '敬虔に振って、導きを求めよ',
                instruction: '筒をタップして振る'
            },
            'red-envelope': {
                name: 'お年玉',
                description: '旧正月、最初から幸運を',
                instruction: 'お年玉を1つ選択してください'
            }
        }
    }
};
