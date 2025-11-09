import type { API } from '@editorjs/editorjs';

type TextColorConfig = {
  colors?: string[];
  defaultColor?: string;
};

type SavedSelection = ReturnType<API['selection']['save']> | null;

export default class TextColorTool {
  static get isInline() {
    return true;
  }

  static get shortcut() {
    return 'CMD+SHIFT+C';
  }

  static get title() {
    return '글자색';
  }

  private api: API;

  private button: HTMLButtonElement | null = null;

  private picker: HTMLDivElement | null = null;

  private colors: string[];

  private defaultColor: string;

  private savedSelection: SavedSelection = null;

  private handleOutsideClick: (event: MouseEvent) => void;

  constructor({ api, config }: { api: API; config?: TextColorConfig }) {
    this.api = api;
    this.colors = config?.colors ?? ['#111827', '#4b5563', '#ef4444', '#f97316', '#22c55e', '#0ea5e9', '#6366f1', '#a855f7', '#facc15'];
    this.defaultColor = config?.defaultColor ?? '#111827';
    this.handleOutsideClick = this.handleClickOutside.bind(this);
  }

  render() {
    this.button = document.createElement('button');
    this.button.type = 'button';
    this.button.classList.add(this.api.styles.inlineToolButton);
    this.button.innerHTML = '<span class="block h-3 w-3 rounded-full" style="background-color: #111827;"></span>';
    this.button.addEventListener('click', () => this.togglePicker());
    return this.button;
  }

  surround(): void {
    this.togglePicker();
  }

  checkState(): void {
    if (!this.button) {
      return;
    }

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      this.setButtonActive(false);
      return;
    }

    const anchorNode = selection.anchorNode as HTMLElement | null;
    const element = anchorNode?.nodeType === Node.TEXT_NODE ? anchorNode.parentElement : anchorNode;

    if (!element) {
      this.setButtonActive(false);
      return;
    }

    const computedColor = window.getComputedStyle(element).color;
    const normalized = this.normalizeColor(computedColor);

    const isActive = normalized !== this.normalizeColor(this.defaultColor);
    this.setButtonActive(isActive);
    this.updateIndicator(normalized);
  }

  renderActions() {
    return null;
  }

  destroy() {
    this.removePicker();
  }

  private togglePicker() {
    if (this.picker) {
      this.removePicker();
      return;
    }

    this.savedSelection = this.api.selection.save();

    this.picker = document.createElement('div');
    this.picker.className = 'editorjs-text-color-picker';
    this.picker.style.position = 'absolute';
    this.picker.style.zIndex = '9999';
    this.picker.style.padding = '8px';
    this.picker.style.borderRadius = '8px';
    this.picker.style.border = '1px solid rgba(0,0,0,0.08)';
    this.picker.style.background = '#ffffff';
    this.picker.style.boxShadow = '0 8px 16px rgba(15,23,42,0.12)';
    this.picker.style.display = 'grid';
    this.picker.style.gridTemplateColumns = 'repeat(5, 1fr)';
    this.picker.style.gap = '6px';

    this.colors.forEach(color => {
      const colorButton = document.createElement('button');
      colorButton.type = 'button';
      colorButton.style.width = '28px';
      colorButton.style.height = '28px';
      colorButton.style.borderRadius = '9999px';
      colorButton.style.border = '1px solid rgba(15,23,42,0.15)';
      colorButton.style.background = color;
      colorButton.style.cursor = 'pointer';
      colorButton.addEventListener('click', () => this.applyColor(color));
      this.picker!.appendChild(colorButton);
    });

    const resetButton = document.createElement('button');
    resetButton.type = 'button';
    resetButton.textContent = '기본색';
    resetButton.style.gridColumn = 'span 5';
    resetButton.style.fontSize = '12px';
    resetButton.style.padding = '6px 8px';
    resetButton.style.borderRadius = '6px';
    resetButton.style.border = '1px solid rgba(15,23,42,0.15)';
    resetButton.style.background = '#f9fafb';
    resetButton.style.cursor = 'pointer';
    resetButton.addEventListener('click', () => this.applyColor(this.defaultColor));
    this.picker.appendChild(resetButton);

    document.body.appendChild(this.picker);

    const buttonRect = this.button?.getBoundingClientRect();
    if (buttonRect) {
      this.picker.style.left = `${buttonRect.left + window.scrollX}px`;
      this.picker.style.top = `${buttonRect.bottom + 8 + window.scrollY}px`;
    }

    setTimeout(() => document.addEventListener('mousedown', this.handleOutsideClick));
  }

  private applyColor(color: string) {
    if (this.savedSelection) {
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(this.savedSelection);
      }
      this.savedSelection = null;
    } else {
      this.api.selection.restore();
    }

    document.execCommand('styleWithCSS', false, 'true');
    document.execCommand('foreColor', false, color);
    document.execCommand('styleWithCSS', false, 'false');

    this.api.selection.save();
    this.api.selection.restore();

    this.updateIndicator(color);
    this.api.inlineToolbar.close();
    this.removePicker();
  }

  private removePicker() {
    if (this.picker) {
      document.body.removeChild(this.picker);
      this.picker = null;
      document.removeEventListener('mousedown', this.handleOutsideClick);
    }
  }

  private handleClickOutside(event: MouseEvent) {
    if (!this.picker || !this.button) {
      return;
    }

    const target = event.target as Node | null;
    if (target && (this.picker.contains(target) || this.button.contains(target))) {
      return;
    }

    this.removePicker();
  }

  private setButtonActive(isActive: boolean) {
    if (!this.button) {
      return;
    }

    this.button.classList.toggle(this.api.styles.inlineToolButtonActive, isActive);
  }

  private updateIndicator(color: string) {
    if (!this.button) {
      return;
    }

    const indicator = this.button.querySelector('span');
    if (indicator instanceof HTMLElement) {
      indicator.style.backgroundColor = color || this.defaultColor;
    }
  }

  private normalizeColor(color: string): string {
    if (!color) {
      return this.defaultColor;
    }

    if (color.startsWith('rgb')) {
      const values = color.replace(/[rgba()\s]/g, '').split(',')
        .map(channel => Number(channel) || 0)
        .slice(0, 3);
      const hex = values
        .map(channel => channel.toString(16).padStart(2, '0'))
        .join('');
      return `#${hex}`;
    }

    return color;
  }
}

