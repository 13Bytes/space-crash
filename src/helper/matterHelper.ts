import Matter, { Engine, Render, Runner, Bodies, Composite, Events, Body } from 'matter-js';
import { getRandom } from './mathHelper';


export const handleWindowResize = (gameWindowRef: React.RefObject<HTMLElement | null>, render: Render, focusBodies: Matter.Body[]) => {

  if (gameWindowRef.current == null) return;
  // get the current window size
  const width = gameWindowRef.current.clientWidth;
  const height = gameWindowRef.current.clientHeight;

  // set the render size to equal window size
  render.bounds.max.x = width - 2;
  render.bounds.max.y = height - 2;
  render.options.width = width - 2;
  render.options.height = height - 2;
  Render.setPixelRatio(render, window.devicePixelRatio);

  // update the render bounds to fit the scene
  // Composite.allBodies(engine.world) to look at all bodies
  Render.lookAt(render, focusBodies, { x: 200, y: 200 })
}

const getRandomStartPosOutsideScreen = () => {
  const SCREEN_SIZE = 1000
  const randomStartAngle = Math.random() * 2 * Math.PI
  const startPosX = Math.cos(randomStartAngle) * (SCREEN_SIZE / 2) + SCREEN_SIZE / 2
  const startPosY = Math.sin(randomStartAngle) * (SCREEN_SIZE / 2) + SCREEN_SIZE / 2
  return [startPosX, startPosY]
}

export const objectOnScreen = (obj: Body, render: Render) => {
  const margin = 40
  if (obj.position.x > render.bounds.min.x - margin && obj.position.x < render.bounds.max.x + margin) {
    if (obj.position.y > render.bounds.min.y - margin && obj.position.y < render.bounds.max.y + margin) {
      return true
    }
  }
  return false
}

const TRAVEL_FORCE = 10e-4
export const genBlackHole = (composite: Matter.World, render: Render, location?: { x: number, y: number }, size?: number) => {
  const holeSize = size ? size : Math.random() * 100 + 10

  const randomStartAngle = Math.random() * 2 * Math.PI
  const startPosX = location ? location.x : Math.cos(randomStartAngle) * 400
  const startPosY = location ? location.y : Math.sin(randomStartAngle) * 400

  const travelTroughPoint = [
    getRandom(render.bounds.min.x, render.bounds.max.x),
    getRandom(render.bounds.min.y, render.bounds.max.y)]

  const dX = travelTroughPoint[0] - startPosX
  const dY = travelTroughPoint[1] - startPosY
  const travelForces = [dX / Math.sqrt(dX ** 2 + dY ** 2) * TRAVEL_FORCE, dY / Math.sqrt(dX ** 2 + dY ** 2) * TRAVEL_FORCE]

  const body = Bodies.circle(startPosX, startPosY, holeSize, {
    collisionFilter: {
      mask: 0
    },
    force: { x: travelForces[0], y: travelForces[1] },
    friction: 0,
    frictionAir: 0,
    torque: -0.6,
    render: {
      fillStyle: '#282828',
      strokeStyle: '#000000',
      sprite: {
        texture: '/black-hole.svg',
        xScale: 0.15,
        yScale: 0.15
      }
    },
    plugin: {
      attractors: [
        function (bodyA: Body, bodyB: Body) {
          const FORCE_MULTIPLIER = holeSize / 30;
          const dx = (bodyA.position.x - bodyB.position.x)
          const dy = (bodyA.position.y - bodyB.position.y)
          const distance = Math.sqrt(dx ** 2 + dy ** 2)

          const force = distance / Math.abs(distance) * ((1 / (distance + 30)) ** 2)
          const angle = Math.atan2(dy, dx)
          const yForce = Math.sin(angle) * force
          const xForce = Math.cos(angle) * force
          return {
            x: xForce * FORCE_MULTIPLIER,
            y: yForce * FORCE_MULTIPLIER
          };
        }
      ]
    }
  })
  Body.scale(body, holeSize / 110, holeSize / 110)
  Composite.add(composite, body);
  return body
}

export const renewBlackHole = (blackHole: Body, render: Render, location?: { x: number, y: number }, size?: number) => {
  const holeSize = size ? size : Math.random() * 100 + 10

  const [sx, sy] = getRandomStartPosOutsideScreen()
  const startPosX = location ? location.x : sx
  const startPosY = location ? location.y : sy

  const travelTroughPoint = [
    getRandom(render.bounds.min.x, render.bounds.max.x),
    getRandom(render.bounds.min.y, render.bounds.max.y)]

  const dX = travelTroughPoint[0] - startPosX
  const dY = travelTroughPoint[1] - startPosY
  const travelForces = [dX / Math.sqrt(dX ** 2 + dY ** 2) * TRAVEL_FORCE, dY / Math.sqrt(dX ** 2 + dY ** 2) * TRAVEL_FORCE]

  Body.setPosition(blackHole, { x: startPosX, y: startPosY })
  Body.applyForce(blackHole, blackHole.position, { x: travelForces[0], y: travelForces[1] })
  // Body.scale(blackHole, holeSize / 50, holeSize / 50)
  return blackHole
}

export const genAsteroid = (composite: Matter.World, render: Render, location?: { x: number, y: number }, size?: number) => {
  const TRAVEL_FORCE = 2

  const [sx, sy] = getRandomStartPosOutsideScreen()
  const startPosX = location ? location.x : sx
  const startPosY = location ? location.y : sy

  const travelTroughPoint = [
    getRandom(render.bounds.min.x, render.bounds.max.x),
    getRandom(render.bounds.min.y, render.bounds.max.y)]

  const dX = travelTroughPoint[0] - startPosX
  const dY = travelTroughPoint[1] - startPosY
  const travelForces = [dX / Math.sqrt(dX ** 2 + dY ** 2) * TRAVEL_FORCE, dY / Math.sqrt(dX ** 2 + dY ** 2) * TRAVEL_FORCE]
  const angle = Math.atan2(dY, dX)

  const body = Bodies.rectangle(startPosX, startPosY, 50, 20, {
    force: { x: travelForces[0], y: travelForces[1] },
    angle: angle,
    mass: 100,
    friction: 0,
    frictionAir: 0,
    chamfer: { radius: 4 },
    render: {
      sprite: {
        texture: '/asteroid.svg',
        xScale: 0.3,
        yScale: 0.3,
        //@ts-expect-error typing-lib and ground truth not in sync (argument missing)
        xOffset: 0.07,
      }
    },
  })
  Composite.add(composite, body);
  return body
}