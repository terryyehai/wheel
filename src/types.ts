export type DrawMode = 'wheel' | 'gachapon' | 'scratch' | 'omikuji' | 'card' | 'red-envelope';

export interface ModeInfo {
    id: DrawMode;
    name: string;
    description: string;
    icon: string; // Emoji, SVG path, or Image URL/path
    color: string;
}

export const MODES: ModeInfo[] = [
    {
        id: 'wheel',
        name: '幸運轉盤',
        description: '經典轉盤，命運的輪迴',
        icon: '🎡',
        color: '#6c7bff',
    },
    {
        id: 'gachapon',
        name: '扭蛋機',
        description: '轉動旋鈕，驚喜掉落',
        icon: '💊',
        color: '#ff6b81',
    },
    {
        id: 'scratch',
        name: '刮刮樂',
        description: '動手刮開，即時揭曉',
        icon: '🎫',
        color: '#ffa502',
    },
    {
        id: 'omikuji',
        name: '開運抽籤',
        description: '虔誠搖晃，神明指引',
        icon: '⛩️',
        color: '#ff4757',
    },
    {
        id: 'card',
        name: '塔羅抽卡',
        description: '直覺選擇，翻轉命運',
        icon: '🃏',
        color: '#a78bfa',
    },
    {
        id: 'red-envelope',
        name: '紅包抽抽樂',
        description: '新春試手氣，好運龍總來',
        icon: '🧧',
        color: '#e60012',
    },
];
