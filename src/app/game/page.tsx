"use client"

import React, { Ref, useEffect, useRef, useState } from 'react';
import Matter, { Engine, Render, Runner, Bodies, Composite, Events, Body } from 'matter-js';
//@ts-expect-error lib has no typing : (
import MatterAttractors from 'matter-attractors';
import { getRandom } from '@/helper/mathHelper';
import { genBlackHole, handleWindowResize, renewBlackHole } from '@/helper/matterHelper';

const Game = () => {
  const sceneRef = useRef(null);
  const gameWindowRef = useRef<HTMLElement>(null);
  const [rocketPos, setRocketPos] = useState({ x: 400, y: 300, angle: 0 });
  const [winner, setWinner] = useState({ active: false, name: '', draw: false });
  const [startCountdown, setStartCountdown] = useState(3);
  const [randomEventsCounter, setRandomEventsCounter] = useState(0);
  const [blackHole, setBlackHole] = useState<Body>();
  const [render, setRender] = useState<Render>();

  useEffect(() => {
    if (startCountdown !== 0) return
    if (!sceneRef.current) return;
    Matter.use(MatterAttractors);

    const engine = Engine.create();
    engine.gravity.y = 0;

    const render = Render.create({
      element: sceneRef.current,
      engine: engine,
      options: {
        width: 800,
        height: 600,
        pixelRatio: 1,
        background: '#00000',
        wireframeBackground: '#222',
        hasBounds: false,
        wireframes: false,
        showDebug: true,
        showBroadphase: false,
        showBounds: false,
        showVelocity: false,
        showCollisions: false,
        showSeparations: false,
        showAxes: false,
        showPositions: false,
      }
    });

    // Objects
    const rocket1 = Bodies.rectangle(200, 400, 33, 15, {
      render: {
        visible: true,
        sprite: {
          // texture: '/rocket1.svg',
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
          // texture: '/rocket1.svg',
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

    setBlackHole(blackHole)
    setRender(render)

    Composite.add(engine.world, [...rockets]);


    Render.run(render);
    const runner = Runner.create();
    Runner.run(runner, engine);

    // Keys
    const keys = {
      up: false,
      left: false,
      right: false
    };
    const handleKeyEvent = (keydown: boolean) => {
      return (e: KeyboardEvent) => {
        switch (e.key) {
          case 'ArrowUp':
            keys.up = keydown;
            break;
          case 'ArrowLeft':
            keys.left = keydown;
            break;
          case 'ArrowRight':
            keys.right = keydown;
            break;
          default:
            break;
        }
      }
    }


    Events.on(engine, 'beforeUpdate', () => {
      // check if game finished
      if (rockets.reduce((acc, rocket) => acc + (rocket.render.visible ? 1 : 0), 0) <= 1) {
        Render.stop(render);

        if (!winner.active) {
          const remainingRockets = rockets.filter(rocket => rocket.render.visible);
          if (remainingRockets.length === 1) {
            setWinner({ active: true, name: remainingRockets[0].label, draw: false });
          } else {
            setWinner({ active: true, name: '', draw: true });
          }
        }
      }

      const FORCE_MULTIPLIER = 0.001;
      const ANGULAR_MULTIPLIER = 0.8;
      if (keys.up) {
        Body.applyForce(rocket1, rocket1.position, {
          x: Math.cos(rocket1.angle) * FORCE_MULTIPLIER,
          y: Math.sin(rocket1.angle) * FORCE_MULTIPLIER
        });
      }
      if (keys.left || keys.right) {
        const direction = keys.left ? -1 : 1;
        Body.setAngularVelocity(rocket1, rocket1.angularVelocity + direction * FORCE_MULTIPLIER * ANGULAR_MULTIPLIER);
      }
      setRocketPos({
        x: rocket1.position.x,
        y: rocket1.position.y,
        angle: rocket1.angle + Math.PI / 2
      });

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

    handleWindowResize(gameWindowRef, render, rockets); // set initial size

    window.addEventListener('keydown', handleKeyEvent(true));
    window.addEventListener('keyup', handleKeyEvent(false));
    window.addEventListener('resize', () => handleWindowResize(gameWindowRef, render, rockets));

    // unmount
    return () => {
      Matter.Render.stop(render);
      Matter.World.clear(engine.world, false);
      Matter.Engine.clear(engine);
    };
  }, [sceneRef, gameWindowRef, setRocketPos, startCountdown, setBlackHole]);

  // trigger of random game elements
  useEffect(() => {
    const randomDelay = Math.floor(Math.random() * 10000) + 10000
    const interval = setInterval(() => {
      console.log("starting random event")
      if (!blackHole || !render) return;
      renewBlackHole(blackHole, render)
      setRandomEventsCounter(c => c + 1);
    }, randomDelay)
    return () => clearInterval(interval);
  }, [setRandomEventsCounter, randomEventsCounter, blackHole, render]);

  // Start-Countdown
  useEffect(() => {
    if (startCountdown === 0) return;
    const interval = setInterval(() => {
      setStartCountdown(c => c - 1);
    }, 800);
    return () => clearInterval(interval);
  }, [setStartCountdown, startCountdown]);

  return <div className='h-dvh w-dvw m-auto max-w-4xl bg-gray-900 rounded-md' ref={gameWindowRef as Ref<HTMLDivElement>}>
    <div className='border border-gray-700 rounded-lg overflow-hidden' ref={sceneRef} />

    {startCountdown !== 0 && <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ">
      <div className="relative max-w-xl  text-center rounded-lg bg-gray-100 p-10 shadow-xs">
        <h1 className="text-3xl font-extrabold sm:text-5xl">
          {startCountdown}
        </h1>
    </div>
    </div>
    }
    {winner.active && <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ">
      <div className="relative max-w-xl  text-center rounded-lg bg-gray-100 p-10 shadow-xs">
        <h1 className="text-3xl font-extrabold sm:text-5xl">
          {winner.draw && 'Draw!'}
          {winner.name && `${winner.name} wins!`}
          {/* <strong className="font-extrabold text-red-700 sm:block"> Increase Conversion. </strong> */}
        </h1>
        <a
          className="block rounded-sm mt-8 bg-blue-600 px-12 py-3 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:ring-3 focus:outline-hidden sm:w-auto"
          onClick={() => window.location.reload()}
        >
          Play again
        </a>
      </div>
    </div>
    }

  </div>
};

export default Game;
