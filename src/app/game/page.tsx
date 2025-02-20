"use client"

import React, { Ref, useEffect, useRef, useState } from 'react';
import Matter, { Engine, Render, Runner, Bodies, Composite, Events, Body, World } from 'matter-js';
//@ts-expect-error lib has no typing : (
import MatterAttractors from 'matter-attractors';
import { getRandom } from '@/helper/mathHelper';
import { genAsteroid, genBlackHole, handleWindowResize, objectOnScreen, renewBlackHole } from '@/helper/matterHelper';

const Game = () => {
  const sceneRef = useRef<HTMLElement>(null);
  const gameWindowRef = useRef<HTMLElement>(null);
  const [winner, setWinner] = useState({ active: false, name: '', draw: false });
  const [startCountdown, setStartCountdown] = useState(3);
  const [blackHole, setBlackHole] = useState<Body>();
  const [randomEventsCounter, setRandomEventsCounter] = useState(0);
  const [asteroidCounter, setAsteroidCounter] = useState(0);
  const [render, setRender] = useState<Render>();
  const [world, setWorld] = useState<World>();
  const [winCounter, setWinCounter] = useState<{ [key: string]: number }>({});


  useEffect(() => {
    if (startCountdown !== 0) return
    if (!sceneRef.current) return;
    Matter.use(MatterAttractors);

    const engine = Engine.create();
    engine.gravity.y = 0;

    const matterRenderOptions: Matter.IRenderDefinition = {

      engine: engine,
      options: {
        width: 800,
        height: 600,
        pixelRatio: 1,
        background: '#00000',
        wireframeBackground: '#222',
        hasBounds: false,
        wireframes: false,
        showDebug: process.env.NODE_ENV === "development" ? true : false,
        showBroadphase: false,
        showBounds: false,
        showVelocity: false,
        showCollisions: false,
        showSeparations: false,
        showAxes: false,
        showPositions: false,
      }
    }
    const existingCanvas = sceneRef.current.querySelector('canvas');
    const render = existingCanvas
      ? Render.create({ canvas: existingCanvas, ...matterRenderOptions })
      : Render.create({ element: sceneRef.current, ...matterRenderOptions })

    // Objects
    const rocket1 = Bodies.rectangle(200, 400, 33, 15, {
      render: {
        visible: true,
        sprite: {
          texture: '/rocket-fire-purple.svg',
          xScale: 0.3,
          yScale: 0.3,
          //@ts-expect-error typing-lib and ground truth not in sync (argument missing)
          xOffset: 0.07,
        }
      },
      label: 'Player 1',
      mass: 10,
      friction: 0,
      angle: Math.PI,
      frictionAir: 0.00,
      chamfer: { radius: 4 },
    })
    const rocket2 = Bodies.rectangle(600, 400, 33, 15, {
      render: {
        visible: true,
        sprite: {
          texture: '/rocket-fire-green.svg',
          xScale: 0.3,
          yScale: 0.3,
          //@ts-expect-error typing-lib and ground truth not in sync (argument missing)
          xOffset: 0.07,
        }
      },
      label: 'Player 2',
      mass: 10,
      friction: 0,
      angle: 0,
      frictionAir: 0.00,
      chamfer: { radius: 4 },
    })

    const rockets = [rocket1, rocket2];
    const blackHole = genBlackHole(engine.world, render)

    setRender(render)
    setWorld(engine.world)
    setBlackHole(blackHole)

    Composite.add(engine.world, [...rockets]);

    genAsteroid(engine.world, render, { x: 200, y: 200 })


    Render.run(render);
    const runner = Runner.create();
    Runner.run(runner, engine);

    // Keys
    const keys = [
      {
        up: false,
        left: false,
        right: false,
      },
      {
        up: false,
        left: false,
        right: false,
      }
    ]
    const handleKeyEvent = (keydown: boolean) => {
      return (e: KeyboardEvent) => {
        switch (e.key) {
          case 'w':
            keys[0].up = keydown;
            break;
          case 'a':
            keys[0].left = keydown;
            break;
          case 'd':
            keys[0].right = keydown;
            break;
          case 'ArrowUp':
            keys[1].up = keydown;
            break;
          case 'ArrowLeft':
            keys[1].left = keydown;
            break;
          case 'ArrowRight':
            keys[1].right = keydown;
            break;
          default:
            break;
        }
      }
    }

    const increaseWinCounter = (name: string) => {
      setWinCounter(wc => wc[name] ? { ...wc, [name]: wc[name] + 1 } : { ...wc, [name]: 1 });
    }

    let winnerLocked = false
    Events.on(engine, 'beforeUpdate', () => {
      // check if game finished
      if (rockets.reduce((acc, rocket) => acc + (rocket.render.visible ? 1 : 0), 0) <= 1) {
        Render.stop(render);
        if (!winnerLocked) {
          const remainingRockets = rockets.filter(rocket => rocket.render.visible);
          if (remainingRockets.length === 1) {
            winnerLocked = true;
            setWinner({ active: true, name: remainingRockets[0].label, draw: false });
            increaseWinCounter(remainingRockets[0].label)
          } else {
            winnerLocked = true;
            setWinner({ active: true, name: '', draw: true });
            for (const rocket of remainingRockets) {
              increaseWinCounter(rocket.label)
            }
          }
        }
      }

      const FORCE_MULTIPLIER = 0.001;
      const ANGULAR_MULTIPLIER = 0.8;
      for (const [i, rocket] of rockets.entries()) {
        if (keys[i].up) {
          Body.applyForce(rocket, rocket.position, {
            x: Math.cos(rocket.angle) * FORCE_MULTIPLIER,
            y: Math.sin(rocket.angle) * FORCE_MULTIPLIER
          });
        }
        if (keys[i].left || keys[i].right) {
          const direction = keys[i].left ? -1 : 1;
          Body.setAngularVelocity(rocket, rocket.angularVelocity + direction * FORCE_MULTIPLIER * ANGULAR_MULTIPLIER);
        }
      }


      for (const rocket of rockets) {
        const margin = 7
        if (rocket.position.x < render.bounds.min.x - margin || rocket.position.x > render.bounds.max.x + margin) {
          rocket.render.visible = false;
        }
        if (rocket.position.y < render.bounds.min.y - margin || rocket.position.y > render.bounds.max.y + margin) {
          rocket.render.visible = false;
        }
      }
    })

    handleWindowResize(gameWindowRef, render, rockets,); // set initial size

    window.addEventListener('keydown', handleKeyEvent(true));
    window.addEventListener('keyup', handleKeyEvent(false));
    window.addEventListener('resize', () => handleWindowResize(gameWindowRef, render, rockets));

    // unmount
    return () => {
      Render.stop(render);
      Runner.stop(runner);
      World.clear(engine.world, false);
      Engine.clear(engine);
    };
  }, [sceneRef, gameWindowRef, startCountdown, setBlackHole, setWinner, setRender, setWorld, genAsteroid, genBlackHole, setWinCounter]);

  // trigger of random game elements
  useEffect(() => {
    const randomDelay = Math.floor(Math.random() * 10000) + 7000
    const interval = setInterval(() => {
      if (!blackHole || !render) return;
      console.log("starting random event")
      if (!objectOnScreen(blackHole, render)) {
        renewBlackHole(blackHole, render)
      }
      setRandomEventsCounter(c => c + 1);
    }, randomDelay)
    return () => clearInterval(interval);
  }, [setRandomEventsCounter, randomEventsCounter, blackHole, render]);
  useEffect(() => {
    if (world === undefined || render === undefined) return;
    const randomDelay = Math.floor(Math.random() * 5000) + (1500 - asteroidCounter * 10)
    const interval = setInterval(() => {
      console.log("starting asteroid")
      genAsteroid(world, render)
      if (asteroidCounter > 10 && Math.random() > 0.5) {
        // additional asteroid
        genAsteroid(world, render)
      }
      if (asteroidCounter > 20 && Math.random() > 0.3) {
        // additional asteroid
        genAsteroid(world, render)
      }
      setAsteroidCounter(c => c + 1);
    }, randomDelay)
    return () => clearInterval(interval);
  }, [setAsteroidCounter, asteroidCounter, genAsteroid, world, render]);

  // Start-Countdown
  useEffect(() => {
    if (startCountdown === 0) return;
    const interval = setInterval(() => {
      setStartCountdown(c => c - 1);
    }, 800);
    return () => clearInterval(interval);
  }, [setStartCountdown, startCountdown]);

  const restartGame = () => {
    setWinner({ active: false, name: '', draw: false });
    setStartCountdown(3);
  }

  return (
    <div className='h-dvh w-dvw m-auto max-w-4xl bg-gray-900  text-gray-950 rounded-md' ref={gameWindowRef as Ref<HTMLDivElement>}>
      <div className='border border-gray-700  rounded-md overflow-hidden' ref={sceneRef as Ref<HTMLDivElement>} />

      <div className="fixed  top-1/2 -translate-y-1/2 left-0 ">
        <div className="relative text-center rounded-lg bg-gray-100 p-5 m-2 opacity-60 lg:opacity-100 shadow-xs">
          <h1 className="text-3xl font-extrabold sm:text-5xl">
            {winCounter['Player 1'] || 0}
          </h1>
        </div>
      </div>
      <div className="fixed  top-1/2 -translate-y-1/2 right-0 ">
        <div className="relative text-center rounded-lg bg-gray-100 p-5 m-2 opacity-60 lg:opacity-100 shadow-xs">
          <h1 className="text-3xl font-extrabold sm:text-5xl">
            {winCounter['Player 2'] || 0}
          </h1>
        </div>
      </div>

      {startCountdown !== 0 && <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ">
        <div className="relative max-w-xl  text-center rounded-lg bg-gray-100 p-10 shadow-xs">
          <h1 className="text-3xl font-extrabold sm:text-5xl">
            {startCountdown}
          </h1>
        </div>
      </div>
      }
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" hidden={!winner.active}>
        <div className="relative max-w-xl  text-center rounded-lg bg-gray-100 p-10 shadow-xs">
          <h1 className="text-3xl font-extrabold sm:text-5xl">
            {winner.draw === true && 'Draw!'}
            {winner.name && `${winner.name} wins!`}
            {/* <strong className="font-extrabold text-red-700 sm:block"> Increase Conversion. </strong> */}
          </h1>
          <a
            className="block rounded-sm mt-8 bg-blue-600 px-12 py-3 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:ring-3 focus:outline-hidden sm:w-auto"
            onClick={restartGame}
            tabIndex={0}
            autoFocus
            onKeyDown={(e) => (
              e.key === "Enter" ? restartGame() : null
            )}
          >
            Play again
          </a>
        </div>
      </div>


    </div>
  )
};

export default Game;
