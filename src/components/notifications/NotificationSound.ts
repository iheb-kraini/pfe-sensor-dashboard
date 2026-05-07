const audioCtx = new AudioContext();

export function playNotificationSound() {
  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(
    440,
    audioCtx.currentTime + 0.3,
  );

  gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);

  oscillator.start(audioCtx.currentTime);
  oscillator.stop(audioCtx.currentTime + 0.3);
}
