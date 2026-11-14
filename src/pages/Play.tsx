import { Link } from 'react-router'
import { useI18n } from '../i18n/context'
import { usePrefs } from '../state/prefs'

const GAMES = ['mystery', 'rebuild', 'puzzle', 'memory'] as const

export function Play() {
  const { t } = useI18n()
  const { profile } = usePrefs()
  return (
    <section className="page">
      <h1>{t.play.title}</h1>
      <p className="lead">{profile === 'kid' ? t.play.kidLead : t.play.lead}</p>
      <ul className="game-cards">
        {GAMES.map((game, i) => (
          <li key={game}>
            <Link to={`/play/${game}`} className="game-card">
              <span className="game-card-num" aria-hidden="true">
                {i + 1}
              </span>
              <span className="game-card-name">{t.play.games[game].name}</span>
              <span className="game-card-desc">{t.play.games[game].desc}</span>
              <span className="game-card-cta">{t.play.start}</span>
            </Link>
          </li>
        ))}
        <li>
          <Link to="/quiz" className="game-card quiz-card">
            <span className="game-card-num" aria-hidden="true">
              ?
            </span>
            <span className="game-card-name">{t.play.quizCard.name}</span>
            <span className="game-card-desc">{t.play.quizCard.desc}</span>
            <span className="game-card-cta">{t.play.start}</span>
          </Link>
        </li>
      </ul>
    </section>
  )
}
