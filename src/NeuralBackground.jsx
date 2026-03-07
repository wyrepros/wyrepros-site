import { useEffect, useRef } from 'react'
import * as THREE from 'three'

// Tunable preset: safe defaults for desktop + mobile.
const QUALITY = {
  desktop: {
    particles: 18000,
    lineSample: 2200,
    lineDistance: 0.2,
    lineMaxConnections: 2,
    pointSize: 0.03,
    checkStep: 4,
    pixelRatioCap: 1.8,
  },
  mobile: {
    particles: 7000,
    lineSample: 900,
    lineDistance: 0.17,
    lineMaxConnections: 1,
    pointSize: 0.026,
    checkStep: 7,
    pixelRatioCap: 1.3,
  },
}

const MOTION = {
  fieldScale: 1.55,
  speed: 0.12,
  amplitude: 0.26,
  damping: 0.942,
  interactionRadius: 0.42,
  attract: 0.18,
  repulse: 0.74,
  cameraRadius: 2.7,
  cameraSway: 0.26,
}

const COLORS = {
  bg: 0x04070f,
  particleA: new THREE.Color('#e5f4ff'),
  particleB: new THREE.Color('#58a6ff'),
  line: new THREE.Color('#84c9ff'),
  glowA: 0x184282,
  glowB: 0x0f2a58,
}

export default function NeuralBackground() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return undefined

    const isMobile = window.matchMedia('(max-width: 900px)').matches
    const Q = isMobile ? QUALITY.mobile : QUALITY.desktop

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    })

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, Q.pixelRatioCap))
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setClearColor(COLORS.bg, 1)
    renderer.outputColorSpace = THREE.SRGBColorSpace

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(58, window.innerWidth / window.innerHeight, 0.01, 100)
    camera.position.set(0, 0.2, MOTION.cameraRadius)

    const halo1 = new THREE.Mesh(
      new THREE.SphereGeometry(1.2, 28, 28),
      new THREE.MeshBasicMaterial({ color: COLORS.glowA, transparent: true, opacity: 0.12, blending: THREE.AdditiveBlending, depthWrite: false })
    )
    const halo2 = new THREE.Mesh(
      new THREE.SphereGeometry(1.9, 28, 28),
      new THREE.MeshBasicMaterial({ color: COLORS.glowB, transparent: true, opacity: 0.09, blending: THREE.AdditiveBlending, depthWrite: false })
    )
    scene.add(halo1, halo2)

    const count = Q.particles
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    const velocities = new Float32Array(count * 3)
    const uVals = new Float32Array(count)
    const vVals = new Float32Array(count)
    const seeds = new Float32Array(count)
    const colorTmp = new THREE.Color()

    const rr = (min, max) => min + Math.random() * (max - min)

    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      const u = rr(0, Math.PI * 2)
      const v = rr(0, Math.PI * 2)
      uVals[i] = u
      vVals[i] = v
      seeds[i] = Math.random() * 1000

      const R = 0.82 + 0.14 * Math.sin(v * 2.0)
      const r = 0.22 + 0.08 * Math.cos(u * 3.0)
      const twist = Math.sin(u * 2.0) * 0.35
      const x = (R + r * Math.cos(v + twist)) * Math.cos(u)
      const y = (R + r * Math.cos(v + twist)) * Math.sin(u) * 0.55 + Math.sin(u * 1.7) * 0.21
      const z = r * Math.sin(v + twist) + Math.sin(u * 2.0) * 0.16

      positions[i3] = x * MOTION.fieldScale
      positions[i3 + 1] = y * MOTION.fieldScale
      positions[i3 + 2] = z * MOTION.fieldScale

      colorTmp.copy(COLORS.particleA).lerp(COLORS.particleB, (Math.sin(u * 1.7 + v * 0.8) + 1) * 0.5)
      colors[i3] = colorTmp.r
      colors[i3 + 1] = colorTmp.g
      colors[i3 + 2] = colorTmp.b
    }

    const pGeo = new THREE.BufferGeometry()
    pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    pGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3))

    const pMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexColors: true,
      uniforms: { uSize: { value: Q.pointSize * (window.devicePixelRatio || 1) * 80 } },
      vertexShader: `
        attribute vec3 color;
        varying vec3 vColor;
        void main() {
          vColor = color;
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = uSize * (1.0 / max(0.15, -mv.z));
          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        void main() {
          vec2 uv = gl_PointCoord - 0.5;
          float d = length(uv);
          float a = smoothstep(0.5, 0.0, d) * 0.86;
          gl_FragColor = vec4(vColor, a);
        }
      `,
    })

    const points = new THREE.Points(pGeo, pMat)
    scene.add(points)

    const sample = Math.min(Q.lineSample, count)
    const sampleIdx = new Uint32Array(sample)
    for (let i = 0; i < sample; i++) sampleIdx[i] = Math.floor((i / sample) * count)

    const maxSeg = sample * Q.lineMaxConnections
    const lPos = new Float32Array(maxSeg * 6)
    const lCol = new Float32Array(maxSeg * 6)

    const lGeo = new THREE.BufferGeometry()
    lGeo.setAttribute('position', new THREE.BufferAttribute(lPos, 3).setUsage(THREE.DynamicDrawUsage))
    lGeo.setAttribute('color', new THREE.BufferAttribute(lCol, 3).setUsage(THREE.DynamicDrawUsage))
    lGeo.setDrawRange(0, 0)

    const lMat = new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.34, blending: THREE.AdditiveBlending, depthWrite: false })
    const lines = new THREE.LineSegments(lGeo, lMat)
    scene.add(lines)

    const mouse = new THREE.Vector2(999, 999)
    const ray = new THREE.Raycaster()
    const hit = new THREE.Vector3(999, 999, 999)
    const tmp = new THREE.Vector3()
    let pulse = 0
    let rafId = 0

    const onPointerMove = (e) => {
      mouse.set((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1)
    }
    const onPointerLeave = () => mouse.set(999, 999)
    const onClick = () => { pulse = 1 }

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, Q.pixelRatioCap))
      renderer.setSize(window.innerWidth, window.innerHeight)
    }

    window.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('pointerleave', onPointerLeave, { passive: true })
    window.addEventListener('click', onClick, { passive: true })
    window.addEventListener('resize', onResize)

    const clock = new THREE.Clock()

    const updateField = (t, dt) => {
      ray.setFromCamera(mouse, camera)
      const o = ray.ray.origin
      const d = ray.ray.direction
      if (Math.abs(d.z) > 1e-4) {
        const k = (0 - o.z) / d.z
        hit.copy(o).addScaledVector(d, k)
      } else {
        hit.set(999, 999, 999)
      }

      const repulse = MOTION.repulse * pulse
      pulse *= 0.93

      for (let i = 0; i < count; i++) {
        const i3 = i * 3
        const u = uVals[i]
        const w = vVals[i]
        const s = seeds[i]

        const a = Math.sin(u * 1.6 + t * MOTION.speed + s * 0.002)
        const b = Math.cos(w * 2.2 - t * MOTION.speed * 1.12 + s * 0.0017)
        const c = Math.sin((u + w) * 0.85 + t * MOTION.speed * 0.72 + s * 0.0013)

        const m = 0.5 + 0.5 * Math.sin(t * 0.13 + s * 0.0008)
        const R = 0.8 + 0.14 * Math.sin(w * 2.0 + t * 0.24)
        const r = 0.2 + 0.08 * Math.cos(u * 3.0 - t * 0.22)
        const tw = Math.sin(u * 2 + t * 0.34) * 0.35

        const tx = (R + r * Math.cos(w + tw)) * Math.cos(u)
        const ty = (R + r * Math.cos(w + tw)) * Math.sin(u) * 0.55
        const tz = r * Math.sin(w + tw)

        const ix = Math.sin(u) * (1 + 0.35 * Math.cos(w * 2))
        const iy = 0.45 * Math.sin(2 * u) + 0.25 * Math.sin(w + t * 0.15)
        const iz = Math.cos(u) * Math.sin(w)

        const x = (THREE.MathUtils.lerp(tx, ix, m) + a * MOTION.amplitude * 0.22) * MOTION.fieldScale
        const y = (THREE.MathUtils.lerp(ty, iy, m) + b * MOTION.amplitude * 0.18) * MOTION.fieldScale
        const z = (THREE.MathUtils.lerp(tz, iz, m) + c * MOTION.amplitude * 0.2) * MOTION.fieldScale

        tmp.set(positions[i3] - hit.x, positions[i3 + 1] - hit.y, positions[i3 + 2] - hit.z)
        const dist = tmp.length()
        if (dist < MOTION.interactionRadius) {
          const f = 1 - dist / MOTION.interactionRadius
          if (dist > 1e-4) tmp.multiplyScalar(1 / dist)

          velocities[i3] += (-tmp.x) * MOTION.attract * f * dt * 60
          velocities[i3 + 1] += (-tmp.y) * MOTION.attract * f * dt * 60
          velocities[i3 + 2] += (-tmp.z) * MOTION.attract * f * dt * 60

          if (repulse > 0.001) {
            velocities[i3] += tmp.x * repulse * f * dt * 60
            velocities[i3 + 1] += tmp.y * repulse * f * dt * 60
            velocities[i3 + 2] += tmp.z * repulse * f * dt * 60
          }
        }

        velocities[i3] += (x - positions[i3]) * 0.015
        velocities[i3 + 1] += (y - positions[i3 + 1]) * 0.015
        velocities[i3 + 2] += (z - positions[i3 + 2]) * 0.015

        velocities[i3] *= MOTION.damping
        velocities[i3 + 1] *= MOTION.damping
        velocities[i3 + 2] *= MOTION.damping

        positions[i3] += velocities[i3] * dt * 60
        positions[i3 + 1] += velocities[i3 + 1] * dt * 60
        positions[i3 + 2] += velocities[i3 + 2] * dt * 60
      }

      pGeo.attributes.position.needsUpdate = true
    }

    const updateLines = () => {
      const maxD2 = Q.lineDistance * Q.lineDistance
      const con = new Uint8Array(sample)
      let seg = 0

      for (let a = 0; a < sample; a++) {
        if (con[a] >= Q.lineMaxConnections) continue
        const ia = sampleIdx[a] * 3
        const ax = positions[ia]
        const ay = positions[ia + 1]
        const az = positions[ia + 2]

        for (let b = a + Q.checkStep; b < sample; b += Q.checkStep) {
          if (con[a] >= Q.lineMaxConnections) break
          if (con[b] >= Q.lineMaxConnections) continue

          const ib = sampleIdx[b] * 3
          const dx = ax - positions[ib]
          const dy = ay - positions[ib + 1]
          const dz = az - positions[ib + 2]
          const d2 = dx * dx + dy * dy + dz * dz

          if (d2 < maxD2) {
            const d = Math.sqrt(d2)
            const fade = 1 - d / Q.lineDistance
            const p = seg * 6

            lPos[p] = ax
            lPos[p + 1] = ay
            lPos[p + 2] = az
            lPos[p + 3] = positions[ib]
            lPos[p + 4] = positions[ib + 1]
            lPos[p + 5] = positions[ib + 2]

            const cr = COLORS.line.r * fade
            const cg = COLORS.line.g * fade
            const cb = COLORS.line.b * fade

            lCol[p] = cr
            lCol[p + 1] = cg
            lCol[p + 2] = cb
            lCol[p + 3] = cr
            lCol[p + 4] = cg
            lCol[p + 5] = cb

            con[a]++
            con[b]++
            seg++
            if (seg >= maxSeg - 1) break
          }
        }
      }

      lGeo.setDrawRange(0, seg * 2)
      lGeo.attributes.position.needsUpdate = true
      lGeo.attributes.color.needsUpdate = true
    }

    const frame = () => {
      const t = clock.getElapsedTime()
      const dt = Math.min(clock.getDelta(), 0.033)

      const orb = t * 0.085
      camera.position.x = Math.cos(orb) * MOTION.cameraRadius
      camera.position.z = Math.sin(orb) * MOTION.cameraRadius
      camera.position.y = MOTION.cameraSway * Math.sin(t * 0.19)
      camera.lookAt(0, 0, 0)

      halo1.rotation.y += 0.0012
      halo2.rotation.x -= 0.001

      updateField(t, dt)
      updateLines()
      renderer.render(scene, camera)
      rafId = window.requestAnimationFrame(frame)
    }

    frame()

    return () => {
      window.cancelAnimationFrame(rafId)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerleave', onPointerLeave)
      window.removeEventListener('click', onClick)
      window.removeEventListener('resize', onResize)

      pGeo.dispose()
      pMat.dispose()
      lGeo.dispose()
      lMat.dispose()
      halo1.geometry.dispose()
      halo1.material.dispose()
      halo2.geometry.dispose()
      halo2.material.dispose()
      renderer.dispose()
    }
  }, [])

  return <canvas id="neural-bg-canvas" className="neural-bg-canvas" ref={canvasRef} aria-hidden="true" />
}
