import { MODES, type DrawMode } from '../types';
import { useTranslation } from '../i18n/LanguageContext';

interface ModeSelectorProps {
    onSelect: (mode: DrawMode) => void;
}

export const ModeSelector: React.FC<ModeSelectorProps> = ({ onSelect }) => {
    const { t } = useTranslation();

    return (
        <div className="mode-selector-container">
            {/* ... blobs ... */}
            <div className="blob-container">
                <div className="blob blob-1"></div>
                <div className="blob blob-2"></div>
                <div className="blob blob-3"></div>
            </div>
            {/* CNY Fallback Blobs */}
            <div className="cny-blob cny-blob-1"></div>
            <div className="cny-blob cny-blob-2"></div>
            <div className="cny-blob cny-blob-3"></div>
            <div className="cny-decoration">福</div>
            <div className="cny-decoration cny-decoration-right">祿</div>
            <h2 className="mode-selector-title">{t('selector.title')}</h2>
            <div className="mode-grid">
                {MODES.map((mode) => (
                    <button
                        key={mode.id}
                        className="mode-card"
                        onClick={() => onSelect(mode.id)}
                        style={{ '--mode-color': mode.color } as React.CSSProperties}
                        aria-label={`${t('selector.instruction')} ${t(`modes.${mode.id}.name`)}`}
                    >
                        <div className="mode-icon" aria-hidden="true">
                            {mode.icon.startsWith('/') || mode.icon.startsWith('http') ? (
                                <img src={mode.icon} alt="" className="icon-img" />
                            ) : (
                                mode.icon
                            )}
                        </div>
                        <div className="mode-info">
                            <h3 className="mode-name">{t(`modes.${mode.id}.name`)}</h3>
                            <p className="mode-mid-desc">{t(`modes.${mode.id}.description`)}</p>
                        </div>
                        <div className="mode-arrow">→</div>
                    </button>
                ))}
            </div>
        </div>
    );
};
