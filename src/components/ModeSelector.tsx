import { MODES, type DrawMode } from '../types';

interface ModeSelectorProps {
    onSelect: (mode: DrawMode) => void;
}

export const ModeSelector: React.FC<ModeSelectorProps> = ({ onSelect }) => {
    return (
        <div className="mode-selector-container">
            <h2 className="mode-selector-title">選擇抽獎模式</h2>
            <div className="mode-grid">
                {MODES.map((mode) => (
                    <button
                        key={mode.id}
                        className="mode-card"
                        onClick={() => onSelect(mode.id)}
                        style={{ '--mode-color': mode.color } as React.CSSProperties}
                        aria-label={`選擇 ${mode.name}`}
                    >
                        <div className="mode-icon" aria-hidden="true">
                            {mode.icon}
                        </div>
                        <div className="mode-info">
                            <h3 className="mode-name">{mode.name}</h3>
                            <p className="mode-mid-desc">{mode.description}</p>
                        </div>
                        <div className="mode-arrow">→</div>
                    </button>
                ))}
            </div>
        </div>
    );
};
