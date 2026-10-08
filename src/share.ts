import { toBlob } from 'html-to-image'
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
      const blob = await toBlob(card, {
        pixelRatio: 2, width: 1200, height: 630,
        style: { position: 'static', left: '0', top: '0' },
      })
      if (!blob) throw new Error('toBlob returned null')
      const file = new File([blob], FILE_NAME, { type: 'image/png' })
      if (navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({ files: [file], title: 'Beer Offset' })
        } catch (err) {
          // The share sheet needs a user gesture that a slow render can outlive;
          // the PNG exists, so hand it over as a download instead.
          if (err instanceof DOMException && err.name === 'NotAllowedError') download(blob)
          else throw err
        }
      } else {
        download(blob)
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

  function download(blob: Blob) {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = FILE_NAME
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 10_000)
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
