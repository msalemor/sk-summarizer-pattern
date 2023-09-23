//import { useState } from 'react'
//import reactLogo from './assets/react.svg'
//import viteLogo from '/vite.svg'
//import './App.css'
import ReactMarkdown from 'react-markdown'
import axios from "axios"
import { useState } from "react"

const Settings = {
  chunk_size: "1000",
  max_tokens: "2000",
  temperature: "0.3"
}

const SampleData = "**Introduction to Azure API Management**\nAzure API Management is a robust and versatile service provided by Microsoft Azure, designed to simplify the process of creating, deploying, and managing APIs (Application Programming Interfaces). APIs are essential for enabling communication between different software applications and services. Azure API Management acts as a gateway, allowing organizations to publish APIs securely to external partners or internal teams while providing powerful features for monitoring, security, and analytics. This service plays a pivotal role in modern application development by ensuring seamless integration and efficient management of APIs.\n\n**Key Features and Benefits**\nAzure API Management offers a wide array of features that streamline the API lifecycle. One of its primary advantages is the ability to transform and expose existing services as APIs, making it easier to share data and functionalities across diverse applications. It provides robust security mechanisms, including authentication and authorization, to safeguard APIs and data. Additionally, it offers comprehensive analytics, enabling organizations to gain valuable insights into API usage, performance, and trends. Azure API Management also includes developer portals that make it simple for internal and external developers to discover, test, and utilize APIs, enhancing collaboration and innovation.\n\n**API Creation and Configuration**\nCreating and configuring APIs in Azure API Management is a straightforward process. Users can define API endpoints, specify routing rules, and set up request and response transformations. It supports various protocols, including HTTP, HTTPS, and REST, providing flexibility for different application requirements. Moreover, API developers can apply policies to control traffic, add authentication mechanisms, and implement rate limiting to ensure fair usage and prevent misuse of APIs. This level of customization allows organizations to tailor APIs to their specific needs.\n\n**Scalability and Performance **\nAzure API Management is designed with scalability and high availability in mind. It offers auto-scaling capabilities to handle varying levels of API traffic, ensuring consistent performance even during peak loads. The service leverages Azure's global network of data centers, allowing organizations to deploy APIs closer to their users, reducing latency and improving response times. With built-in caching, Azure API Management can also enhance the overall efficiency of API responses, reducing the load on backend services.\n\n**Conclusion **\nIn conclusion, Azure API Management is a valuable tool for organizations seeking to streamline API development and management. It empowers businesses to expose their services securely to a wide range of consumers, whether they are internal teams, partners, or external developers. With robust security, analytics, and customization features, Azure API Management simplifies the process of building and maintaining APIs while ensuring high performance and reliability. By leveraging this service, organizations can accelerate their digital transformation initiatives and better meet the demands of today's interconnected software landscape.";

interface ISummary {
  content: string,
  summary: string
}

const App = () => {
  const [status, setStatus] = useState("Please enter the input text and click Process")
  const [settings, setSettings] = useState(Settings)
  const [inText, setInText] = useState(SampleData)
  const [prompt, setPrompt] = useState("Summarize the following content. List risk items.\n\n\nText: \"\"\"\n<TEXT>\n\"\"\"\nUse only the provided text.")
  const [outText, setOutText] = useState("")
  const [summaries, setSummaries] = useState<ISummary[]>([])

  const Clear = () => {
    setInText("")
    setOutText("")
    setSummaries([])
    setStatus("Please enter the input text and click Process")
  }

  const Process = async () => {
    setOutText("")
    setSummaries([])
    setStatus("Processing...")
    const payload = {
      prompt,
      content: inText,
      chunk_size: settings.chunk_size ?? 1000,
      max_tokens: settings.max_tokens ?? 2000,
      temperature: settings.temperature ?? 0.3
    };
    const resp = await axios.post("api/summarize", payload)
    const data = resp.data;
    setOutText(data.content)
    setSummaries(data.summaries)
    setStatus("Please enter the input text and click Process")
  }
  return (
    <>
      <nav className="bg-slate-900 text-white p-3 font-bold">
        SK Summarizer
      </nav>
      <div className="p-2 text-white bg-slate-800 flex flex-row space-x-2 items-center">
        <label className="font-bold text-sm uppercase">Text Chunk Size (2.5k):</label>
        <input
          value={settings.chunk_size}
          onChange={(e) => setSettings({ ...settings, chunk_size: e.target.value })}
          className="px-1 text-black backdrop:border w-16 "></input>
        <label className="font-bold text-sm uppercase">Max Tokens (4k):</label>
        <input
          value={settings.max_tokens}
          onChange={(e) => setSettings({ ...settings, max_tokens: e.target.value })}
          className="px-1 text-black border w-16"></input>
        <label className="font-bold text-sm uppercase">Temperature (0.0-2.0):</label>
        <input
          value={settings.temperature}
          onChange={(e) => setSettings({ ...settings, temperature: e.target.value })}
          className="px-1 text-black border w-16"></input>
      </div>
      <main className="container mx-auto flex flex-col space-y-3">
        <label className="font-bold text-sm uppercase">Prompt</label>
        <label><span className="font-bold">Note: </span>You may adjust the prompt template here</label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="p-2 border rounded" rows={5}></textarea>
        <div className="flex flex-row space-x-2">
          <button
            onClick={Process}
            className="p-2 w-32 rounded bg-blue-900 text-white">Process</button>
          <button
            onClick={Clear}
            className="p-2 w-32 rounded bg-red-800 text-white">Reset</button>
        </div>
        <div className="flex flex-row">
          {/* input */}
          <div className="flex flex-col w-1/2 p-2">
            <label className="font-bold text-sm uppercase">Input Text (Tokens: {inText.split(' ').length})</label>
            <textarea
              value={inText}
              onChange={(e) => setInText(e.target.value)}
              className="p-2 border rounded" rows={30}></textarea>
          </div>
          <div className="flex flex-col w-1/2 p-2">
            {/* output */}
            <label className="font-bold text-sm uppercase">Summary (Chunks: {summaries.length})</label>
            {outText ? <>
              {/* <textarea
                value={outText}
                className="p-2 border rounded bg-slate-300" rows={10} readOnly></textarea> */}
              <div className=' bg-slate-300 p-2 round-xl'>
                <ReactMarkdown children={outText} />
              </div>
            </> : <>
              <label className="text-sm uppercase">{status}</label>
            </>}
          </div>
        </div>
      </main>
    </>
  )
}

export default App