"use client"

import React, { useEffect, useRef, useState } from 'react';
import Matter, { Engine, Render, Runner, Bodies, Composite, Events, Body } from 'matter-js';

const Game = () => {
  const sceneRef = useRef(null);
  const gameWindowRef = useRef(null);
  const [rocketPos, setRocketPos] = useState({ x: 400, y: 300, angle: 0 });

  useEffect(() => {
    if (!sceneRef.current) return;

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
    const rocket1 = Bodies.rectangle(600, 400, 33, 15, {
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
      mass: 10,
      friction: 0,
      angle: 0,
      frictionAir: 0.00,
      chamfer: { radius: 4 },
    })

    const rocket2 = Bodies.rectangle(200, 400, 33, 15, {
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
      mass: 10,
      friction: 0,
      angle: Math.PI,
      frictionAir: 0.00,
      chamfer: { radius: 4 },
    })


    // const ground = Bodies.rectangle(400, 610, 810, 60, { isStatic: true });
    Composite.add(engine.world, [rocket1, rocket2]);

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
    });

    const handleWindowResize = () => {
      if (gameWindowRef.current == null) return;
      // get the current window size
      const width = (gameWindowRef.current as HTMLElement).clientWidth;
      const height = (gameWindowRef.current as HTMLElement).clientHeight;

      // set the render size to equal window size
      render.bounds.max.x = width - 2;
      render.bounds.max.y = height - 2;
      render.options.width = width - 2;
      render.options.height = height - 2;
      Render.setPixelRatio(render, window.devicePixelRatio);

      // update the render bounds to fit the scene
      Render.lookAt(render, Composite.allBodies(engine.world), {
        x: 50,
        y: 50
      });
    }
    handleWindowResize(); // set initial size

    window.addEventListener('keydown', handleKeyEvent(true));
    window.addEventListener('keyup', handleKeyEvent(false));
    window.addEventListener('resize', handleWindowResize);

    // unmount
    return () => {
      Matter.Render.stop(render);
      Matter.World.clear(engine.world, false);
      Matter.Engine.clear(engine);
    };
  }, [sceneRef, gameWindowRef, setRocketPos]);


  return <div className='h-dvh w-dvw m-auto max-w-4xl bg-gray-900 rounded-md' ref={gameWindowRef}>
    <div className='border border-gray-700 rounded-lg overflow-hidden' ref={sceneRef} />
  </div>
};

export default Game;
