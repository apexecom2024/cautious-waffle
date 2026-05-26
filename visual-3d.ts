/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {LitElement, css, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {Analyser} from './analyser';

function clamp(v: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, v));
}

@customElement('gdm-live-audio-visuals-3d')
export class GdmLiveAudioVisuals3D extends LitElement {
  private inputAnalyser!: Analyser;
  private outputAnalyser!: Analyser;

  private _outputNode!: AudioNode;

  @property()
  set outputNode(node: AudioNode) {
    this._outputNode = node;
    this.outputAnalyser = new Analyser(this._outputNode);
  }

  get outputNode() {
    return this._outputNode;
  }

  private _inputNode!: AudioNode;

  @property()
  set inputNode(node: AudioNode) {
    this._inputNode = node;
    this.inputAnalyser = new Analyser(this._inputNode);
  }

  get inputNode() {
    return this._inputNode;
  }

  static styles = css`
    :host {
      display: flex;
      justify-content: center;
      align-items: center;
      flex: 1;
      width: 100%;
      height: 100%;
    }

    .pluto-orb {
      width: 260px;
      height: 260px;
      border-radius: 50%;
      overflow: hidden;
      border: 1px solid rgba(232, 201, 184, 0.35);
      position: relative;
      flex-shrink: 0;
    }

    .pluto-surface {
      position: absolute;
      inset: 0;
      border-radius: 50%;
    }

    .wave-layer {
      position: absolute;
      inset: 0;
      border-radius: 50%;
      transition: background 0.08s ease;
    }

    .wave-layer:nth-child(2) {
      animation: waveDrift1 8s ease-in-out infinite;
    }

    .wave-layer:nth-child(3) {
      animation: waveDrift2 11s ease-in-out infinite;
    }

    .wave-layer:nth-child(4) {
      animation: waveDrift3 14s ease-in-out infinite;
    }

    @keyframes waveDrift1 {
      0%   { transform: translate(0%, 0%) scale(1); }
      33%  { transform: translate(4%, -3%) scale(1.04); }
      66%  { transform: translate(-3%, 4%) scale(0.97); }
      100% { transform: translate(0%, 0%) scale(1); }
    }

    @keyframes waveDrift2 {
      0%   { transform: translate(0%, 0%) scale(1); }
      33%  { transform: translate(-5%, 2%) scale(0.96); }
      66%  { transform: translate(3%, -5%) scale(1.03); }
      100% { transform: translate(0%, 0%) scale(1); }
    }

    @keyframes waveDrift3 {
      0%   { transform: translate(0%, 0%) scale(1); }
      50%  { transform: translate(2%, 3%) scale(1.02); }
      100% { transform: translate(0%, 0%) scale(1); }
    }
  `;

  private surfaceEl!: HTMLElement;
  private waveEls!: NodeListOf<HTMLElement>;

  private audioT = 0;

  firstUpdated() {
    this.surfaceEl = this.shadowRoot!.querySelector('.pluto-surface') as HTMLElement;
    this.waveEls = this.shadowRoot!.querySelectorAll('.wave-layer') as NodeListOf<HTMLElement>;
    this.animate();
  }

  private animate() {
    requestAnimationFrame(() => this.animate());

    if (!this.inputAnalyser || !this.outputAnalyser || !this.surfaceEl || !this.waveEls.length) return;

    this.inputAnalyser.update();
    this.outputAnalyser.update();

    const o = this.outputAnalyser.data;
    const i = this.inputAnalyser.data;

    const oLow = (o[0] + o[1]) / 2 / 255;
    const oMid = (o[2] + o[3] + o[4]) / 3 / 255;
    const oHigh = (o[5] + o[6] + o[7]) / 3 / 255;

    const iLow = (i[0] + i[1]) / 2 / 255;
    const iMid = (i[2] + i[3]) / 2 / 255;
    const iHigh = (i[5] + i[6] + i[7]) / 3 / 255;

    const hue = (oLow * 30 + oMid * 200 + oHigh * 300) % 360;
    const sat = 50 + oMid * 40;
    const light = 55 + oLow * 25;

    const energy = clamp((oLow + oMid + oHigh) * 0.7);
    const micEnergy = clamp((iLow + iMid + iHigh) * 0.7);
    const totalEnergy = clamp(energy + micEnergy * 0.5);

    const speed = 1 + totalEnergy * 1.5;
    const dur1 = Math.max(3, 8 / speed);
    const dur2 = Math.max(4, 11 / speed);
    const dur3 = Math.max(5, 14 / speed);

    this.waveEls[0].style.animationDuration = `${dur1.toFixed(1)}s`;
    this.waveEls[1].style.animationDuration = `${dur2.toFixed(1)}s`;
    this.waveEls[2].style.animationDuration = `${dur3.toFixed(1)}s`;

    const opacity1 = clamp(0.35 + oLow * 0.5 + iLow * 0.2);
    const opacity2 = clamp(0.25 + oMid * 0.4 + iMid * 0.2);
    const opacity3 = clamp(0.15 + oHigh * 0.3 + iHigh * 0.15);

    this.waveEls[0].style.background = `radial-gradient(circle at 50% 50%, hsla(${hue}, ${sat + 10}%, ${light + 5}%, ${opacity1}) 0%, rgba(0,0,0,0) 50%)`;
    this.waveEls[1].style.background = `radial-gradient(circle at 50% 50%, hsla(${(hue + 60) % 360}, ${sat + 20}%, ${light + 15}%, ${opacity2}) 0%, rgba(0,0,0,0) 50%)`;
    this.waveEls[2].style.background = `radial-gradient(circle at 50% 50%, hsla(${(hue + 180) % 360}, ${sat + 30}%, ${light + 25}%, ${opacity3}) 0%, rgba(0,0,0,0) 50%)`;

    this.surfaceEl.style.background = `
      radial-gradient(circle at 30% 30%, #f5e0d3 0%, #d4a88a 35%, #a07050 70%, #2a1b14 100%)
    `;

    this.surfaceEl.style.boxShadow = `
      inset -25px -25px 50px rgba(0, 0, 0, 0.8),
      inset 15px 15px 30px rgba(255, 255, 255, 0.2)
    `;

    const scale = 1 + totalEnergy * 0.025;
    const glowAlpha = clamp(0.2 + totalEnergy * 0.5);

    this.style.setProperty(
      '--orb-glow',
      `0 0 80px 20px rgba(232, 201, 184, ${glowAlpha}),
       0 0 140px 40px rgba(${Math.round(80 + oLow * 150 + iLow * 80)}, ${Math.round(60 + oMid * 130 + iMid * 60)}, ${Math.round(100 + oHigh * 140 + iHigh * 60)}, ${clamp(0.05 + totalEnergy * 0.2)})`
    );

    this.style.setProperty('--orb-scale', String(scale));
  }

  protected render() {
    return html`
      <div class="pluto-orb" style="box-shadow: var(--orb-glow, 0 0 80px 20px rgba(232, 201, 184, 0.35)); transform: scale(var(--orb-scale, 1))">
        <div class="pluto-surface"></div>
        <div class="wave-layer"></div>
        <div class="wave-layer"></div>
        <div class="wave-layer"></div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'gdm-live-audio-visuals-3d': GdmLiveAudioVisuals3D;
  }
}
