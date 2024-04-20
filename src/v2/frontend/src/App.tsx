import { createSignal, For, onMount } from 'solid-js'
import * as BABYLON from 'babylonjs'
//import solidLogo from './assets/solid.svg'
//import viteLogo from '/vite.svg'
//import './App.css'

import { RiBusinessSendPlane2Fill } from "solid-icons/ri"
import { Spinner, SpinnerType } from 'solid-spinner'


const DefaultChunks = [
  { id: 1, text: "Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Maecenas porttitor congue massa. Fusce posuere, magna sed pulvinar ultricies, purus lectus malesuada libero, sit amet commodo magna eros quis urna. Nunc viverra imperdiet enim. Fusce est. Vivamus a tellus. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Proin pharetra nonummy pede. Mauris et orci. Aenean nec lorem.", summary: "Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Maecenas porttitor congue massa. Fusce posuere, magna sed pulvinar ultricies, purus lectus malesuada libero, sit amet commodo magna eros quis urna. Nunc viverra imperdiet enim. Fusce est. Vivamus a tellus. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Proin pharetra nonummy pede. Mauris et orci. Aenean nec lorem." },
  { id: 2, text: "Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Maecenas porttitor congue massa. Fusce posuere, magna sed pulvinar ultricies, purus lectus malesuada libero, sit amet commodo magna eros quis urna. Nunc viverra imperdiet enim. Fusce est. Vivamus a tellus. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Proin pharetra nonummy pede. Mauris et orci. Aenean nec lorem.", summary: "Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Maecenas porttitor congue massa. Fusce posuere, magna sed pulvinar ultricies, purus lectus malesuada libero, sit amet commodo magna eros quis urna. Nunc viverra imperdiet enim. Fusce est. Vivamus a tellus. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Proin pharetra nonummy pede. Mauris et orci. Aenean nec lorem." },
  { id: 3, text: "Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Maecenas porttitor congue massa. Fusce posuere, magna sed pulvinar ultricies, purus lectus malesuada libero, sit amet commodo magna eros quis urna. Nunc viverra imperdiet enim. Fusce est. Vivamus a tellus. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Proin pharetra nonummy pede. Mauris et orci. Aenean nec lorem.", summary: "Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Maecenas porttitor congue massa. Fusce posuere, magna sed pulvinar ultricies, purus lectus malesuada libero, sit amet commodo magna eros quis urna. Nunc viverra imperdiet enim. Fusce est. Vivamus a tellus. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Proin pharetra nonummy pede. Mauris et orci. Aenean nec lorem." }
]

const Settings = {
  chunkSize: "512",
  maxTokens: "1024",
  temperature: "0.3"
}

function App() {

  let canvas: HTMLCanvasElement = null!;
  let parentDiv: HTMLDivElement = null!;
  const [size, setSize] = createSignal({ width: 0, height: 0 })

  const [settings, setSettings] = createSignal(Settings)
  const [chunks, setChunks] = createSignal(DefaultChunks)

  onMount(() => {
    // Reset the canvas size
    // the first time
    setSize({ width: parentDiv.clientWidth, height: parentDiv.clientHeight })
    canvas.width = size().width
    canvas.height = size().height
    console.info(size())

    const engine = new BABYLON.Engine(canvas, true); // Generate the BABYLON 3D engine
    const createScene = function () {
      // Creates a basic Babylon Scene object
      const scene = new BABYLON.Scene(engine);
      // Creates and positions a free camera
      const camera = new BABYLON.FreeCamera("camera1",
        new BABYLON.Vector3(0, 5, -10), scene);
      // Targets the camera to scene origin
      camera.setTarget(BABYLON.Vector3.Zero());
      // This attaches the camera to the canvas
      camera.attachControl(canvas, true);
      // Creates a light, aiming 0,1,0 - to the sky
      const light = new BABYLON.HemisphericLight("light",
        new BABYLON.Vector3(0, 1, 0), scene);
      // Dim the light a small amount - 0 to 1
      light.intensity = 0.7;
      // Built-in 'sphere' shape.
      const sphere = BABYLON.MeshBuilder.CreateSphere("sphere",
        { diameter: 2, segments: 32 }, scene);
      // Move the sphere upward 1/2 its height
      sphere.position.y = 1;
      // Built-in 'ground' shape.
      const ground = BABYLON.MeshBuilder.CreateGround("ground",
        { width: 6, height: 6 }, scene);
      return scene;
    };

    const scene = createScene(); //Call the createScene function

    // Register a render loop to repeatedly render the scene
    engine.runRenderLoop(function () {
      scene.render();
    });

    // Watch for browser/canvas resize events
    window.addEventListener("resize", function () {
      setSize({ width: parentDiv.clientWidth, height: parentDiv.clientHeight })
      canvas.width = size().width
      canvas.height = size().height
      console.info(size())
      engine.resize();
    });
  })

  return (
    <>
      <header class="flex p-2 h-[40px] bg-slate-400 dark:bg-slate-950 dark:marker:text-white items-center">
        <h1 class="font-bold text-lg dark:text-white">GPT Summarizer Commander</h1>
      </header>
      <section class="bg-slate-300 dark:bg-slate-900 flex md:p-2 h-[0px] md:h-[40px] invisible md:visible md:space-x-2">
        <label class="dark:text-white uppercase outline-none font-semibold">Chunk Size</label>
        <input class="w-20 px-1" type="number"
          value={settings().chunkSize}
          onInput={(e) => setSettings({ ...settings(), chunkSize: e.currentTarget.value })} />
        <label class="dark:text-white uppercase outline-none font-semibold">Max Tokens</label>
        <input class="w-20 px-1" type="number"
          value={settings().maxTokens}
          onInput={(e) => setSettings({ ...settings(), maxTokens: e.currentTarget.value })}
        />
        <label class="dark:text-white uppercase outline-none font-semibold">Temperature</label>
        <input class="w-20 px-1" type="number"
          value={settings().temperature}
          onInput={(e) => setSettings({ ...settings(), temperature: e.currentTarget.value })}
        />
      </section>
      <section class="bg-slate-100 dark:bg-slate-800 flex">
        <div class="w-full md:w-2/3">
          <main class="h-[calc(100vh-80px-125px)] md:h-[calc(100vh-120px-125px)] p-4 flex flex-col space-y-2 md:space-y-4 overflow-auto">
            <div class="bg-slate-200 dark:bg-slate-600 dark:text-white rounded-lg p-2 w-[90%] ml-auto">
              <div class='prose dark:prose-invert'>
                <h2>Test</h2>
              </div>
            </div>
            <div class="bg-slate-200 dark:bg-slate-600 dark:text-white rounded-lg p-2 w-[90%]">
              <div class='prose dark:prose-invert'>
                <h2>Test</h2>
              </div>
            </div>
            <div class="bg-slate-200 dark:bg-slate-600 dark:text-white rounded-lg p-2 w-[90%] ml-auto">
              <Spinner type={SpinnerType.puff} class='text-blue-600 dark:text-white h-8' />
            </div>
          </main>
          <div class="bg-slate-100 dark:bg-slate-800 h-[125px] p-4 flex flex-row">
            <div class="flex flex-row w-full bg-white border-b-4 border-b-blue-600">
              <textarea class="p-2 w-full resize-none outline-none"></textarea>
              <button class="px-2 text-2xl text-slate-700 outline-none"><RiBusinessSendPlane2Fill /></button>
            </div>
          </div>
        </div>
        <aside class="invisible md:block md:w-1/3 bg-white dark:bg-slate-700">
          <div class="hidden md:flex md:flex-col visible md:p-2 dark:text-slate-200 space-y-2 md:h-[calc(100vh-120px)] overflow-auto">
            <label class="font-bold">Prompt <span class='dark:bg-black dark:text-white px-2 rounded-xl bg-blue-600 text-white'>0</span></label>
            <div class='min-h-[200px] overflow-auto'>
              <p>Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Maecenas porttitor congue massa. Fusce posuere, magna sed pulvinar ultricies, purus lectus malesuada libero, sit amet commodo magna eros quis urna. Nunc viverra imperdiet enim. Fusce est. Vivamus a tellus. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Proin pharetra nonummy pede. Mauris et orci. Aenean nec lorem.</p>
            </div>
            <label class="font-bold">Chunks and Summaries</label>
            <For each={chunks()}>
              {chunk => (
                <div class="bg-slate-200 dark:bg-slate-700 dark:text-white rounded-lg p-2 ml-auto min-h-[200px] flex flex-col space-y-2 overflow-y-auto">
                  <label class='font-semibold uppercase'>Chunk <span class='dark:bg-black bg-blue-600 text-white dark:text-white px-2 rounded-xl'>{chunk.id}</span></label>
                  <p>{chunk.text}</p>
                  <hr />
                  <label>Summary <span class='dark:bg-black bg-blue-600 text-white dark:text-white px-2 rounded-xl'>0</span></label>
                  <p>{chunk.summary}</p>
                </div>
              )}
            </For>

          </div>
        </aside>
      </section>
      <div id="3d" class='absolute top-[40px] md:top-[80px] text-white'>
        <div class='w-full md:w-2/3 h-[calc(100vh-80px-125px)] md:h-[calc(100vh-120px-125px)] md:flex' ref={parentDiv}>
          <canvas id="area" ref={canvas} />
        </div>
        <div class='w-1/3 md:hidden'></div>
      </div>
      <footer class="bg-slate-400 dark:bg-slate-900 flex text-white h-[40px] px-2 items-center"><label>Footer</label></footer>
    </>
  )
}

export default App
