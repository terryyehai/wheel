import { useState, useRef, useEffect, useCallback } from 'react';
import { InputPanel } from './components/InputPanel';
import { ResultOverlay } from './components/ResultOverlay';
import { ModeSelector } from './components/ModeSelector';
import { WheelMode } from './components/modes/WheelMode';
import { ScratchMode } from './components/modes/ScratchMode';
import { GachaponMode } from './components/modes/GachaponMode';
import { CardMode } from './components/modes/CardMode';
import { OmikujiMode } from './components/modes/OmikujiMode';
import { RedEnvelopeMode } from './components/modes/RedEnvelopeMode';
import { HistoryPanel } from './components/HistoryPanel';
import { type DrawMode, MODES } from './types';
import { audio } from './utils/audio';

interface HistoryItem {
  id: string;
  item: string;
  mode: string;
  timestamp: number;
}

import { useTranslation } from './i18n/LanguageContext';
import { type Language } from './i18n/translations';

/**
 * 抽抽樂大轉盤 — 主應用程式
 *
 * 管理核心狀態：items、currentMode、isSpinning、resultIndex。
 * 支援多模組切換架構。
 */
const App: React.FC = () => {
  const { t, language, setLanguage } = useTranslation();
  const [items, setItems] = useState<string[]>(['選項 A', '選項 B', '選項 C', '選項 D']);
  const [currentMode, setCurrentMode] = useState<DrawMode | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [primaryColor, setPrimaryColor] = useState('#6c7bff');

  // 初始化音效與歷史紀錄
  useState(() => {
    const savedMute = localStorage.getItem('wheel-mute');
    if (savedMute === 'true') {
      audio.setMuted(true);
      setIsMuted(true);
    }
    const savedHistory = localStorage.getItem('wheel-history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Failed to parse history', e);
      }
    }
    const savedColor = localStorage.getItem('wheel-color');
    if (savedColor) setPrimaryColor(savedColor);
  });

  // 切換背景主題
  useEffect(() => {
    document.body.setAttribute('data-theme', currentMode || 'home');

    // 特別為「紅包」模式或無模式時啟用 CNY 主題 (作為備選方案)
    if (currentMode === 'red-envelope' || !currentMode) {
      document.body.classList.add('cny-theme');
    } else {
      document.body.classList.remove('cny-theme');
    }
  }, [currentMode]);

  const toggleSound = () => {
    const newState = audio.toggleMute();
    setIsMuted(newState);
    localStorage.setItem('wheel-mute', String(newState));
  };

  // 保存各模式的 spin 函數以便「再抽一次」時調用
  const spinFnRef = useRef<(() => void) | null>(null);

  const handleItemsChange = useCallback((newItems: string[]) => {
    setItems(newItems);
  }, []);

  const handleResult = useCallback((item: string, _index: number) => {
    setResult(item);
    if (currentMode) {
      const newItem: HistoryItem = {
        id: Math.random().toString(36).substr(2, 9),
        item,
        mode: currentMode,
        timestamp: Date.now(),
      };
      setHistory(prev => {
        const next = [newItem, ...prev].slice(0, 10);
        localStorage.setItem('wheel-history', JSON.stringify(next));
        return next;
      });
    }
  }, [currentMode]);

  const clearHistory = useCallback(() => {
    setHistory([]);
    localStorage.removeItem('wheel-history');
  }, []);

  const changeColor = (color: string) => {
    setPrimaryColor(color);
    localStorage.setItem('wheel-color', color);
  };

  const handleSpinningChange = useCallback((spinning: boolean) => {
    setIsSpinning(spinning);
  }, []);

  const handleCloseResult = useCallback(() => {
    setResult(null);
  }, []);

  /** 「再抽一次」：關閉結果後立即觸發新一輪 */
  const handleSpinAgain = useCallback(() => {
    setResult(null);
    // 使用 setTimeout 確保 overlay 完全卸載後再抽
    setTimeout(() => {
      spinFnRef.current?.();
    }, 50);
  }, []);

  const handleModeSelect = useCallback((mode: DrawMode) => {
    setCurrentMode(mode);
  }, []);

  const handleBackToHome = useCallback(() => {
    if (isSpinning) return;
    setCurrentMode(null);
  }, [isSpinning]);

  const currentModeInfo = currentMode ? MODES.find((m) => m.id === currentMode) : null;

  return (
    <div className="app">
      <header className="app-header" style={{ position: 'relative' }}>
        {/* Language Switcher */}
        <div className="language-selector" style={{ position: 'absolute', top: '10px', left: '10px', display: 'flex', gap: '5px', zIndex: 10 }}>
          {(['zh-TW', 'en', 'ja'] as Language[]).map(lang => (
            <button
              key={lang}
              onClick={() => setLanguage(lang)}
              style={{
                background: language === lang ? 'rgba(255,255,255,0.2)' : 'transparent',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#fff',
                fontSize: '0.7rem',
                padding: '2px 6px',
                borderRadius: '4px',
                cursor: 'pointer',
                opacity: language === lang ? 1 : 0.6,
                fontWeight: language === lang ? 'bold' : 'normal'
              }}
            >
              {lang === 'zh-TW' ? '繁' : lang.toUpperCase()}
            </button>
          ))}
          {/* Color Presets */}
          <div style={{ marginLeft: '10px', display: 'flex', gap: '4px' }}>
            {['#6c7bff', '#ff6b6b', '#4ade80', '#fbbf24', '#f472b6'].map(clr => (
              <div
                key={clr}
                onClick={() => changeColor(clr)}
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  background: clr,
                  cursor: 'pointer',
                  border: primaryColor === clr ? '1px solid #fff' : 'none'
                }}
              />
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {currentMode && (
            <button
              className="back-btn"
              onClick={handleBackToHome}
              aria-label={t('app.back')}
              disabled={isSpinning}
            >
              ←
            </button>
          )}
          <div>
            <h1 className="app-title">
              {currentModeInfo ? t(`modes.${currentMode}.name`) : t('app.title')}
            </h1>
            <p className="app-subtitle">
              {currentModeInfo ? t(`modes.${currentMode}.description`) : t('app.subtitle')}
            </p>
          </div>
        </div>

        <button
          onClick={toggleSound}
          style={{
            position: 'absolute',
            top: '50%',
            right: '0',
            transform: 'translateY(-50%)',
            background: 'transparent',
            border: 'none',
            fontSize: '1.2rem',
            cursor: 'pointer',
            opacity: 0.7,
            transition: 'opacity 0.2s',
            padding: '8px'
          }}
          title={isMuted ? t('app.sound_on') : t('app.sound_off')}
        >
          {isMuted ? '🔇' : '🔊'}
        </button>
      </header>

      <main className="app-main">
        {!currentMode ? (
          <div key="selector" className="main-content-wrapper">
            <ModeSelector onSelect={handleModeSelect} />
          </div>
        ) : (
          <div key={currentMode} className="main-content-wrapper">
            {/* 根據模式渲染對應組件 */}
            {currentMode === 'wheel' && (
              <WheelMode
                items={items}
                onResult={handleResult}
                onSpinningChange={handleSpinningChange}
                spinFnRef={spinFnRef}
              />
            )}

            {currentMode === 'scratch' && (
              <ScratchMode
                items={items}
                onResult={handleResult}
                onSpinningChange={handleSpinningChange}
                spinFnRef={spinFnRef}
              />
            )}

            {currentMode === 'gachapon' && (
              <GachaponMode
                items={items}
                onResult={handleResult}
                onSpinningChange={handleSpinningChange}
                spinFnRef={spinFnRef}
              />
            )}

            {currentMode === 'card' && (
              <CardMode
                items={items}
                onResult={handleResult}
                onSpinningChange={handleSpinningChange}
                spinFnRef={spinFnRef}
              />
            )}

            {currentMode === 'omikuji' && (
              <OmikujiMode
                items={items}
                onResult={handleResult}
                onSpinningChange={handleSpinningChange}
                spinFnRef={spinFnRef}
              />
            )}

            {currentMode === 'red-envelope' && (
              <RedEnvelopeMode
                items={items}
                onResult={handleResult}
                onSpinningChange={handleSpinningChange}
                spinFnRef={spinFnRef}
              />
            )}

            <InputPanel
              onItemsChange={handleItemsChange}
              isSpinning={isSpinning}
            />
          </div>
        )}
      </main>

      {result !== null && (
        <ResultOverlay
          result={result}
          onClose={handleCloseResult}
          onSpinAgain={handleSpinAgain}
        />
      )}

      <HistoryPanel
        history={history}
        onClear={clearHistory}
        isOpen={isHistoryOpen}
        onToggle={() => setIsHistoryOpen(!isHistoryOpen)}
      />

      <style dangerouslySetInnerHTML={{
        __html: `
        :root {
          --accent: ${primaryColor};
          --accent-glow: ${primaryColor}40;
          --accent-ring: ${primaryColor}80;
          --shadow-glow: 0 0 40px ${primaryColor}20;
        }
      `}} />
    </div>
  );
};

export default App;
