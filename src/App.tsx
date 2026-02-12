import { useState, useRef, useEffect, useCallback } from 'react';
import { InputPanel } from './components/InputPanel';
import { ResultOverlay } from './components/ResultOverlay';
import { ModeSelector } from './components/ModeSelector';
import { WheelMode } from './components/modes/WheelMode';
import { ScratchMode } from './components/modes/ScratchMode';
import { GachaponMode } from './components/modes/GachaponMode';
import { CardMode } from './components/modes/CardMode';
import { OmikujiMode } from './components/modes/OmikujiMode';
import { type DrawMode, MODES } from './types';
import { audio } from './utils/audio';

/**
 * 抽抽樂大轉盤 — 主應用程式
 *
 * 管理核心狀態：items、currentMode、isSpinning、resultIndex。
 * 支援多模組切換架構。
 */
const App: React.FC = () => {
  const [items, setItems] = useState<string[]>(['選項 A', '選項 B', '選項 C', '選項 D']);
  const [currentMode, setCurrentMode] = useState<DrawMode | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);

  // 初始化音效設定
  useState(() => {
    const saved = localStorage.getItem('wheel-mute');
    if (saved === 'true') {
      audio.setMuted(true);
      setIsMuted(true);
    }
  });

  // 切換背景主題
  useEffect(() => {
    document.body.setAttribute('data-theme', currentMode || 'home');
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
  }, []);

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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {currentMode && (
            <button
              className="back-btn"
              onClick={handleBackToHome}
              aria-label="返回首頁"
              disabled={isSpinning}
            >
              ←
            </button>
          )}
          <div>
            <h1 className="app-title">
              {currentModeInfo ? currentModeInfo.name : '抽抽樂大轉盤'}
            </h1>
            <p className="app-subtitle">
              {currentModeInfo ? currentModeInfo.description : '選擇一種玩法，轉動你的命運'}
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
          title={isMuted ? "開啟音效" : "靜音"}
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
    </div>
  );
};

export default App;
