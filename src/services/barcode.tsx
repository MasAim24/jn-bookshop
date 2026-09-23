import React from 'react';

// Code 128 Character Set B encoding patterns (widths of alternating bars & spaces)
// Index 0 to 105: 6 elements each (sum = 11 modules).
// Index 106 (Stop): 7 elements (sum = 13 modules).
const CODE128_PATTERNS: string[] = [
  "212222", "222122", "222221", "121223", "121322", "131222", "122213", "122312", "132212", "221213",
  "221312", "231212", "112232", "122132", "122231", "113222", "123122", "123221", "223211", "221132",
  "221231", "213212", "223112", "312131", "311222", "321122", "321221", "312212", "322112", "322211",
  "212123", "212321", "232121", "111323", "131123", "131321", "112313", "132113", "132311", "211313",
  "231113", "231311", "112133", "112331", "132131", "113123", "113321", "133121", "313121", "211331",
  "231131", "213113", "213311", "213131", "311123", "311321", "331121", "312113", "312311", "332111",
  "314111", "221411", "431111", "111224", "111422", "121124", "121421", "141122", "141221", "112214",
  "112412", "122114", "122411", "142112", "142211", "241211", "221114", "413111", "241112", "134111",
  "111242", "121142", "121241", "114212", "124112", "124211", "411212", "421112", "421211", "212141",
  "214121", "412121", "111143", "111341", "131141", "114113", "114311", "411113", "411311", "113141",
  "114131", "311141", "411131", "211412", "211214", "211232", "2331112"
];

const START_B_INDEX = 104;
const STOP_INDEX = 106;

export interface BarcodeBar {
  x: number;
  width: number;
}

export function encodeCode128B(text: string): { bars: BarcodeBar[]; totalWidth: number } {
  // Filter text to printable ASCII (32 - 126)
  const cleanText = text.split('').filter(c => {
    const code = c.charCodeAt(0);
    return code >= 32 && code <= 126;
  }).join('');

  if (cleanText.length === 0) {
    return { bars: [], totalWidth: 0 };
  }

  // Calculate Checksum: (START_B + sum(char_val * index)) % 103
  let checksum = START_B_INDEX;
  const sequence: number[] = [START_B_INDEX];

  for (let i = 0; i < cleanText.length; i++) {
    const charVal = cleanText.charCodeAt(i) - 32;
    sequence.push(charVal);
    checksum += charVal * (i + 1);
  }

  const checksumIndex = checksum % 103;
  sequence.push(checksumIndex);
  sequence.push(STOP_INDEX);

  // Convert pattern digits to bar rectangles (alternating bar, space)
  const bars: BarcodeBar[] = [];
  let currentX = 0;

  for (let i = 0; i < sequence.length; i++) {
    const pattern = CODE128_PATTERNS[sequence[i]];
    if (!pattern) continue;

    for (let p = 0; p < pattern.length; p++) {
      const width = parseInt(pattern[p], 10);
      const isBar = p % 2 === 0; // Even index = bar (black), Odd = space (white)

      if (isBar) {
        bars.push({
          x: currentX,
          width
        });
      }
      currentX += width;
    }
  }

  return { bars, totalWidth: currentX };
}

export interface BarcodeSvgProps {
  value: string;
  height?: number;
  barWidth?: number;
  className?: string;
  showText?: boolean;
  quietZone?: number;
}

export const BarcodeSvg: React.FC<BarcodeSvgProps> = ({
  value,
  height = 50,
  barWidth = 1.5,
  className = '',
  showText = true,
  quietZone = 10
}) => {
  const { bars, totalWidth } = encodeCode128B(value);

  if (bars.length === 0) {
    return (
      <div className={`flex items-center justify-center text-xs text-rose-500 ${className}`}>
        Barcode tidak valid
      </div>
    );
  }

  const svgWidth = (totalWidth + quietZone * 2) * barWidth;
  const svgHeight = height + (showText ? 16 : 0);

  return (
    <div className={`flex flex-col items-center select-none ${className}`}>
      <svg
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        width="100%"
        height="100%"
        style={{ maxHeight: svgHeight, maxWidth: '100%' }}
        xmlns="http://www.w3.org/2000/svg"
        className="block"
      >
        <rect width={svgWidth} height={svgHeight} fill="#ffffff" />
        <g transform={`translate(${quietZone * barWidth}, 0)`}>
          {bars.map((bar, idx) => (
            <rect
              key={idx}
              x={bar.x * barWidth}
              y={0}
              width={bar.width * barWidth}
              height={height}
              fill="#000000"
            />
          ))}
        </g>
        {showText && (
          <text
            x={svgWidth / 2}
            y={height + 12}
            textAnchor="middle"
            fill="#000000"
            fontFamily="monospace"
            fontSize="11"
            fontWeight="bold"
            letterSpacing="1"
          >
            {value}
          </text>
        )}
      </svg>
    </div>
  );
};
