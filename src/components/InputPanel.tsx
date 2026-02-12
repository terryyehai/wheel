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

import { useTranslation } from '../i18n/LanguageContext';

export const InputPanel: React.FC<InputPanelProps> = ({
    onItemsChange,
    isSpinning,
}) => {
    const { t } = useTranslation();
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

    const itemCount = parseItems(text).length;
    const isValid = itemCount >= MIN_ITEMS;
    const isOverLimit = itemCount > MAX_ITEMS;

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newText = e.target.value;
        setText(newText);
        onItemsChange(parseItems(newText));
    };

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
                aria-label={isCollapsed ? t('input.toggle_collapsed') : t('input.toggle_expanded')}
            >
                <span className="toggle-icon">{isCollapsed ? '▼' : '▲'}</span>
                <span className="toggle-label">
                    {isCollapsed ? `${t('input.title')} (${itemCount})` : t('input.toggle_expanded')}
                </span>
            </button>

            {!isCollapsed && !isSpinning && (
                <div className="panel-content">
                    <label className="input-label" htmlFor="items-input">
                        {t('input.label')}
                    </label>
                    <textarea
                        id="items-input"
                        className="items-textarea"
                        value={text}
                        onChange={handleChange}
                        placeholder={t('input.placeholder')}
                        rows={6}
                        spellCheck={false}
                    />
                    <div className="input-status">
                        {!isValid && (
                            <span className="status-warning">⚠ {t('input.at_least')}</span>
                        )}
                        {isOverLimit && (
                            <span className="status-warning">⚠ {t('input.max_limit')}</span>
                        )}
                        {isValid && !isOverLimit && (
                            <span className="status-ok">✓ {itemCount} {t('input.items_count')}</span>
                        )}
                    </div>

                    <div className="panel-actions" style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
                        <button
                            className="btn-secondary"
                            onClick={() => {
                                const input = document.createElement('input');
                                input.type = 'file';
                                input.accept = '.csv,.txt';
                                input.onchange = (e) => {
                                    const file = (e.target as HTMLInputElement).files?.[0];
                                    if (file) {
                                        const reader = new FileReader();
                                        reader.onload = (rev) => {
                                            const content = rev.target?.result as string;
                                            setText(content);
                                            onItemsChange(parseItems(content));
                                        };
                                        reader.readAsText(file);
                                    }
                                };
                                input.click();
                            }}
                            style={{ flex: 1, padding: '8px', fontSize: '0.8rem', borderRadius: '4px', border: '1px solid var(--glass-border)', background: 'var(--bg-tertiary)', color: 'var(--text-primary)', cursor: 'pointer' }}
                        >
                            📥 {t('input.import')}
                        </button>
                        <button
                            className="btn-secondary"
                            onClick={() => {
                                const blob = new Blob([text], { type: 'text/csv' });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = '抽獎清單.csv';
                                a.click();
                                URL.revokeObjectURL(url);
                            }}
                            style={{ flex: 1, padding: '8px', fontSize: '0.8rem', borderRadius: '4px', border: '1px solid var(--glass-border)', background: 'var(--bg-tertiary)', color: 'var(--text-primary)', cursor: 'pointer' }}
                        >
                            📤 {t('input.export')}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
