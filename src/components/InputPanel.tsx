import { useState, useCallback, useEffect } from 'react';

/**
 * 多行文字輸入面板
 *
 * 每行代表一個抽獎項目，即時解析並回傳 items 陣列。
 * 支援自動 trim、過濾空行、限制 2–50 筆。
 */

interface InputPanelProps {
    /** 更新項目列表 */
    onItemsChange: (items: string[]) => void;
    /** 是否正在抽獎（抽獎中隱藏輸入區） */
    isSpinning: boolean;
}

const MAX_ITEMS = 50;
const MIN_ITEMS = 2;

const DEFAULT_TEXT = '選項 A, 選項 B, 選項 C, 選項 D';

export const InputPanel: React.FC<InputPanelProps> = ({
    onItemsChange,
    isSpinning,
}) => {
    const [text, setText] = useState(DEFAULT_TEXT);
    const [isCollapsed, setIsCollapsed] = useState(false);

    /** 解析文字為項目陣列（支援換行或逗號分隔） */
    const parseItems = useCallback(
        (raw: string): string[] => {
            // 先用換行拆分，再對每行用逗號拆分，最後攤平
            const items = raw
                .split('\n')
                .flatMap((line) => line.split(','))
                .map((item) => item.trim())
                .filter((item) => item.length > 0);
            return items.slice(0, MAX_ITEMS);
        },
        []
    );

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newText = e.target.value;
        setText(newText);
        onItemsChange(parseItems(newText));
    };

    const itemCount = parseItems(text).length;
    const isValid = itemCount >= MIN_ITEMS;
    const isOverLimit = itemCount > MAX_ITEMS;

    // 初始化時觸發一次
    useEffect(() => {
        onItemsChange(parseItems(DEFAULT_TEXT));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className={`input-panel ${isCollapsed || isSpinning ? 'collapsed' : ''}`}>
            <button
                className="panel-toggle"
                onClick={() => setIsCollapsed(!isCollapsed)}
                aria-label={isCollapsed ? '展開設定' : '收起設定'}
            >
                <span className="toggle-icon">{isCollapsed ? '▼' : '▲'}</span>
                <span className="toggle-label">
                    {isCollapsed ? `抽獎項目 (${itemCount})` : '收起'}
                </span>
            </button>

            {!isCollapsed && !isSpinning && (
                <div className="panel-content">
                    <label className="input-label" htmlFor="items-input">
                        每行一個抽獎項目
                    </label>
                    <textarea
                        id="items-input"
                        className="items-textarea"
                        value={text}
                        onChange={handleChange}
                        placeholder={'請輸入抽獎項目\n用逗號或換行分隔\n例：A, B, C, D'}
                        rows={6}
                        spellCheck={false}
                    />
                    <div className="input-status">
                        {!isValid && (
                            <span className="status-warning">⚠ 至少需要 2 個項目</span>
                        )}
                        {isOverLimit && (
                            <span className="status-warning">⚠ 僅取前 {MAX_ITEMS} 個項目</span>
                        )}
                        {isValid && !isOverLimit && (
                            <span className="status-ok">✓ {itemCount} 個項目</span>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
