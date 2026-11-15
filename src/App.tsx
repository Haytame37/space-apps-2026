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
import { About } from './pages/About'
import { World } from './pages/World'
import { StageLayout } from './stage/StageLayout'
import { ForKids } from './kids/ForKids'
import { KidHome } from './kids/KidHome'
import { KidMemory } from './kids/games/KidMemory'
import { KidMystery } from './kids/games/KidMystery'
import { KidPuzzle } from './kids/games/KidPuzzle'
import { KidQuiz } from './kids/games/KidQuiz'
import { KidRebuild } from './kids/games/KidRebuild'
import { KidRocket } from './kids/games/KidRocket'
import { KidLayout } from './kids/KidLayout'
import { Shop } from './pages/Shop'
import { BookRoute } from './book/BookRoute'
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
              <Route path="play" element={<ForKids kid={<KidHome />} other={<Play />} />} />
              <Route path="play/mystery" element={<ForKids kid={<KidMystery />} other={<Mystery />} />} />
              <Route path="play/rebuild" element={<ForKids kid={<KidRebuild />} other={<Rebuild />} />} />
              <Route path="play/puzzle" element={<ForKids kid={<KidPuzzle />} other={<Puzzle />} />} />
              <Route path="play/rocket" element={<ForKids kid={<KidRocket />} other={<KidLayout><KidRocket /></KidLayout>} />} />
              <Route path="play/memory" element={<ForKids kid={<KidMemory />} other={<Memory />} />} />
              <Route path="quiz" element={<ForKids kid={<KidQuiz />} other={<Quiz />} />} />
              <Route path="shop" element={<Shop />} />
              <Route path="shop/:bookId" element={<BookRoute />} />
              <Route path="sources" element={<Sources />} />
              <Route path="about" element={<About />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </PrefsProvider>
    </I18nProvider>
  )
}
