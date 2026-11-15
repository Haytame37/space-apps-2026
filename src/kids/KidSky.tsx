const STAR_COUNT = 46

/** Same sky on every visit: a small seeded generator instead of Math.random. */
const STARS = (() => {
  let seed = 11
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647
  return Array.from({ length: STAR_COUNT }, () => ({
    left: rnd() * 100,
    top: rnd() * 100,
    size: 2 + rnd() * 5,
    delay: -rnd() * 3,
    opacity: 0.4 + rnd() * 0.6,
  }))
})()

/** The kids' night sky: twinkling stars and two planets drifting behind the page. */
export function KidSky() {
  return (
    <div className="kid-sky" aria-hidden="true">
      {STARS.map((s, i) => (
        <i
          key={i}
          className="kid-sky-star"
          style={{ left: `${s.left}%`, top: `${s.top}%`, width: s.size, height: s.size, animationDelay: `${s.delay}s`, opacity: s.opacity }}
        />
      ))}
      <span className="kid-planet kid-planet-mars" />
      <span className="kid-planet kid-planet-moon" />
    </div>
  )
}
