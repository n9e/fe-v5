const defaultFont = {
  fontWeight: 'normal',
  fontSize: '12px',
  fontFamily: 'PingFangSC-Regular, microsoft yahei ui, microsoft yahei, simsun, "sans-serif"',
};
const defaultFontStr = `${defaultFont.fontWeight} ${defaultFont.fontSize} ${defaultFont.fontFamily}`;

export default function getTextWidth(text: string, font = defaultFontStr) {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (context) {
    context.font = font;
    const metrics = context.measureText(text);
    return metrics.width;
  }
}

function getCssStyle(element: HTMLElement, prop: string) {
    return window.getComputedStyle(element, null).getPropertyValue(prop);
}

export function getCanvasFontSize(el = document.body) {
  const fontWeight = getCssStyle(el, 'font-weight') || defaultFont.fontWeight;
  const fontSize = getCssStyle(el, 'font-size') || defaultFont.fontSize;
  const fontFamily = getCssStyle(el, 'font-family') || defaultFont.fontFamily;
  
  return `${fontWeight} ${fontSize} ${fontFamily}`;
}
