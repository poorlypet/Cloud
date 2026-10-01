/* Motion: closed-form springs. Every value is a pure function of time.

   spring(dt, preset)       0 -> 1 step response of a damped spring, dt seconds after it starts.
   track(t, from, keys)     a value that is sent to several targets over time. Each key is
                            [startTime, target, preset]. The result is the sum of one spring
                            step per key (a linear system), so a retarget mid-flight is
                            continuous in position and velocity, and nothing is carried
                            between frames.

   Presets (natural frequency w in rad/s, damping ratio z):
     snappy   UI interactions: presses, ticks, selection     settles in about 0.2 s, ~0.2% overshoot
     default  cards and containers                           settles in about 0.35 s, ~2% overshoot
     heavy    major typography and the logo lockup           settles in about 0.5 s, no visible overshoot
*/
(function (root) {
  const PRESETS = {
    snappy: { w: 26, z: 0.88 },
    default: { w: 16, z: 0.78 },
    heavy: { w: 10, z: 0.94 },
  };

  function spring(dt, preset = 'default') {
    if (dt <= 0) return 0;
    const { w, z } = typeof preset === 'string' ? PRESETS[preset] : preset;
    if (z < 1) {
      const wd = w * Math.sqrt(1 - z * z);
      return 1 - Math.exp(-z * w * dt) * (Math.cos(wd * dt) + (z * w / wd) * Math.sin(wd * dt));
    }
    return 1 - Math.exp(-w * dt) * (1 + w * dt);
  }

  function track(t, from, keys) {
    let v = from, prev = from;
    for (const [kt, target, preset = 'default'] of keys) {
      v += (target - prev) * spring(t - kt, preset);
      prev = target;
    }
    return v;
  }

  // Blend two colours [r,g,b] by a spring-driven amount k.
  function mix(a, b, k) {
    return `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * k)).join(',')})`;
  }

  root.Motion = { PRESETS, spring, track, mix };
})(typeof window !== 'undefined' ? window : globalThis);
