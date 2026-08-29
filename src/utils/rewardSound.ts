/**
 * rewardSound.ts
 * Gera um "sininho" suave via Web Audio API — sem arquivos externos.
 * Dois tons descendentes (Mi4 → Do4) com envelope suave, duração ~0,7s.
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  try {
    if (!audioCtx || audioCtx.state === "closed") {
      audioCtx = new AudioContext();
    }
    return audioCtx;
  } catch {
    return null;
  }
}

function playTone(
  ctx: AudioContext,
  frequency: number,
  startTime: number,
  duration: number,
  gainPeak: number
): void {
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(frequency, startTime);
  // Leve detune para soar mais orgânico
  oscillator.detune.setValueAtTime(2, startTime);

  // Envelope: ataque rápido → decaimento suave
  gainNode.gain.setValueAtTime(0, startTime);
  gainNode.gain.linearRampToValueAtTime(gainPeak, startTime + 0.02);
  gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

  oscillator.start(startTime);
  oscillator.stop(startTime + duration);
}

/**
 * Toca um som de recompensa suave.
 * Retorna silenciosamente se o AudioContext não estiver disponível.
 */
export async function playRewardSound(): Promise<void> {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    // Reativar contexto se suspenso (política de autoplay do browser)
    if (ctx.state === "suspended") {
      await ctx.resume();
    }

    const now = ctx.currentTime;

    // Tom 1: Mi4 (329.63 Hz)
    playTone(ctx, 329.63, now, 0.4, 0.25);

    // Tom 2: Do4 (261.63 Hz) — 200ms depois
    playTone(ctx, 261.63, now + 0.2, 0.5, 0.2);
  } catch {
    // Silencia qualquer erro (ex: browser sem suporte ou política de autoplay)
  }
}
