<script setup lang="ts">
import p5 from 'p5'

const props = defineProps<{
  totalEvents: number
  currentEventIndex: number
  webmentionCount?: number
}>()

const colorMode = useColorMode()
const canvasContainer = ref<HTMLDivElement | null>(null)
let p5Instance: p5 | null = null

const targetEventIndex = ref(0)
const animatedEventIndex = ref(0)

watch(() => props.currentEventIndex, (newIndex) => {
  targetEventIndex.value = newIndex
}, { immediate: true })

onMounted(() => {
  if (!canvasContainer.value) return

  targetEventIndex.value = props.currentEventIndex
  animatedEventIndex.value = props.currentEventIndex

  const sketch = (p: p5) => {
    p.setup = function () {
      const width = canvasContainer.value?.offsetWidth || p.windowWidth
      const canvas = p.createCanvas(width, 60)
      canvas.parent(canvasContainer.value!)
    }

    p.draw = function () {
      const current = animatedEventIndex.value
      const target = targetEventIndex.value
      animatedEventIndex.value = p.lerp(current, target, 0.12)

      const isDark = colorMode.value === 'dark'

      p.clear()

      if (props.totalEvents <= 1) return

      const margin = 60
      const lineWidth = p.width - margin * 2
      const pointSpacing = lineWidth / (props.totalEvents - 1)
      const time = p.frameCount * 0.02

      // Wave parameters
      const numWaves = 10
      const baseAmp = 6
      const baseFreq = 0.01

      // Colors
      const cBack = isDark ? p.color(30, 41, 59, 40) : p.color(219, 234, 254, 40)
      const cFront = isDark ? p.color(30, 58, 138, 180) : p.color(59, 130, 246, 180)

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

        // Island Base (Sand)
        p.noStroke()
        if (isPassed) {
             p.fill(isDark ? p.color(194, 178, 128) : p.color(238, 214, 175))
        } else {
             p.fill(isDark ? p.color(100, 90, 70) : p.color(200, 190, 170))
        }
        p.arc(0, 4, 32, 18, p.PI, p.TWO_PI)

        // Tree Colors
        const trunkColor = isDark ? p.color(101, 67, 33) : p.color(139, 69, 19)
        const leafColor = isPassed
            ? (isDark ? p.color(34, 139, 34) : p.color(50, 205, 50))
            : (isDark ? p.color(20, 60, 20) : p.color(100, 150, 100))

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
            p.fill(isDark ? p.color(60, 40, 20) : p.color(100, 70, 40))
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
      p.fill(isDark ? p.color(139, 69, 19) : p.color(160, 82, 45))
      p.stroke(isDark ? 255 : 0)
      p.strokeWeight(1)
      p.arc(0, 0, 24, 16, 0, p.PI)

      // Mast
      p.stroke(isDark ? 150 : 80)
      p.strokeWeight(2)
      p.line(0, 0, 0, -18)

      // Sail
      p.fill(isDark ? 220 : 255)
      p.stroke(isDark ? 255 : 0)
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

        const finColor = isDark ? p.color(50, 60, 70) : p.color(80, 90, 100)
        // Dorsal fin (visible above water sometimes)
        p.fill(finColor)
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
  if (p5Instance) {
    p5Instance.remove()
    p5Instance = null
  }
})
</script>

<template>
  <div
      ref="canvasContainer"
      class="fixed bottom-0 left-0 right-0 z-40 pointer-events-none"
  />
</template>
