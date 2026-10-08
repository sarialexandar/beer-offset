import { toPng } from 'html-to-image'
import { formatNumber, type Mode } from './calc'

export type ShareData = { tally: string; tokens: number; mode: Mode; stop: string }

const FALLBACK = 'Export failed. Take a screenshot, we believe in you.'
const FILE_NAME = 'beer-offset.png'

export function setupShare(button: HTMLButtonElement, card: HTMLElement) {
  let data: ShareData = { tally: 'no beer at all', tokens: 0, mode: 'naive', stop: 'Google' }
  const idleLabel = button.textContent ?? 'Share your impact'

  function renderCard() {
    const rosette = document.querySelector('#badge svg')?.outerHTML ?? ''
    const stamp = data.mode === 'honest' ? '<span class="stamp" aria-hidden="true">REVOKED</span>' : ''
    card.innerHTML = `
      <div class="card-badge">${rosette}${stamp}</div>
      <p class="card-brand">Beer Offset</p>
      <p class="card-tally">${data.tally}</p>
      <p class="card-verb">${data.mode === 'honest' ? 'I owe the GPUs' : 'I have offset'}</p>
      <p class="card-number">${formatNumber(data.tokens)} tokens</p>
      <p class="card-source">according to ${data.stop}</p>`
  }

  async function exportPng() {
    button.disabled = true
    button.textContent = 'Rendering…'
    try {
      // The live card is parked off-screen; the clone must render at the origin.
      const dataUrl = await toPng(card, {
        pixelRatio: 2, width: 1200, height: 630, cacheBust: true,
        style: { position: 'static', left: '0', top: '0' },
      })
      const blob = await (await fetch(dataUrl)).blob()
      const file = new File([blob], FILE_NAME, { type: 'image/png' })
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: 'Beer Offset' })
      } else {
        const a = document.createElement('a')
        a.href = dataUrl
        a.download = FILE_NAME
        a.click()
      }
      button.textContent = idleLabel
    } catch (err) {
      // User dismissed the native share sheet: not an error.
      if (err instanceof DOMException && err.name === 'AbortError') {
        button.textContent = idleLabel
        return
      }
      console.error('share export failed', err)
      button.textContent = FALLBACK
    } finally {
      button.disabled = false
    }
  }

  button.addEventListener('click', exportPng)
  renderCard()

  return {
    update(next: ShareData) {
      data = next
      renderCard()
    },
  }
}
