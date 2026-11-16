<script setup lang="ts">
import p5 from 'p5'

const props = defineProps<{
  totalEvents: number
  currentEventIndex: number
  webmentionCount?: number
}>()

const canvasContainer = ref<HTMLDivElement | null>(null)
let p5Instance: p5 | null = null

// The colours are the theme's. Custom properties are OKLCH; a 1px canvas lets the browser turn
// them into the RGB that p5 wants. Read again whenever the colour scheme changes.
type Rgb = [number, number, number]
const TOKENS = {
  // the sea is the brand itself, day and night, like Gesso's deep paint
  seaFar: '--neutral-300',
  seaNear: '--neutral-600',
  sand: '--pigment-partner',
  sandAhead: '--rule',
  palm: '--ink',
  palmAhead: '--rule-strong',
  coconut: '--pigment-complement',
  hull: '--pigment-complement',
  mast: '--ink',
  sail: '--surface-raised',
  shark: '--ink-muted',
} as const
const palette = {} as Record<keyof typeof TOKENS, Rgb>
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
const darkSystem = window.matchMedia('(prefers-color-scheme: dark)')

const readPalette = function () {
  const ctx = document.createElement('canvas').getContext('2d', { willReadFrequently: true })
  if (!ctx) return
  const style = getComputedStyle(document.documentElement)
  for (const [name, token] of Object.entries(TOKENS) as [keyof typeof TOKENS, string][]) {
    ctx.clearRect(0, 0, 1, 1)
    ctx.fillStyle = style.getPropertyValue(token).trim() || '#000'
    ctx.fillRect(0, 0, 1, 1)
    const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data
    palette[name] = [r ?? 0, g ?? 0, b ?? 0]
  }
  p5Instance?.redraw()
}

const targetEventIndex = ref(0)
const animatedEventIndex = ref(0)

watch(() => props.currentEventIndex, (newIndex) => {
  targetEventIndex.value = newIndex
  // with reduced motion nothing animates: the boat is simply at the new island
  if (reducedMotion.matches) {
    animatedEventIndex.value = newIndex
    p5Instance?.redraw()
  }
}, { immediate: true })

watch(() => [props.totalEvents, props.webmentionCount], () => p5Instance?.redraw())

onMounted(() => {
  if (!canvasContainer.value) return

  targetEventIndex.value = props.currentEventIndex
  animatedEventIndex.value = props.currentEventIndex

  readPalette()
  document.addEventListener('gesso:schemechange', readPalette)
  darkSystem.addEventListener('change', readPalette)

  const sketch = (p: p5) => {
    p.setup = function () {
      const width = canvasContainer.value?.offsetWidth || p.windowWidth
      const canvas = p.createCanvas(width, 60)
      canvas.parent(canvasContainer.value!)
      // the waves never stop; people who ask for less motion get a still picture
      if (reducedMotion.matches) p.noLoop()
    }

    p.draw = function () {
      const current = animatedEventIndex.value
      const target = targetEventIndex.value
      animatedEventIndex.value = p.lerp(current, target, 0.12)

      p.clear()

      if (props.totalEvents <= 1) return

      // on a narrow screen the islands move closer together and get smaller, so they never overlap
      const margin = Math.min(60, p.width * 0.08)
      const lineWidth = p.width - margin * 2
      const pointSpacing = lineWidth / (props.totalEvents - 1)
      const islandScale = Math.min(1, pointSpacing / 40)
      const time = p.frameCount * 0.02

      // Wave parameters
      const numWaves = 10
      const baseAmp = 6
      const baseFreq = 0.01

      // Colors
      const cBack = p.color(...palette.seaFar, 40)
      const cFront = p.color(...palette.seaNear, 180)

      // Draw background waves
      p.noStroke()
      for (let i = 0; i < numWaves; i++) {
        const progress = i / (numWaves - 1)
        const waveColor = p.lerpColor(cBack, cFront, progress)
        p.fill(waveColor)

        // Vary parameters for each wave
        const amp = baseAmp + p.sin(i) * 2
        const freq = baseFreq + (i % 3) * 0.002
        const speed = 1 + (i % 2) * 0.2
        const phase = i * 15

        p.beginShape()
        p.vertex(0, p.height)
        for (let x = 0; x <= p.width; x += 15) {
          const y = p.height / 2 + 5 + p.sin(x * freq + time * speed + phase) * amp
          p.vertex(x, y)
        }
        p.vertex(p.width, p.height)
        p.endShape(p.CLOSE)
      }

      // Track wave parameters (the one the boat rides on)
      const trackFreq = 0.015
      const trackAmp = 6
      const trackPhase = 1
      const trackSpeed = 1



      // Draw Islands (Fixed Y position, but slightly submerged by waves)
      for (let i = 0; i < props.totalEvents; i++) {
        const x = margin + i * pointSpacing
        // Fixed Y position for the island base
        const y = p.height / 2 + 5

        const isPassed = i <= props.currentEventIndex

        p.push()
        p.translate(x, y)
        p.scale(islandScale)

        // Island Base (Sand)
        p.noStroke()
        p.fill(...(isPassed ? palette.sand : palette.sandAhead))
        p.arc(0, 4, 32, 18, p.PI, p.TWO_PI)

        // The palm is a silhouette in ink: full for an island the boat has reached, faint
        // for one still ahead. Reached islands also have coconuts, so it isn't colour alone.
        const trunkColor = p.color(...(isPassed ? palette.palm : palette.palmAhead))
        const leafColor = trunkColor

        // Trunk
        p.fill(trunkColor)
        // Use quad for trunk to avoid vertex issues
        p.quad(-2, 0, -1, -18, 1, -18, 2, 0)

        // Leaves
        p.fill(leafColor)
        p.translate(0, -18) // Top of trunk

        const numLeaves = 6
        for (let j = 0; j < numLeaves; j++) {
            p.push()
            // Spread leaves in a semi-circle upwards
            const angle = p.map(j, 0, numLeaves - 1, p.PI, p.TWO_PI)
            p.rotate(angle)

            // Draw leaf as an ellipse
            p.ellipse(8, 0, 16, 6)
            p.pop()
        }

        // Coconuts (only if passed/active)
        if (isPassed) {
            p.fill(...palette.coconut)
            p.circle(0, 2, 3)
            p.circle(-2, 1, 3)
            p.circle(2, 1, 3)
        }

        p.pop()
      }

      // Draw Boat
      const dotX = margin + animatedEventIndex.value * pointSpacing
      const boatY = p.height / 2 + 5 + p.sin(dotX * trackFreq + time * trackSpeed + trackPhase) * trackAmp

      p.push()
      p.translate(dotX, boatY)

      // Calculate slope for rotation
      const slope = trackAmp * trackFreq * p.cos(dotX * trackFreq + time * trackSpeed + trackPhase)
      p.rotate(p.atan(slope))

      // Hull
      p.fill(...palette.hull)
      p.stroke(...palette.mast)
      p.strokeWeight(1)
      p.arc(0, 0, 24, 16, 0, p.PI)

      // Mast
      p.stroke(...palette.mast)
      p.strokeWeight(2)
      p.line(0, 0, 0, -18)

      // Sail
      p.fill(...palette.sail)
      p.stroke(...palette.mast)
      p.strokeWeight(1)
      p.triangle(0, -18, 0, -4, 14, -8)

      p.pop()

      // Draw Sharks (one per webmention)
      const numSharks = props.webmentionCount || 0
      for (let i = 0; i < numSharks; i++) {
        const sharkOffset = (i * 200) + (time * 80)
        const sharkX = (sharkOffset % (p.width + 100)) - 50
        const sharkDepth = 15 + (i % 3) * 5
        const sharkY = p.height / 2 + sharkDepth + p.sin(sharkX * 0.02 + time * 1.5 + i) * 3

        p.push()
        p.translate(sharkX, sharkY)

        // Dorsal fin (visible above water sometimes)
        p.fill(...palette.shark)
       p.triangle(4, 0, 10, -16, 16, 0)

        p.pop()
      }
    }

    p.windowResized = function () {
      const width = canvasContainer.value?.offsetWidth || p.windowWidth
      p.resizeCanvas(width, 60)
    }
  }

  p5Instance = new p5(sketch)
})

onBeforeUnmount(() => {
  document.removeEventListener('gesso:schemechange', readPalette)
  darkSystem.removeEventListener('change', readPalette)
  if (p5Instance) {
    p5Instance.remove()
    p5Instance = null
  }
})
</script>

<template>
  <!-- decoration: where you are in the story is in the page itself -->
  <div ref="canvasContainer" class="progress-bar" aria-hidden="true"/>
</template>
