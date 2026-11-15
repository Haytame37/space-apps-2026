import { OrbitControls, useGLTF } from '@react-three/drei'
import { Canvas, useThree } from '@react-three/fiber'
import { Suspense, useEffect, useMemo, useState } from 'react'
import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { useI18n } from '../i18n/context'
import { modelBounds } from '../lib/modelBounds'
import { useReducedMotion } from '../lib/useReducedMotion'
import { AyyurLoader } from './AyyurLoader'
import { ErrorBoundary } from './ErrorBoundary'
import { Icon } from './Icon'

/** Soft studio reflections, built in code, so metal parts are not black. */
function Studio() {
  const { gl } = useThree()
  const env = useMemo(() => {
    const pmrem = new THREE.PMREMGenerator(gl)
    const texture = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
    pmrem.dispose()
    return texture
  }, [gl])
  useEffect(() => () => env.dispose(), [env])
  return <primitive object={env} attach="environment" />
}

function Model({ src, yaw, onReady }: { src: string; yaw: number; onReady: () => void }) {
  const { scene } = useGLTF(src, false, true)
  const fit = useMemo(() => {
    const { size, center } = modelBounds(scene)
    const scale = 2.4 / Math.max(size.x, size.y, size.z)
    return { scale, offset: center.clone().multiplyScalar(-scale) }
  }, [scene])
  useEffect(onReady, [onReady])
  return (
    <group rotation={[0, yaw, 0]}>
      <primitive object={scene} scale={fit.scale} position={fit.offset} />
    </group>
  )
}

export default function ModelViewer({ src, label, credit }: { src: string; label: string; credit: string }) {
  const { t, fmt } = useI18n()
  const reducedMotion = useReducedMotion()
  const [yaw, setYaw] = useState(0)
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading')

  return (
    <div className="model-viewer">
      <div className="model-frame">
        {state !== 'error' && (
          <ErrorBoundary fallback={null} onError={() => setState('error')}>
            <Canvas camera={{ fov: 35, position: [2.6, 1.6, 3.4] }} dpr={[1, 1.75]} role="img" aria-label={label}>
              <Studio />
              <ambientLight intensity={0.5} />
              <directionalLight position={[4, 6, 5]} intensity={2.2} />
              <Suspense fallback={null}>
                <Model src={src} yaw={yaw} onReady={() => setState('ready')} />
              </Suspense>
              <OrbitControls enablePan={false} minDistance={2.2} maxDistance={8} autoRotate={!reducedMotion} autoRotateSpeed={0.8} />
            </Canvas>
          </ErrorBoundary>
        )}
        {state === 'loading' && (
          <div className="model-loading">
            <AyyurLoader label={t.panel.modelLoading} />
          </div>
        )}
        {state === 'error' && (
          <p className="model-status" role="alert">
            {t.panel.modelError}
          </p>
        )}
      </div>
      <div className="model-tools">
        <button type="button" className="icon-btn" onClick={() => setYaw((y) => y - 0.5)}>
          <Icon name="rotateLeft" />
          <span className="sr-only">{t.explore.rotateLeft}</span>
        </button>
        <button type="button" className="icon-btn" onClick={() => setYaw((y) => y + 0.5)}>
          <Icon name="rotateRight" />
          <span className="sr-only">{t.explore.rotateRight}</span>
        </button>
        <p className="muted small">{t.panel.modelHint}</p>
      </div>
      <p className="small muted">{fmt(t.panel.modelCredit, { credit })}</p>
    </div>
  )
}
