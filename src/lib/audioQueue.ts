export class AudioQueue {
  private nextStart = 0
  private active: AudioBufferSourceNode[] = []

  constructor(private ctx: AudioContext) {}

  push(buffer: AudioBuffer): void {
    const src = this.ctx.createBufferSource()
    src.buffer = buffer
    src.connect(this.ctx.destination)
    const t = Math.max(this.ctx.currentTime, this.nextStart)
    src.start(t)
    this.nextStart = t + buffer.duration
    this.active.push(src)
    src.onended = () => {
      const i = this.active.indexOf(src)
      if (i !== -1) this.active.splice(i, 1)
    }
  }

  flush(): void {
    this.active.forEach(s => { try { s.stop() } catch {} })
    this.active = []
    this.nextStart = this.ctx.currentTime
  }
}

export function b64ToAudioBuffer(b64: string, ctx: AudioContext): AudioBuffer {
  const bin = atob(b64)
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  const int16 = new Int16Array(bytes.buffer)
  const f32 = new Float32Array(int16.length)
  for (let i = 0; i < int16.length; i++) f32[i] = int16[i] / 32768
  const buf = ctx.createBuffer(1, f32.length, 24000)
  buf.copyToChannel(f32, 0)
  return buf
}
