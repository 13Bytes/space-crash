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


export const genBlackHole = (composite: Composite, render: Render, location?: { x: number, y: number }, size?: number) => {
  const holeSize = size ? size : Math.random() * 100 + 10

  const randomStartAngle = Math.random() * 2 * Math.PI
  const startPosX = location ? location.x : Math.cos(randomStartAngle) * 500
  const startPosY = location ? location.y : Math.sin(randomStartAngle) * 500

  const travelTroughPoint = [
    getRandom(render.bounds.min.x, render.bounds.max.x),
    getRandom(render.bounds.min.y, render.bounds.max.y)]

  const dX = travelTroughPoint[0] - startPosX
  const dY = travelTroughPoint[1] - startPosY
  const TRAVEL_FORCE_MULTIPLIER = 0.1
  const travelForces = [dX / Math.sqrt(dX ** 2 + dY ** 2) * TRAVEL_FORCE_MULTIPLIER, dY / Math.sqrt(dX ** 2 + dY ** 2) * TRAVEL_FORCE_MULTIPLIER]

  const body = Bodies.circle(startPosX, startPosY, holeSize, {
    collisionFilter: {
      mask: 0
    },
    force: { x: travelForces[0], y: travelForces[1] },
    inertia: Infinity,
    friction: 0,
    frictionAir: 0,
    render: {
      fillStyle: '#282828',
      strokeStyle: '#000000',
    },
    plugin: {
      attractors: [
        function (bodyA: Body, bodyB: Body) {
          const FORCE_MULTIPLIER = holeSize / 30;
          const dx = (bodyA.position.x - bodyB.position.x)
          const dy = (bodyA.position.y - bodyB.position.y)
          const distance = Math.sqrt(dx ** 2 + dy ** 2)

          const force = distance / Math.abs(distance) * (1 / (distance + 30)) ** 2
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

  Composite.add(composite, body);
  return body
}

export const renewBlackHole = (blackHole: Body, render: Render, location?: { x: number, y: number }, size?: number) => {
  const holeSize = size ? size : Math.random() * 100 + 10

  const randomStartAngle = Math.random() * 2 * Math.PI
  const startPosX = location ? location.x : Math.cos(randomStartAngle) * 1000
  const startPosY = location ? location.y : Math.sin(randomStartAngle) * 1000

  const travelTroughPoint = [
    getRandom(render.bounds.min.x, render.bounds.max.x),
    getRandom(render.bounds.min.y, render.bounds.max.y)]

  const dX = travelTroughPoint[0] - startPosX
  const dY = travelTroughPoint[1] - startPosY
  const travelForces = [dX / Math.sqrt(dX ** 2 + dY ** 2) * 0.1, dY / Math.sqrt(dX ** 2 + dY ** 2) * 0.1]

  Body.setPosition(blackHole, { x: startPosX, y: startPosY })
  Body.applyForce(blackHole, blackHole.position, { x: travelForces[0], y: travelForces[1] })

  return blackHole
}