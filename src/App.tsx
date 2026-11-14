import { BrowserRouter, Route, Routes } from 'react-router'
import { Shell } from './components/Shell'
import { Memory } from './games/Memory'
import { Mystery } from './games/Mystery'
import { Puzzle } from './games/Puzzle'
import { Rebuild } from './games/Rebuild'
import { I18nProvider } from './i18n/I18nProvider'
import { Explore } from './pages/Explore'
import { Home } from './pages/Home'
import { NotFound } from './pages/NotFound'
import { Play } from './pages/Play'
import { Quiz } from './pages/Quiz'
import { Sources } from './pages/Sources'
import { World } from './pages/World'
import { StageLayout } from './stage/StageLayout'
import { PrefsProvider } from './state/PrefsProvider'

export default function App() {
  return (
    <I18nProvider>
      <PrefsProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<Shell />}>
              <Route element={<StageLayout />}>
                <Route index element={<Home />} />
                <Route path="explore" element={<Explore />} />
                <Route path="explore/:world/:machine?" element={<World />} />
              </Route>
              <Route path="play" element={<Play />} />
              <Route path="play/mystery" element={<Mystery />} />
              <Route path="play/rebuild" element={<Rebuild />} />
              <Route path="play/puzzle" element={<Puzzle />} />
              <Route path="play/memory" element={<Memory />} />
              <Route path="quiz" element={<Quiz />} />
              <Route path="sources" element={<Sources />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </PrefsProvider>
    </I18nProvider>
  )
}
