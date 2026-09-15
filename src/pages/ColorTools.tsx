import { useState } from 'react';
import { Palette, Check } from 'lucide-react';

export function ColorToolsPage() {
  const [color, setColor] = useState('#6366f1');
  const [textColor, setTextColor] = useState('#ffffff');

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) } : null;
  };

  const rgbToHsl = (r: number, g: number, b: number) => {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (max + min) / 2;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }
    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
  };

  const rgb = hexToRgb(color);
  const hsl = rgb ? rgbToHsl(rgb.r, rgb.g, rgb.b) : null;

  // Contrast ratio calculation
  const getLuminance = (r: number, g: number, b: number) => {
    const [rs, gs, bs] = [r, g, b].map(c => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };

  const bgRgb = hexToRgb(color);
  const fgRgb = hexToRgb(textColor);
  let contrastRatio = 1;
  if (bgRgb && fgRgb) {
    const l1 = getLuminance(bgRgb.r, bgRgb.g, bgRgb.b);
    const l2 = getLuminance(fgRgb.r, fgRgb.g, fgRgb.b);
    contrastRatio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  }

  const wcagAA = contrastRatio >= 4.5;
  const wcagAAA = contrastRatio >= 7;
  const wcagAALarge = contrastRatio >= 3;

  return (
    <div className="max-w-2xl mx-auto pb-20 lg:pb-0">
      <h1 className="text-2xl font-bold mb-2">Color Tools</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-6">Color picker, format converter, and contrast checker.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Color Picker */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-sm font-semibold mb-3">Color Picker</h3>
          <div className="w-full h-32 rounded-lg mb-4 border border-gray-200 dark:border-gray-700" style={{ backgroundColor: color }} />
          <input type="color" value={color} onChange={e => setColor(e.target.value)} className="w-full h-10 rounded cursor-pointer mb-4" />
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">HEX:</span><code className="font-mono">{color}</code></div>
            {rgb && <div className="flex justify-between"><span className="text-gray-500">RGB:</span><code className="font-mono">rgb({rgb.r}, {rgb.g}, {rgb.b})</code></div>}
            {hsl && <div className="flex justify-between"><span className="text-gray-500">HSL:</span><code className="font-mono">hsl({hsl.h}, {hsl.s}%, {hsl.l}%)</code></div>}
          </div>
        </div>

        {/* Contrast Checker */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-sm font-semibold mb-3">Contrast Checker</h3>
          <div className="rounded-lg p-6 mb-4 border border-gray-200 dark:border-gray-700" style={{ backgroundColor: color }}>
            <p style={{ color: textColor }} className="text-xl font-bold">Sample Text</p>
            <p style={{ color: textColor }} className="text-sm">This is how your text looks on this background.</p>
          </div>
          <div className="space-y-2 mb-3">
            <div>
              <label className="text-xs text-gray-500 block mb-1">Background</label>
              <input type="color" value={color} onChange={e => setColor(e.target.value)} className="w-full h-8 rounded cursor-pointer" />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Text Color</label>
              <input type="color" value={textColor} onChange={e => setTextColor(e.target.value)} className="w-full h-8 rounded cursor-pointer" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium">Contrast Ratio: {contrastRatio.toFixed(2)}:1</p>
            <div className="flex items-center gap-2"><span className={`w-4 h-4 rounded-full flex items-center justify-center ${wcagAAA ? 'bg-green-500' : 'bg-red-500'}`}>{wcagAAA && <Check size={10} className="text-white" />}</span><span className="text-xs">WCAG AAA (7:1)</span></div>
            <div className="flex items-center gap-2"><span className={`w-4 h-4 rounded-full flex items-center justify-center ${wcagAA ? 'bg-green-500' : 'bg-red-500'}`}>{wcagAA && <Check size={10} className="text-white" />}</span><span className="text-xs">WCAG AA (4.5:1)</span></div>
            <div className="flex items-center gap-2"><span className={`w-4 h-4 rounded-full flex items-center justify-center ${wcagAALarge ? 'bg-green-500' : 'bg-red-500'}`}>{wcagAALarge && <Check size={10} className="text-white" />}</span><span className="text-xs">WCAG AA Large (3:1)</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
