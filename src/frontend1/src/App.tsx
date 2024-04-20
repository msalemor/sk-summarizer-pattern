import { makePersisted } from '@solid-primitives/storage'
import { createSignal, For } from 'solid-js'
import { Spinner, SpinnerType } from 'solid-spinner'
import { SolidMarkdown } from 'solid-markdown'

// import solidLogo from './assets/solid.svg'
// import viteLogo from '/vite.svg'
// import './App.css'
//import { Spinner, SpinnerType } from 'solid-spinner'

const Settings = {
  chunk_size: "1000",
  max_tokens: "2000",
  temperature: "0.3"
}

const URI = "api/summarize"
const DEFAULT_MSG = "Please enter a prompt or a prompt template above, enter optional input text, and click Process"
const ERROR_MSG = "Unable to process the request. Make sure you have entered a prompt or prompt template and you have set the chunk size, max token size, and temperature."
const SampleData = "**Introduction to Azure API Management**\nAzure API Management is a robust and versatile service provided by Microsoft Azure, designed to simplify the process of creating, deploying, and managing APIs (Application Programming Interfaces). APIs are essential for enabling communication between different software applications and services. Azure API Management acts as a gateway, allowing organizations to publish APIs securely to external partners or internal teams while providing powerful features for monitoring, security, and analytics. This service plays a pivotal role in modern application development by ensuring seamless integration and efficient management of APIs.\n\n**Key Features and Benefits**\nAzure API Management offers a wide array of features that streamline the API lifecycle. One of its primary advantages is the ability to transform and expose existing services as APIs, making it easier to share data and functionalities across diverse applications. It provides robust security mechanisms, including authentication and authorization, to safeguard APIs and data. Additionally, it offers comprehensive analytics, enabling organizations to gain valuable insights into API usage, performance, and trends. Azure API Management also includes developer portals that make it simple for internal and external developers to discover, test, and utilize APIs, enhancing collaboration and innovation.\n\n**API Creation and Configuration**\nCreating and configuring APIs in Azure API Management is a straightforward process. Users can define API endpoints, specify routing rules, and set up request and response transformations. It supports various protocols, including HTTP, HTTPS, and REST, providing flexibility for different application requirements. Moreover, API developers can apply policies to control traffic, add authentication mechanisms, and implement rate limiting to ensure fair usage and prevent misuse of APIs. This level of customization allows organizations to tailor APIs to their specific needs.\n\n**Scalability and Performance **\nAzure API Management is designed with scalability and high availability in mind. It offers auto-scaling capabilities to handle varying levels of API traffic, ensuring consistent performance even during peak loads. The service leverages Azure's global network of data centers, allowing organizations to deploy APIs closer to their users, reducing latency and improving response times. With built-in caching, Azure API Management can also enhance the overall efficiency of API responses, reducing the load on backend services.\n\n**Conclusion **\nIn conclusion, Azure API Management is a valuable tool for organizations seeking to streamline API development and management. It empowers businesses to expose their services securely to a wide range of consumers, whether they are internal teams, partners, or external developers. With robust security, analytics, and customization features, Azure API Management simplifies the process of building and maintaining APIs while ensuring high performance and reliability. By leveraging this service, organizations can accelerate their digital transformation initiatives and better meet the demands of today's interconnected software landscape.";
const DEFAULT_TEMPLATE = "Summarize the following content in one paragraph. List the risk items in single sentences.\n\n\nText: \"\"\"\n<TEXT>\n\"\"\"\nUse only the provided text."

interface ISummary {
  content: string,
  summary: string
}

interface IResponse {
  content: string,
  summaries: ISummary[]
}

function App() {
  const [status, setStatus] = createSignal(DEFAULT_MSG)
  const [settings, setSettings] = makePersisted(createSignal(Settings))
  const [inText, setInText] = makePersisted(createSignal(SampleData))
  const [prompt, setPrompt] = makePersisted(createSignal(DEFAULT_TEMPLATE))
  // TODO: This is a workaround for the SolidMarkdown component not updating when the text changes as a string
  const [outText, setOutText] = createSignal<string[]>([])
  const [summaries, setSummaries] = createSignal<ISummary[]>([])
  const [chunk, _] = createSignal(true)
  const [processing, setProcessing] = createSignal(false)


  const Process = () => {
    setStatus("Processing...")
    setOutText([])
    setSummaries([])
    const chunkStat = chunk()
    console.info("Processing chunk: ", chunkStat)
    let test: IResponse = {
      content: inText(),
      summaries: []
    }
    console.info("Processing: ", test, URI, ERROR_MSG)
    setProcessing(true)
  }
  const Clear = () => { }

  return (
    <>
      <nav class="bg-purple-950 text-white p-3 font-bold h-[50px]">
        SK Summarizer
      </nav>
      <div class="p-2 text-white bg-purple-900 flex flex-row space-x-2 items-center h-[50px]">
        <label class="font-bold text-sm uppercase">Text Chunk Size (2.5k):</label>
        <input
          value={settings().chunk_size}
          onChange={(e) => setSettings({ ...settings(), chunk_size: e.target.value })}
          class="px-1 text-black backdrop:border w-16 "></input>
        <label class="font-bold text-sm uppercase">Max Tokens (4k):</label>
        <input
          value={settings().max_tokens}
          onChange={(e) => setSettings({ ...settings(), max_tokens: e.target.value })}
          class="px-1 text-black border w-16"></input>
        <label class="font-bold text-sm uppercase">Temperature (0.0 - 2.0):</label>
        <input
          value={settings().temperature}
          onChange={(e) => setSettings({ ...settings(), temperature: e.target.value })}
          class="px-1 text-black border w-16"></input>
      </div>
      <main class="mx-10 p-2 flex flex-col space-y-3">
        <label class="font-bold text-sm uppercase">Prompt (<span>{inText().split("").length})</span></label>
        <textarea
          value={prompt()}
          onchange={(e) => setPrompt(e.target.value)}
          class="p-2 border rounded" rows={7}></textarea>
        <div>
          <strong>Note: </strong>In the prompt, use the <code>&lt;TEXT&gt;</code> placeholder to indicate where the text resource below should be inserted.
        </div>
        <div class="flex flex-row space-x-2">
          <button
            onClick={Process}
            class="p-2 w-32 rounded bg-purple-950 hover:bg-purple-900 text-white text-sm font-semibold">
            <div class="flex flex-row w-full justify-center space-x-3">
              <span>Process {processing() && <Spinner type={SpinnerType.puff} color="white" class="inline-block" height={20} />}</span>
            </div>
          </button>
          <button
            onClick={Clear}
            class="p-2 w-32 rounded bg-red-800 hover:bg-red-700 text-white text-sm font-semibold">Reset</button>
        </div>
        <div class="flex flex-row">
          {/* input */}
          <div class={"flex flex-col p-2 " + (summaries().length > 1 ? "w-1/3" : "w-1/2")}>
            <label class="font-bold text-sm uppercase">Text Resource (Tokens: {inText().split("").length})</label>
            <textarea
              value={inText()}
              oninput={(e) => setInText(e.target.value)}
              class="p-2 border rounded" rows={30}></textarea>
          </div>
          <div class={"flex flex-col p-2 " + (summaries().length > 1 ? "w-1/3" : "hidden")}>
            <label class="font-bold text-sm uppercase">Chunk Details (Chunks: {summaries().length})</label>
            {summaries().length > 0 ? <>
              <For each={summaries()}>{(chunkSummary, idx) =>
                <div class="flex flex-col w-full border rounded-md mb-2">
                  <div class="p-1 flex flex-col bg-teal-50">
                    <label class="bg-slate-800 text-white text-sm font-semibold uppercase">Chunk text - {idx() + 1}</label>
                    <hr />
                    {chunkSummary.content}
                  </div>
                  <div class="p-1 flex flex-col bg-teal-100">
                    <label class="bg-slate-800 text-white text-sm font-semibold uppercase">Summary - {idx() + 1}</label>
                    <hr />
                    {chunkSummary.summary}</div>
                </div>
              }
              </For>
            </> : <>
            </>}
          </div>
          <div class={"flex flex-col p-2 " + (summaries().length > 1 ? "w-1/3" : "w-1/2")}>
            {/* output */}
            <label class="font-bold text-sm uppercase">Summary (Chunks: {summaries().length})</label>
            {outText ? <>
              {/* <textarea
                value={outText}
                class="p-2 border rounded bg-slate-300" rows={10} readOnly></textarea> */}
              <div class=' bg-slate-300 p-2 round-xl overflow-auto'>
                {/* {outText()} */}
                <For each={outText()}>{(text) =>
                  <SolidMarkdown children={text} />
                }
                </For>
              </div>
            </> : <>
              <label class="bg-slate-300 p-2 text-sm uppercase">{status()}</label>
            </>}
          </div>
        </div>
      </main>
    </>
  )
}

export default App
