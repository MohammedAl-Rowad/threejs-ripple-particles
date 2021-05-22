import React, { Suspense, useMemo, useCallback, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import {
  Canvas,
  useLoader,
  useFrame,
  extend,
  useThree,
} from '@react-three/fiber'
import circle from './circle.png'

extend({ OrbitControls })

const CameraControls = () => {
  const controlsRef = useRef()
  const {
    camera,
    gl: { domElement },
  } = useThree()

  useFrame(() => {
    controlsRef.current.update()
  })

  return (
    <orbitControls
      autoRotate
      ref={controlsRef}
      args={[camera, domElement]}
      autoRotateSpeed={0.2}
    />
  )
}

const Points = () => {
  const imgTex = useLoader(THREE.TextureLoader, circle)
  const bufferRef = useRef()
  const count = 400
  const sep = 1
  let f = 0.002
  let a = 3
  let t = 0
  const graph = useCallback((x, z) => {
    const { sin } = Math
    return sin(f * (x ** 4 + z ** 2 + t)) * a
  }, [])

  const positions = useMemo(() => {
    const positions = []
    for (let i = 0; i < count; i++) {
      for (let j = 0; j < count; j++) {
        const x = sep * (i - count / 2)
        const z = sep * (j - count / 2)
        const y = graph(x, z)
        positions.push(x, y, z)
      }
    }
    return new Float32Array(positions)
  }, [])

  useFrame(() => {
    t += 15
    a += 0.2
    const positions = bufferRef.current.array
    let xi = 0
    for (let i = 0; i < count; i++) {
      for (let j = 0; j < count; j++) {
        const x = sep * (i - count / 2)
        const z = sep * (j - count / 2)
        positions[xi + 1] = graph(x, z)
        xi += 3
      }
    }

    bufferRef.current.needsUpdate = true
  })

  return (
    <points>
      <bufferGeometry attach="geometry">
        <bufferAttribute
          ref={bufferRef}
          attachObject={['attributes', 'position']}
          array={positions}
          count={positions.length / 3}
          itemSize={3}
        />
      </bufferGeometry>

      <pointsMaterial
        attach="material"
        map={imgTex}
        color={0xff665a}
        size={0.5}
        sizeAttenuation
        transparent={false}
        alphaTest={0.5}
        opacity={1.0}
      />
    </points>
  )
}

const AnimationCanvas = () => {
  return (
    <Canvas colorManagment={false} camera={{ position: [100, 10, 0], fov: 75 }}>
      <Suspense fallback={null}>
        <Points />
      </Suspense>
      <CameraControls />
    </Canvas>
  )
}

const App = () => {
  return (
    <Suspense fallback={<div>loading....</div>}>
      <AnimationCanvas />
    </Suspense>
  )
}

export default App
