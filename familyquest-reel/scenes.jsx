// FamilyQuest Demo Video — scenes
// 1080x1920 (9:16)  — 35s  — monochrome brand palette + orange accent

// ── Brand tokens ───────────────────────────────────────────────────────────
const BRAND = {
  bg: '#fbf7ef',          // warm cream (was dark)
  bgSoft: '#f1e9d8',
  border: '#e4d9c2',
  card: '#ffffff',
  text: '#1a1510',        // warm near-black
  sub: '#6b5f4e',
  orange: '#d4892a',      // primary accent (eltern)
  blue: '#0ea5e9',        // child color
  green: '#22c55e',       // done / reward
  red: '#ef4444',         // limit / danger
  yellow: '#f59e0b',      // money / gold
  purple: '#8b5cf6',      // challenges

  // Aliases for already-light scenes
  light: '#fbf7ef',
  lightSoft: '#f1e9d8',
  lightText: '#1a1510',
  lightSub: '#6b5f4e',
  woodBrown: '#8b5a2b',
  woodDark: '#4a3218',
  steel: '#5c6672',
};

const FONT = "'Helvetica Neue', Helvetica, Arial, 'Nimbus Sans', sans-serif";

// ── Scene wrapper: shifts timeline so inner Sprites are scene-relative ─────
function Scene({ start, end, children }) {
  const { time, duration, playing, setTime, setPlaying } = useTimeline();
  if (time < start || time > end) return null;
  const shifted = {
    time: time - start,
    duration: end - start,
    playing, setTime, setPlaying,
  };
  return (
    <TimelineContext.Provider value={shifted}>
      {children}
    </TimelineContext.Provider>
  );
}

// ── shared primitives ──────────────────────────────────────────────────────

function Phone({ x, y, width = 520, height = 1060, rotate = 0, scale = 1, children, screen = BRAND.bg }) {
  return (
    <div style={{
      position: 'absolute', left: x, top: y,
      width, height,
      transform: `translate(-50%,-50%) rotate(${rotate}deg) scale(${scale})`,
      borderRadius: 64,
      background: '#000',
      padding: 14,
      boxShadow: '0 40px 80px rgba(0,0,0,0.6), inset 0 0 0 2px #1a1a1a',
    }}>
      <div style={{
        width: '100%', height: '100%',
        background: screen,
        borderRadius: 52,
        overflow: 'hidden',
        position: 'relative',
      }}>
        {/* notch */}
        <div style={{
          position: 'absolute', top: 12, left: '50%',
          transform: 'translateX(-50%)',
          width: 120, height: 30,
          background: '#000', borderRadius: 16, zIndex: 10,
        }}/>
        {/* status bar */}
        <div style={{
          position: 'absolute', top: 14, left: 0, right: 0,
          display: 'flex', justifyContent: 'space-between',
          padding: '0 36px', zIndex: 9,
          fontFamily: FONT, color: '#fff', fontSize: 16, fontWeight: 600,
        }}>
          <span>9:41</span>
          <span>􀛨 􀋊 100%</span>
        </div>
        <div style={{ position: 'absolute', inset: 0, paddingTop: 60 }}>
          {children}
        </div>
      </div>
    </div>
  );
}

function Caption({ top = 120, text, small, align = 'center' }) {
  const { localTime, duration } = useSprite();
  const entryDur = 0.45, exitDur = 0.35;
  const exitStart = Math.max(0, duration - exitDur);
  let op = 1, ty = 0;
  if (localTime < entryDur) {
    const t = Easing.easeOutCubic(clamp(localTime / entryDur, 0, 1));
    op = t; ty = (1 - t) * 24;
  } else if (localTime > exitStart) {
    const t = Easing.easeInCubic(clamp((localTime - exitStart) / exitDur, 0, 1));
    op = 1 - t; ty = -t * 16;
  }
  return (
    <div style={{
      position: 'absolute', top, left: 0, right: 0,
      padding: '0 60px',
      textAlign: align,
      opacity: op,
      transform: `translateY(${ty}px)`,
      zIndex: 20,
    }}>
      {!small && (
        <div style={{
          fontFamily: FONT, color: BRAND.text,
          fontSize: 84, fontWeight: 900,
          lineHeight: 1.02, letterSpacing: '-0.03em',
          textWrap: 'balance',
        }}>{text}</div>
      )}
      {small && (
        <div style={{
          fontFamily: FONT, color: BRAND.sub,
          fontSize: 30, fontWeight: 600,
          lineHeight: 1.3, letterSpacing: '0.01em',
          textTransform: 'uppercase',
          marginBottom: 18,
        }}>{small}</div>
      )}
    </div>
  );
}

function BigLine({ top, text, color = BRAND.text, size = 96, weight = 900 }) {
  const { localTime, duration } = useSprite();
  const entryDur = 0.5, exitDur = 0.35;
  const exitStart = Math.max(0, duration - exitDur);
  let op = 1, ty = 0;
  if (localTime < entryDur) {
    const t = Easing.easeOutCubic(clamp(localTime / entryDur, 0, 1));
    op = t; ty = (1 - t) * 30;
  } else if (localTime > exitStart) {
    const t = Easing.easeInCubic(clamp((localTime - exitStart) / exitDur, 0, 1));
    op = 1 - t; ty = -t * 20;
  }
  return (
    <div style={{
      position: 'absolute', top, left: 60, right: 60,
      textAlign: 'center',
      opacity: op, transform: `translateY(${ty}px)`,
      fontFamily: FONT, color,
      fontSize: size, fontWeight: weight,
      lineHeight: 1.02, letterSpacing: '-0.035em',
      zIndex: 20,
    }}>{text}</div>
  );
}

// ── SCENE 1 — HOOK (0–3.8s) ────────────────────────────────────────────────
// "Zu viel Bildschirmzeit?"  screen-time counter ticks up

function SceneHook() {
  // Scene wrapper provides shifted timeline; read it directly
  const { time: localTime, duration } = useTimeline();
  const progress = duration > 0 ? clamp(localTime / duration, 0, 1) : 0;
  // Accelerating ramp: number slow at first, explodes upward at the end
  const accel = Math.pow(progress, 2.4);
  const minutes = Math.floor(interpolate([0, 1], [0, 187])(accel));
  // Explosion trigger near the end of the hook
  const explode = clamp((localTime - 3.6) / 0.7, 0, 1);

  return (
    <>
      {/* warm cream background (app light theme) */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(circle at 50% 30%, #fff8e8, ${BRAND.light} 70%)`,
      }}/>

      <Sprite start={0} end={4.5}>
        <div style={{
          position: 'absolute', top: 120, left: 0, right: 0,
          textAlign: 'center',
          fontFamily: FONT, color: BRAND.lightSub,
          fontSize: 36, fontWeight: 800, letterSpacing: '0.35em',
        }}>HEUTE</div>
      </Sprite>

      <Sprite start={0.1} end={4.3}>
        {/* HUGE counter */}
        {(() => {
          // Jitter that grows as we approach the explosion
          const jitter = explode > 0 ? (Math.sin(localTime * 80) * explode * 20) : 0;
          const jitterY = explode > 0 ? (Math.cos(localTime * 70) * explode * 14) : 0;
          const scale = 1 + explode * 0.35;
          const hue = explode * 15;
          return (
            <>
              <div style={{
                position: 'absolute', top: 200, left: 0, right: 0,
                textAlign: 'center',
                fontFamily: FONT, color: BRAND.red,
                fontSize: 320, fontWeight: 900,
                letterSpacing: '-0.06em',
                fontVariantNumeric: 'tabular-nums',
                lineHeight: 1,
                transform: `translate(${jitter}px, ${jitterY}px) scale(${scale})`,
                filter: explode > 0 ? `drop-shadow(0 0 ${explode * 60}px ${BRAND.red})` : 'none',
                textShadow: explode > 0.5 ? `0 0 ${explode * 40}px ${BRAND.red}` : 'none',
              }}>{minutes}</div>
              <div style={{
                position: 'absolute', top: 540, left: 0, right: 0,
                textAlign: 'center',
                fontFamily: FONT, color: BRAND.lightSub,
                fontSize: 48, fontWeight: 700, letterSpacing: '0.3em',
              }}>MINUTEN</div>
            </>
          );
        })()}
      </Sprite>

      <Sprite start={1.4} end={4.3}>
        <BigLine top={760} text="Zu viel" color={BRAND.lightText} size={110} />
      </Sprite>
      <Sprite start={1.9} end={4.3}>
        <BigLine top={900} text="Bildschirmzeit?" color={BRAND.red} size={110} />
      </Sprite>

      {/* animated app bars */}
      <Sprite start={2.2} end={4.5}>
        {({ localTime: barLocal }) => {
          // explode relative to outer hook time via parent sprite's localTime
          const barExplode = clamp((barLocal - 1.4) / 0.7, 0, 1); // barLocal 1.4 ≈ hook 3.6
          return (
            <div style={{
              position: 'absolute', left: 80, right: 80, top: 1120,
              display: 'flex', flexDirection: 'column', gap: 18,
              filter: barExplode > 0.3 ? `blur(${barExplode * 4}px)` : 'none',
              opacity: 1 - barExplode * 0.5,
            }}>
            {[
              { name: 'TikTok', mins: 52, color: '#ff0050' },
              { name: 'YouTube', mins: 38, color: '#ff0000' },
              { name: 'Instagram', mins: 20, color: '#e1306c' },
              { name: 'WhatsApp', mins: 10, color: '#25d366' },
            ].map((a, i) => {
              const t = Easing.easeOutCubic(clamp((barLocal - i * 0.08) / 0.5, 0, 1));
              const w = t * (a.mins / 52);
              // Each bar flings in a direction when explode fires
              const dir = i % 2 === 0 ? -1 : 1;
              const flyX = barExplode * dir * 400;
              const flyY = barExplode * (i - 1.5) * 80;
              const rot = barExplode * dir * 25;
              return (
                <div key={a.name} style={{
                  opacity: t * (1 - barExplode),
                  transform: `translate(${flyX}px, ${flyY}px) rotate(${rot}deg)`,
                }}>
                  <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    fontFamily: FONT, color: BRAND.lightText,
                    fontSize: 32, fontWeight: 700, marginBottom: 8,
                  }}>
                    <span>{a.name}</span>
                    <span style={{ color: BRAND.lightSub, fontVariantNumeric: 'tabular-nums' }}>{Math.round(a.mins * t)} Min</span>
                  </div>
                  <div style={{
                    height: 14, background: BRAND.lightSoft,
                    borderRadius: 7, overflow: 'hidden',
                    transform: `scaleY(${1 + barExplode * 3})`,
                  }}>
                    <div style={{
                      width: `${w * 100}%`, height: '100%',
                      background: a.color,
                    }}/>
                  </div>
                </div>
              );
            })}
            </div>
          );
        }}
      </Sprite>

      {/* Playful explosion burst: emoji particles radiating outward */}
      <Sprite start={3.6} end={4.5}>
        {({ localTime: exLocal }) => {
          const p = clamp(exLocal / 0.7, 0, 1);
          const ease = Easing.easeOutCubic(p);
          const particles = ['💥','⭐','✨','🎉','⚡','💫','🔥','⭐','✨','💥','🎊','⚡'];
          return (
            <>
              {/* Orange energy flash */}
              <div style={{
                position: 'absolute', inset: 0,
                background: `radial-gradient(circle at 50% 30%, ${BRAND.orange}, transparent 60%)`,
                opacity: p < 0.15 ? (p / 0.15) * 0.9 : Math.max(0, 0.9 - (p - 0.15) * 2.2),
                pointerEvents: 'none',
              }}/>
              {/* Radiating particles */}
              {particles.map((emoji, i) => {
                const angle = (i / particles.length) * Math.PI * 2;
                const dist = ease * 700;
                const x = 540 + Math.cos(angle) * dist;
                const y = 360 + Math.sin(angle) * dist;
                const rot = ease * 540 * (i % 2 ? 1 : -1);
                return (
                  <div key={i} style={{
                    position: 'absolute',
                    left: x, top: y,
                    fontSize: 80 + (i % 3) * 20,
                    transform: `translate(-50%,-50%) scale(${ease * 1.3}) rotate(${rot}deg)`,
                    opacity: 1 - p * 0.6,
                    filter: `drop-shadow(0 0 20px ${BRAND.orange})`,
                  }}>{emoji}</div>
                );
              })}
              {/* Shockwave ring */}
              <div style={{
                position: 'absolute',
                left: 540, top: 360,
                width: ease * 1600, height: ease * 1600,
                transform: 'translate(-50%,-50%)',
                borderRadius: '50%',
                border: `${6 + (1-ease) * 14}px solid ${BRAND.red}`,
                opacity: 1 - ease,
                pointerEvents: 'none',
              }}/>
            </>
          );
        }}
      </Sprite>
    </>
  );
}

// ── SCENE 1b — HOOK PART 2 (4.5–9.0s) ──────────────────────────────────────
// "Kein Bock auf Haushalt und Schule?" — playful kid-attitude moment

function SceneHook2() {
  const { time: localTime, duration } = useTimeline();
  const p = localTime / duration;

  return (
    <>
      {/* warm cream background */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(circle at 50% 40%, #fff8e8, ${BRAND.light} 75%)`,
      }}/>

      {/* Floating background doodles */}
      <Sprite start={0} end={4.5}>
        {({ localTime: t }) => (
          <>
            {['🧹','📚','🛏️','🧺','✏️','🗑️','🧽','📖'].map((emoji, i) => {
              const col = i % 4;
              const row = Math.floor(i / 4);
              const x = 120 + col * 240 + Math.sin(t * 0.8 + i) * 18;
              const y = 220 + row * 1100 + Math.cos(t * 0.7 + i) * 14;
              const fade = clamp(t / 0.5, 0, 1) * 0.5;
              const rot = Math.sin(t * 0.9 + i) * 10;
              return (
                <div key={i} style={{
                  position: 'absolute', left: x, top: y,
                  fontSize: 100,
                  opacity: fade,
                  transform: `rotate(${rot}deg)`,
                  filter: 'grayscale(40%)',
                }}>{emoji}</div>
              );
            })}
          </>
        )}
      </Sprite>

      {/* Bored kid emoji with bounce entry */}
      <Sprite start={0.1} end={4.5}>
        {({ localTime: t }) => {
          const entry = Easing.easeOutBack(clamp(t / 0.7, 0, 1));
          const bob = Math.sin(t * 2.2) * 14;
          return (
            <div style={{
              position: 'absolute', top: 360, left: 0, right: 0,
              textAlign: 'center',
              fontSize: 340,
              transform: `scale(${entry}) translateY(${bob}px) rotate(${Math.sin(t*1.8)*5}deg)`,
              filter: 'drop-shadow(0 25px 40px rgba(0,0,0,0.15))',
            }}>😤</div>
          );
        }}
      </Sprite>

      {/* Line 1: "Kein Bock" */}
      <Sprite start={0.6} end={4.5}>
        {({ localTime: t }) => {
          const entry = Easing.easeOutCubic(clamp(t / 0.5, 0, 1));
          return (
            <div style={{
              position: 'absolute', top: 860, left: 0, right: 0,
              textAlign: 'center',
              fontFamily: FONT,
              fontSize: 160, fontWeight: 900,
              color: BRAND.lightText,
              letterSpacing: '-0.045em',
              lineHeight: 0.95,
              opacity: entry,
              transform: `translateY(${(1-entry)*40}px) rotate(-2deg)`,
            }}>Kein Bock.</div>
          );
        }}
      </Sprite>

      {/* Subtitle "auf Haushalt & Schule?" */}
      <Sprite start={1.3} end={4.5}>
        {({ localTime: t }) => {
          const entry = Easing.easeOutCubic(clamp(t / 0.5, 0, 1));
          return (
            <div style={{
              position: 'absolute', top: 1060, left: 0, right: 0,
              textAlign: 'center',
              fontFamily: FONT,
              fontSize: 68, fontWeight: 700,
              color: BRAND.lightSub,
              letterSpacing: '-0.015em',
              lineHeight: 1.2,
              opacity: entry,
              transform: `translateY(${(1-entry)*20}px)`,
            }}>Auf Haushalt und Schule?</div>
          );
        }}
      </Sprite>

      {/* Speech bubbles popping around the kid */}
      <Sprite start={2.0} end={4.5}>
        {({ localTime: t }) => {
          const bubbles = [
            { text: 'Nö.',       x: 180, y: 380, delay: 0.0,  rot: -8, size: 56 },
            { text: 'Später!',   x: 820, y: 460, delay: 0.25, rot: 6,  size: 52 },
            { text: 'Warum ich?',x: 150, y: 680, delay: 0.5,  rot: -5, size: 46 },
            { text: 'Gleich.',   x: 860, y: 720, delay: 0.75, rot: 10, size: 58 },
          ];
          return (
            <>
              {bubbles.map((b, i) => {
                const bt = t - b.delay;
                if (bt < 0) return null;
                const entry = Easing.easeOutBack(clamp(bt / 0.4, 0, 1));
                const bob = Math.sin(bt * 3) * 6;
                return (
                  <div key={i} style={{
                    position: 'absolute',
                    left: b.x, top: b.y + bob,
                    background: '#fff',
                    color: BRAND.lightText,
                    fontFamily: FONT,
                    fontSize: b.size, fontWeight: 900,
                    padding: '18px 30px',
                    borderRadius: 40,
                    border: `4px solid ${BRAND.lightText}`,
                    boxShadow: '0 8px 0 rgba(0,0,0,0.15)',
                    transform: `scale(${entry}) rotate(${b.rot}deg)`,
                    letterSpacing: '-0.01em',
                    whiteSpace: 'nowrap',
                  }}>{b.text}</div>
                );
              })}
            </>
          );
        }}
      </Sprite>

      {/* "Es gibt einen Weg..." teaser at the bottom, fades in last */}
      <Sprite start={3.3} end={4.5}>
        {({ localTime: t }) => {
          const entry = Easing.easeOutCubic(clamp(t / 0.5, 0, 1));
          return (
            <div style={{
              position: 'absolute', top: 1560, left: 0, right: 0,
              textAlign: 'center',
              fontFamily: FONT,
              fontSize: 46, fontWeight: 700,
              color: BRAND.orange,
              letterSpacing: '-0.01em',
              opacity: entry,
              transform: `translateY(${(1-entry)*16}px)`,
            }}>Es gibt einen besseren Weg ↓</div>
          );
        }}
      </Sprite>
    </>
  );
}

// ── SCENE 2 — LOGO REVEAL (3.8–7.5s) ────────────────────────────────────────

function SceneLogo() {
  const { time: localTime, duration } = useTimeline();
  const progress = duration > 0 ? clamp(localTime / duration, 0, 1) : 0;

  return (
    <>
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(circle at 50% 40%, #fff8e8, ${BRAND.light} 70%)`,
      }}/>

      {/* Chest image entry: scale + drop */}
      <Sprite start={0} end={3.7}>
        {({ localTime }) => {
          const t = Easing.easeOutBack(clamp(localTime / 0.7, 0, 1));
          const scale = 0.2 + 0.8 * t;
          const rot = (1 - t) * -25;
          // slow drift
          const drift = Math.sin(localTime * 1.2) * 8;
          return (
            <img src="assets/icon.png" alt=""
              style={{
                position: 'absolute',
                top: 460 + drift, left: '50%',
                width: 540, height: 540,
                transform: `translateX(-50%) scale(${scale}) rotate(${rot}deg)`,
                opacity: clamp(localTime / 0.4, 0, 1),
                filter: 'drop-shadow(0 30px 60px rgba(212,137,42,0.35))',
              }}
            />
          );
        }}
      </Sprite>

      {/* Glow ring sweep */}
      <Sprite start={0.6} end={3.7}>
        {({ localTime }) => {
          const t = clamp(localTime / 1.2, 0, 1);
          return (
            <div style={{
              position: 'absolute',
              top: 650, left: '50%',
              width: 600 + t * 400, height: 600 + t * 400,
              transform: 'translate(-50%,-50%)',
              borderRadius: '50%',
              border: `3px solid ${BRAND.orange}`,
              opacity: (1 - t) * 0.6,
            }}/>
          );
        }}
      </Sprite>

      {/* Title: FAMILY over QUEST */}
      <Sprite start={0.8} end={3.7}>
        {({ localTime }) => {
          const t1 = Easing.easeOutCubic(clamp(localTime / 0.45, 0, 1));
          const t2 = Easing.easeOutCubic(clamp((localTime - 0.15) / 0.45, 0, 1));
          return (
            <div style={{
              position: 'absolute', top: 1100, left: 0, right: 0,
              textAlign: 'center',
              fontFamily: FONT,
              lineHeight: 0.95, letterSpacing: '-0.04em',
            }}>
              <div style={{
                color: BRAND.lightText, fontSize: 150, fontWeight: 900,
                opacity: t1, transform: `translateY(${(1-t1) * 30}px)`,
              }}>Family</div>
              <div style={{
                color: BRAND.orange, fontSize: 150, fontWeight: 900,
                opacity: t2, transform: `translateY(${(1-t2) * 30}px)`,
              }}>Quest</div>
            </div>
          );
        }}
      </Sprite>

      <Sprite start={1.6} end={3.7}>
        <div style={{
          position: 'absolute', top: 1480, left: 0, right: 0,
          textAlign: 'center',
          fontFamily: FONT, color: BRAND.lightSub,
          fontSize: 40, fontWeight: 600, letterSpacing: '0.2em',
        }}>DIE FAMILIEN-APP</div>
      </Sprite>
    </>
  );
}

// ── SCENE 3 — PRINCIPLE: VERDIENEN STATT BEKOMMEN (7.5–12s) ────────────────

function ScenePrinciple() {
  return (
    <>
      <Sprite start={0} end={5.0}>
        <Caption top={160} small="DAS PRINZIP" text="" />
      </Sprite>

      <Sprite start={0.1} end={2.0}>
        <BigLine top={220} text="Nicht einfach" size={90} color={BRAND.sub} />
        <BigLine top={350} text="bekommen." size={130} color={BRAND.red} />
      </Sprite>

      <Sprite start={2.0} end={5.0}>
        <BigLine top={220} text="Sondern" size={90} color={BRAND.sub} />
        <BigLine top={350} text="verdienen." size={130} color={BRAND.orange} />
      </Sprite>

      {/* Flow diagram: TASK → TIME */}
      <Sprite start={0.6} end={5.0}>
        {({ localTime }) => {
          const tIn = Easing.easeOutCubic(clamp(localTime / 0.5, 0, 1));
          const tArrow = Easing.easeInOutCubic(clamp((localTime - 0.8) / 0.6, 0, 1));
          const tReward = Easing.easeOutBack(clamp((localTime - 1.4) / 0.5, 0, 1));

          return (
            <div style={{
              position: 'absolute', left: 60, right: 60, top: 700,
              display: 'flex', flexDirection: 'column', gap: 48, alignItems: 'center',
            }}>
              {/* Task card */}
              <div style={{
                opacity: tIn,
                transform: `translateY(${(1-tIn) * 30}px) scale(${0.95 + 0.05*tIn})`,
                width: '100%', maxWidth: 800,
                background: BRAND.card, borderRadius: 28,
                padding: '32px 36px',
                border: `2px solid ${BRAND.border}`,
                display: 'flex', alignItems: 'center', gap: 28,
              }}>
                <div style={{
                  width: 80, height: 80, borderRadius: 20,
                  background: BRAND.blue + '22',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 44,
                }}>🛏️</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: FONT, color: BRAND.text, fontSize: 42, fontWeight: 800, marginBottom: 6 }}>Bett machen</div>
                  <div style={{ fontFamily: FONT, color: BRAND.sub, fontSize: 26, fontWeight: 600 }}>Aufgabe vom Papa</div>
                </div>
              </div>

              {/* Arrow */}
              <div style={{
                opacity: tArrow,
                transform: `scale(${tArrow})`,
                fontFamily: FONT, fontSize: 80, color: BRAND.orange, fontWeight: 900,
                lineHeight: 0.8,
              }}>↓</div>

              {/* Reward card */}
              <div style={{
                opacity: clamp(tReward, 0, 1),
                transform: `translateY(${(1 - clamp(tReward,0,1)) * 30}px) scale(${tReward})`,
                width: '100%', maxWidth: 800,
                background: BRAND.orange, borderRadius: 28,
                padding: '32px 36px',
                display: 'flex', alignItems: 'center', gap: 28,
                boxShadow: '0 20px 50px rgba(212,137,42,0.35)',
              }}>
                <div style={{ fontSize: 80 }}>⏱️</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: FONT, color: '#1a0d00', fontSize: 54, fontWeight: 900, lineHeight: 1 }}>+3 Min</div>
                  <div style={{ fontFamily: FONT, color: '#3a2408', fontSize: 28, fontWeight: 700, marginTop: 4 }}>Bildschirmzeit</div>
                </div>
              </div>
            </div>
          );
        }}
      </Sprite>
    </>
  );
}

// ── SCENE 4 — KIND-ANSICHT (12–18s) ────────────────────────────────────────

function SceneKidView() {
  return (
    <>
      <Sprite start={0} end={7.0}>
        <Caption top={100} small="KIND-ANSICHT" text="" />
      </Sprite>

      <Sprite start={0.05} end={7.0}>
        <BigLine top={160} text="Quests abhaken." size={78} />
      </Sprite>

      <Sprite start={0.05} end={7.0}>
        <Phone x={540} y={1150} width={620} height={1280} screen={BRAND.bg}>
          <KidPhoneScreen />
        </Phone>
      </Sprite>
    </>
  );
}

function KidPhoneScreen() {
  const { localTime } = useSprite();

  // Animation: 3 quest cards appear, then one gets tapped → checkmark + time bar fills
  const tapTime = 2.2;
  const done = localTime > tapTime;

  // Time bar fill — start at 5 min, after tap animate up to 20 min
  const minutesStart = 17;
  const minutesEnd = 20;
  const minutesMax = 60; // bar full at 60 min
  const tapAnim = done ? Easing.easeOutCubic(clamp((localTime - tapTime) / 1.0, 0, 1)) : 0;
  const minutes = Math.round(minutesStart + (minutesEnd - minutesStart) * tapAnim);
  const timeProgress = minutes / minutesMax;

  const tasks = [
    { icon: '🛏️', title: 'Bett machen', reward: 3 },
    { icon: '📚', title: 'Hausaufgaben', reward: 30 },
    { icon: '🧹', title: 'Zimmer aufräumen', reward: 20 },
  ];

  return (
    <div style={{ padding: '12px 24px', position: 'relative', height: '100%', fontFamily: FONT }}>
      {/* hero */}
      <div style={{ textAlign: 'center', marginTop: 12, marginBottom: 16 }}>
        <div style={{ fontSize: 56 }}>🧒</div>
        <div style={{ color: BRAND.sub, fontSize: 15, fontWeight: 700, marginTop: 4 }}>Hey, Abenteurer!</div>
        <div style={{ color: BRAND.text, fontSize: 28, fontWeight: 900 }}>Leo</div>
      </div>

      {/* time meter */}
      <div style={{
        background: BRAND.card, borderRadius: 24, padding: 20,
        border: `1px solid ${BRAND.blue}55`, marginBottom: 18,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ color: BRAND.sub, fontSize: 14, fontWeight: 700 }}>📱 VERBLEIBENDE MEDIENZEIT</div>
          <div style={{ color: BRAND.blue, fontSize: 26, fontWeight: 900, fontVariantNumeric: 'tabular-nums' }}>{minutes}:00</div>
        </div>
        <div style={{ height: 12, background: BRAND.bgSoft, borderRadius: 6, overflow: 'hidden' }}>
          <div style={{
            width: `${timeProgress * 100}%`, height: '100%',
            background: BRAND.blue,
            transition: 'none',
          }}/>
        </div>
        <div style={{ color: BRAND.sub, fontSize: 13, fontWeight: 600, marginTop: 10 }}>
          {minutes} Min verdient · 0 Min verbraucht
        </div>
      </div>

      {/* section */}
      <div style={{ color: BRAND.text, fontSize: 18, fontWeight: 800, marginBottom: 12 }}>⚔️ Heutige Quests</div>

      {/* tasks */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {tasks.map((task, i) => {
          const tapped = done && i === 0;
          const entryT = Easing.easeOutCubic(clamp((localTime - 0.3 - i * 0.2) / 0.4, 0, 1));

          // Tap ripple
          const sinceTap = localTime - tapTime;
          const ripple = i === 0 && sinceTap > 0 && sinceTap < 0.5 ? clamp(sinceTap / 0.5, 0, 1) : 0;

          return (
            <div key={i} style={{
              opacity: entryT,
              transform: `translateY(${(1-entryT)*20}px) scale(${tapped ? 0.98 : 1})`,
              background: BRAND.card,
              borderRadius: 18, padding: 14,
              display: 'flex', alignItems: 'center', gap: 12,
              border: `1px solid ${BRAND.border}`,
              filter: tapped ? 'brightness(0.8)' : 'none',
              position: 'relative',
              overflow: 'hidden',
            }}>
              {ripple > 0 && (
                <div style={{
                  position: 'absolute',
                  left: 30, top: '50%',
                  width: ripple * 400, height: ripple * 400,
                  transform: 'translate(-50%,-50%)',
                  borderRadius: '50%',
                  background: BRAND.blue,
                  opacity: (1 - ripple) * 0.3,
                }}/>
              )}
              <div style={{
                width: 48, height: 48, borderRadius: 12,
                background: BRAND.blue + '22',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 24,
              }}>{task.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{
                  color: BRAND.text, fontSize: 16, fontWeight: 800,
                  textDecoration: tapped ? 'line-through' : 'none',
                  opacity: tapped ? 0.6 : 1,
                }}>{task.title}</div>
                <div style={{ color: BRAND.sub, fontSize: 11, fontWeight: 600, marginTop: 2 }}>
                  {tapped ? 'Wartet auf Bestätigung' : 'Tippe wenn fertig'}
                </div>
              </div>
              {tapped ? (
                <div style={{
                  background: '#fef3c7', color: '#854d0e',
                  fontSize: 12, fontWeight: 800,
                  padding: '5px 10px', borderRadius: 14,
                }}>WARTET</div>
              ) : (
                <div style={{
                  background: BRAND.blue, color: '#fff',
                  fontSize: 12, fontWeight: 800,
                  padding: '5px 10px', borderRadius: 14,
                }}>+{task.reward} Min</div>
              )}
            </div>
          );
        })}
      </div>

      {/* Cursor / tap indicator animation */}
      {localTime > 1.8 && localTime < tapTime + 0.3 && (
        <div style={{
          position: 'absolute',
          left: 540, top: 460 + (localTime < tapTime ? 0 : 0),
          fontSize: 40,
          transform: `translate(-50%,-50%) scale(${
            localTime > tapTime ? 0.7 + (1 - clamp((localTime - tapTime) / 0.25, 0, 1)) * 0.3 : 1
          })`,
          opacity: localTime > tapTime + 0.25 ? 0 : 1,
        }}>👆</div>
      )}
    </div>
  );
}

// ── SCENE 5 — ELTERN-DASHBOARD (18–24s) ────────────────────────────────────

function SceneParentView() {
  return (
    <>
      <Sprite start={0} end={7.0}>
        <Caption top={100} small="ELTERN-ANSICHT" text="" />
      </Sprite>

      <Sprite start={0.05} end={7.0}>
        <BigLine top={160} text="Alles im Blick." size={78} />
      </Sprite>

      <Sprite start={0.05} end={7.0}>
        <Phone x={540} y={1150} width={620} height={1280} screen={BRAND.bg}>
          <ParentPhoneScreen />
        </Phone>
      </Sprite>
    </>
  );
}

function ParentPhoneScreen() {
  const { localTime } = useSprite();

  // Confirm pulse around 2.5s, lock toggle at ~4s
  const confirmT = clamp((localTime - 2.2) / 0.4, 0, 1);
  const lockToggled = localTime > 4.0;

  return (
    <div style={{ padding: '12px 20px', fontFamily: FONT, position: 'relative', height: '100%' }}>
      {/* header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        paddingBottom: 12, borderBottom: `1px solid ${BRAND.border}`, marginBottom: 12,
      }}>
        <div>
          <div style={{ color: BRAND.sub, fontSize: 12, fontWeight: 700 }}>ELTERN-ANSICHT</div>
          <div style={{ color: BRAND.text, fontSize: 22, fontWeight: 900 }}>Familie Schmidt</div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <div style={{ width: 32, height: 32, borderRadius: 16, background: BRAND.bgSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>⚙️</div>
        </div>
      </div>

      {/* child selector */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
        {[
          { emoji: '🧒', name: 'Leo', color: BRAND.blue, active: true },
          { emoji: '👧', name: 'Mia', color: BRAND.orange, active: false },
        ].map(c => (
          <div key={c.name} style={{
            flex: 1,
            background: BRAND.card,
            border: c.active ? `2px solid ${c.color}` : `1px solid ${BRAND.border}`,
            borderRadius: 16, padding: 12,
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 32 }}>{c.emoji}</div>
            <div style={{ color: c.color, fontSize: 14, fontWeight: 900, marginTop: 2 }}>{c.name}</div>
          </div>
        ))}
      </div>

      {/* stats row */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
        <div style={{
          flex: 1, background: BRAND.card, borderRadius: 16, padding: 14,
          borderLeft: `4px solid ${BRAND.blue}`,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <div style={{ color: BRAND.sub, fontSize: 11, fontWeight: 700 }}>⏱️ MEDIENZEIT</div>
            <div style={{
              width: 28, height: 28, borderRadius: 14,
              background: lockToggled ? BRAND.red : BRAND.bgSoft,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14,
              transition: 'background 200ms',
            }}>{lockToggled ? '🔒' : '🔓'}</div>
          </div>
          <div style={{ color: BRAND.text, fontSize: 26, fontWeight: 900 }}>20 Min</div>
          <div style={{ color: BRAND.sub, fontSize: 10, fontWeight: 600, marginTop: 2 }}>20 verdient · 0 verbraucht</div>
        </div>
        <div style={{
          flex: 1, background: BRAND.card, borderRadius: 16, padding: 14,
          borderLeft: `4px solid ${BRAND.yellow}`,
        }}>
          <div style={{ color: BRAND.sub, fontSize: 11, fontWeight: 700, marginBottom: 4 }}>💰 TASCHENGELD</div>
          <div style={{ color: BRAND.text, fontSize: 26, fontWeight: 900 }}>4,50 €</div>
          <div style={{ color: BRAND.sub, fontSize: 10, fontWeight: 600, marginTop: 2 }}>Auszahlen →</div>
        </div>
      </div>

      {/* app usage */}
      <div style={{
        background: BRAND.card, borderRadius: 16, padding: 14, marginBottom: 14,
      }}>
        <div style={{ color: BRAND.text, fontSize: 14, fontWeight: 800, marginBottom: 10 }}>APP-NUTZUNG HEUTE</div>
        {[
          { n: 'YouTube', m: 14, c: '#ff0000' },
          { n: 'TikTok', m: 6, c: '#ff0050' },
          { n: 'WhatsApp', m: 3, c: '#25d366' },
        ].map((a,i) => {
          const t = Easing.easeOutCubic(clamp((localTime - 0.4 - i * 0.1) / 0.4, 0, 1));
          return (
            <div key={a.n} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '6px 0', borderBottom: i < 2 ? `1px solid ${BRAND.border}` : 'none',
              opacity: t,
            }}>
              <div style={{ width: 10, height: 10, borderRadius: 5, background: a.c }}/>
              <div style={{ flex: 1, color: BRAND.text, fontSize: 14, fontWeight: 700 }}>{a.n}</div>
              <div style={{ color: BRAND.sub, fontSize: 12, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{a.m} Min</div>
            </div>
          );
        })}
      </div>

      {/* pending confirmation — pulses */}
      <div style={{
        background: BRAND.card, borderRadius: 16, padding: 14,
        border: `2px solid ${confirmT > 0 ? BRAND.orange : BRAND.border}`,
        display: 'flex', alignItems: 'center', gap: 12,
        transform: `scale(${1 + Math.sin(localTime * 6) * 0.01 * confirmT})`,
        boxShadow: confirmT > 0 ? `0 0 ${30 * confirmT}px ${BRAND.orange}66` : 'none',
      }}>
        <div style={{ fontSize: 28 }}>🛏️</div>
        <div style={{ flex: 1 }}>
          <div style={{ color: BRAND.text, fontSize: 15, fontWeight: 800 }}>Bett machen</div>
          <div style={{ color: BRAND.sub, fontSize: 11, fontWeight: 600 }}>Leo wartet auf Bestätigung</div>
        </div>
        <div style={{
          background: BRAND.orange, color: '#1a0d00',
          fontSize: 11, fontWeight: 900,
          padding: '6px 12px', borderRadius: 12,
        }}>⏳ NEU</div>
      </div>

      {/* finger pointing at lock around 3.5s */}
      {localTime > 3.3 && localTime < 4.4 && (
        <div style={{
          position: 'absolute',
          right: 38, top: 410,
          fontSize: 36,
          transform: `scale(${localTime > 4.0 ? 0.8 : 1})`,
          transition: 'none',
        }}>👆</div>
      )}
    </div>
  );
}

// ── SCENE 6 — FEATURE GRID (24–30s) ─────────────────────────────────────────

function SceneFeatures() {
  const features = [
    { icon: '🏆', title: 'Challenges', sub: 'Mehrtägige Herausforderungen', color: BRAND.purple },
    { icon: '💰', title: 'Taschengeld', sub: 'Statt Minuten auch Geld', color: BRAND.yellow },
    { icon: '👨‍👩‍👧', title: 'Co-Parent', sub: 'Beide Eltern im Team', color: BRAND.blue },
    { icon: '📊', title: 'Dashboard', sub: 'App-Nutzung transparent', color: BRAND.green },
    { icon: '🔒', title: 'Gerät sperren', sub: 'Mit einem Tap', color: BRAND.red },
    { icon: '🎒', title: 'Schulmodus', sub: 'Automatisch aktiv', color: BRAND.orange },
  ];

  return (
    <>
      <Sprite start={0} end={7.0}>
        <Caption top={150} small="ALLES IN EINER APP" text="" />
      </Sprite>

      <Sprite start={0.05} end={7.0}>
        <BigLine top={220} text="Fair. Transparent." size={80} />
        <BigLine top={340} text="Gamified." size={100} color={BRAND.orange} />
      </Sprite>

      <Sprite start={0.3} end={7.0}>
        {({ localTime }) => (
          <div style={{
            position: 'absolute',
            left: 60, right: 60, top: 540,
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 22,
          }}>
            {features.map((f, i) => {
              const col = i % 2;
              const row = Math.floor(i / 2);
              const delay = row * 0.15 + col * 0.07;
              const t = Easing.easeOutBack(clamp((localTime - delay) / 0.55, 0, 1));
              return (
                <div key={f.title} style={{
                  opacity: clamp((localTime - delay) / 0.3, 0, 1),
                  transform: `scale(${t}) translateY(${(1-t)*20}px)`,
                  background: BRAND.card,
                  borderRadius: 28, padding: 28,
                  border: `1px solid ${BRAND.border}`,
                  minHeight: 260,
                  display: 'flex', flexDirection: 'column',
                  justifyContent: 'space-between',
                }}>
                  <div style={{
                    width: 96, height: 96, borderRadius: 24,
                    background: f.color + '22',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 52,
                  }}>{f.icon}</div>
                  <div>
                    <div style={{
                      color: BRAND.text, fontFamily: FONT,
                      fontSize: 40, fontWeight: 900, letterSpacing: '-0.02em',
                      marginTop: 12, marginBottom: 6,
                    }}>{f.title}</div>
                    <div style={{
                      color: BRAND.sub, fontFamily: FONT,
                      fontSize: 22, fontWeight: 600, lineHeight: 1.2,
                    }}>{f.sub}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Sprite>
    </>
  );
}

// ── SCENE 7 — CTA (30–36s) ─────────────────────────────────────────────────

function SceneCTA() {
  return (
    <>
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(circle at 50% 50%, ${BRAND.orange}25, ${BRAND.bg} 70%)`,
      }}/>

      {/* rotating chest */}
      <Sprite start={0} end={6}>
        {({ localTime }) => {
          const entryT = Easing.easeOutBack(clamp(localTime / 0.6, 0, 1));
          const bob = Math.sin(localTime * 2) * 12;
          return (
            <img src="assets/icon.png" alt=""
              style={{
                position: 'absolute',
                top: 400 + bob, left: '50%',
                width: 460, height: 460,
                transform: `translateX(-50%) scale(${entryT})`,
                opacity: entryT,
                filter: 'drop-shadow(0 30px 60px rgba(212,137,42,0.4))',
              }}
            />
          );
        }}
      </Sprite>

      <Sprite start={0.3} end={6}>
        <div style={{
          position: 'absolute', top: 920, left: 0, right: 0,
          textAlign: 'center', fontFamily: FONT, lineHeight: 0.95,
          letterSpacing: '-0.04em',
        }}>
          <div style={{ color: BRAND.text, fontSize: 140, fontWeight: 900 }}>Family</div>
          <div style={{ color: BRAND.orange, fontSize: 140, fontWeight: 900 }}>Quest</div>
        </div>
      </Sprite>

      {/* COMING SOON badge */}
      <Sprite start={0.6} end={6}>
        {({ localTime }) => {
          const t = Easing.easeOutBack(clamp(localTime / 0.5, 0, 1));
          return (
            <div style={{
              position: 'absolute', top: 1250, left: 0, right: 0,
              display: 'flex', justifyContent: 'center',
              opacity: t,
              transform: `scale(${t})`,
            }}>
              <div style={{
                border: `3px solid ${BRAND.orange}`,
                color: BRAND.orange,
                fontFamily: FONT, fontSize: 36, fontWeight: 900,
                padding: '14px 36px',
                borderRadius: 8,
                letterSpacing: '0.3em',
              }}>COMING SOON</div>
            </div>
          );
        }}
      </Sprite>

      {/* Waitlist CTA */}
      <Sprite start={1.0} end={6}>
        {({ localTime }) => {
          const t = Easing.easeOutCubic(clamp(localTime / 0.5, 0, 1));
          return (
            <div style={{
              position: 'absolute', top: 1420, left: 0, right: 0,
              textAlign: 'center', fontFamily: FONT,
              color: BRAND.text, fontSize: 44, fontWeight: 700,
              padding: '0 60px',
              lineHeight: 1.25,
              opacity: t,
              transform: `translateY(${(1-t)*20}px)`,
            }}>Interesse?<br/>Dann trag dich ein!</div>
          );
        }}
      </Sprite>

      {/* URL pill */}
      <Sprite start={1.5} end={6}>
        {({ localTime }) => {
          const t = Easing.easeOutBack(clamp(localTime / 0.6, 0, 1));
          const pulse = 1 + Math.sin(localTime * 3) * 0.015;
          return (
            <div style={{
              position: 'absolute', top: 1640, left: 0, right: 0,
              display: 'flex', justifyContent: 'center',
              opacity: t,
              transform: `scale(${t * pulse})`,
            }}>
              <div style={{
                background: BRAND.orange,
                color: '#1a0d00',
                fontFamily: FONT, fontSize: 44, fontWeight: 900,
                padding: '26px 56px',
                borderRadius: 60,
                letterSpacing: '-0.005em',
                boxShadow: `0 20px 60px ${BRAND.orange}77`,
              }}>www.familyquest.info</div>
            </div>
          );
        }}
      </Sprite>

      <Sprite start={1.8} end={6}>
        <div style={{
          position: 'absolute', top: 1800, left: 0, right: 0,
          textAlign: 'center',
          fontFamily: FONT, color: BRAND.sub,
          fontSize: 26, fontWeight: 600, letterSpacing: '0.25em',
        }}>ANDROID ZUERST · iOS FOLGT</div>
      </Sprite>
    </>
  );
}

// ── Scene timing ───────────────────────────────────────────────────────────
const TL = {
  hook:      { s: 0,    e: 4.5 },
  hook2:     { s: 4.5,  e: 9.0 },
  logo:      { s: 9.0,  e: 13.0 },
  principle: { s: 13.0, e: 18.0 },
  kid:       { s: 18.0, e: 25.0 },
  parent:    { s: 25.0, e: 32.0 },
  features:  { s: 32.0, e: 39.0 },
  cta:       { s: 39.0, e: 45.0 },
};

// ── Timestamp label for commenting ─────────────────────────────────────────
function TimestampLabel() {
  const time = useTime();
  const sec = Math.floor(time);
  React.useEffect(() => {
    const root = document.querySelector('[data-video-root]');
    if (root) root.setAttribute('data-screen-label', `t=${sec}s`);
  }, [sec]);
  return null;
}

// ── Progress dots (scene indicators) ───────────────────────────────────────
function ProgressDots() {
  const time = useTime();
  const scenes = Object.values(TL);
  return (
    <div style={{
      position: 'absolute', top: 40, left: 40, right: 40,
      display: 'flex', gap: 6, zIndex: 100,
    }}>
      {scenes.map((s, i) => {
        const active = time >= s.s && time < s.e;
        const done = time >= s.e;
        const progress = active ? clamp((time - s.s) / (s.e - s.s), 0, 1) : (done ? 1 : 0);
        return (
          <div key={i} style={{
            flex: 1, height: 4, borderRadius: 2,
            background: 'rgba(26,21,16,0.15)', overflow: 'hidden',
          }}>
            <div style={{ width: `${progress*100}%`, height: '100%', background: BRAND.text }}/>
          </div>
        );
      })}
    </div>
  );
}

// ── Main Video ──────────────────────────────────────────────────────────────
function Video() {
  return (
    <div data-video-root="" data-screen-label="t=0s" style={{
      position: 'absolute', inset: 0,
      background: BRAND.bg, overflow: 'hidden',
    }}>
      <TimestampLabel />
      <ProgressDots />

      <Scene start={TL.hook.s}      end={TL.hook.e}><SceneHook /></Scene>
      <Scene start={TL.hook2.s}     end={TL.hook2.e}><SceneHook2 /></Scene>
      <Scene start={TL.logo.s}      end={TL.logo.e}><SceneLogo /></Scene>
      <Scene start={TL.principle.s} end={TL.principle.e}><ScenePrinciple /></Scene>
      <Scene start={TL.kid.s}       end={TL.kid.e}><SceneKidView /></Scene>
      <Scene start={TL.parent.s}    end={TL.parent.e}><SceneParentView /></Scene>
      <Scene start={TL.features.s}  end={TL.features.e}><SceneFeatures /></Scene>
      <Scene start={TL.cta.s}       end={TL.cta.e}><SceneCTA /></Scene>
    </div>
  );
}

Object.assign(window, { Video, BRAND, FONT });
