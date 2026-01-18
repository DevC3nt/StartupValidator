# Reality Check Business Validator

A simple product validator that asks an LLM to be brutally honest about a startup idea.

The most important upgrade in this version is security: the Gemini API key is no longer shipped to the browser. The UI calls a local API and the server talks to Gemini.

## What changed

Frontend improvements

Draft autosave so you do not lose your pitch
Input validation with clear errors
Recent history stored locally so you can compare ideas
Copy and download results as Markdown

Backend improvements

Server side Gemini calls so the key is not exposed
Input and output validation using Zod
Basic rate limiting plus response caching
Prompt injection hardening by treating user input as untrusted

## Run locally

Prerequisites

Node.js 18 or newer

Steps

1 Install dependencies

`npm install`

2 Create a Gemini key and set it in `.env.local`

`GEMINI_API_KEY=your_key_here`

3 Run the app and API together

`npm run dev`

The web app runs on http://localhost:3000

The API runs on http://localhost:8787

## Production build

`npm run build`

Then start the API

`npm start`

Note

You can set `GEMINI_MODEL` if you want to override the default model name.
