import React from 'react';
import { useTranslation } from '../i18n/LanguageContext';

interface HistoryItem {
    id: string;
    item: string;
    mode: string;
    timestamp: number;
}

interface HistoryPanelProps {
    history: HistoryItem[];
    onClear: () => void;
    isOpen: boolean;
    onToggle: () => void;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({ history, onClear, isOpen, onToggle }) => {
    const { t } = useTranslation();

    return (
        <div className={`history-panel ${isOpen ? 'open' : ''}`}>
            <button className="history-toggle" onClick={onToggle}>
                <span className="history-icon">📜</span>
                {history.length > 0 && <span className="history-badge">{history.length}</span>}
            </button>

            {isOpen && (
                <div className="history-content">
                    <div className="history-header">
                        <h3>{t('app.history_title') || '抽獎歷史'}</h3>
                        <button className="history-clear" onClick={onClear}>
                            {t('app.history_clear') || '清除'}
                        </button>
                    </div>
                    {history.length === 0 ? (
                        <div className="history-empty">{t('app.history_empty') || '尚無紀錄'}</div>
                    ) : (
                        <div className="history-list">
                            {history.map((item) => (
                                <div key={item.id} className="history-item">
                                    <div className="history-item-main">
                                        <span className="history-item-value">{item.item}</span>
                                        <span className="history-item-mode">{t(`modes.${item.mode}.name`)}</span>
                                    </div>
                                    <span className="history-item-time">
                                        {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
