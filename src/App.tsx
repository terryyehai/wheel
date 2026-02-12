import { useState, useCallback, useRef } from 'react';
import { InputPanel } from './components/InputPanel';
import { Wheel } from './components/Wheel';
import { ResultOverlay } from './components/ResultOverlay';

/**
 * 抽抽樂大轉盤 — 主應用程式
 *
 * 管理核心狀態：items、isSpinning、resultIndex。
 * 垂直佈局：Wheel → InputPanel → ResultOverlay。
 */
const App: React.FC = () => {
  const [items, setItems] = useState<string[]>(['選項 A', '選項 B', '選項 C', '選項 D']);
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  // 保存 Wheel 的 startSpin 以便「再抽一次」時調用
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

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">抽抽樂大轉盤</h1>
        <p className="app-subtitle">輸入項目，轉動命運</p>
      </header>

      <main className="app-main">
        <Wheel
          items={items}
          onResult={handleResult}
          onSpinningChange={handleSpinningChange}
          spinFnRef={spinFnRef}
        />

        <InputPanel
          onItemsChange={handleItemsChange}
          isSpinning={isSpinning}
        />
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
