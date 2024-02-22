import express, { NextFunction, Request, Response } from 'express';

import cookieParser from 'cookie-parser';
import cors from 'cors';
import * as dotenv from 'dotenv';
import fs from 'fs';
import http from 'http';
import { HttpError } from './src/helper/HttpError';
import * as Router from './src/router'

import { Client, ClientOptions } from "@elastic/elasticsearch";
import { OpenAI , ChatOpenAI} from "@langchain/openai"
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { CheerioWebBaseLoader } from "langchain/document_loaders/web/cheerio";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { OpenAIEmbeddings } from "@langchain/openai";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import {
  ElasticClientArgs,
  ElasticVectorSearch,
} from "@langchain/community/vectorstores/elasticsearch";
import { Document } from "@langchain/core/documents";
import { VectorDBQAChain } from "langchain/chains";

dotenv.config();
// use env data 
const openAIApiKey =  process.env.OPEN_AI_API
console.log(openAIApiKey)

const chatModel = new ChatOpenAI({
  openAIApiKey: openAIApiKey
});

const outputParser = new StringOutputParser();

//const embeddings = new OpenAIEmbeddings();
const splitter = new RecursiveCharacterTextSplitter();
const embeddings = new OpenAIEmbeddings({
  openAIApiKey: openAIApiKey
});
const loader = new CheerioWebBaseLoader(
  "https://docs.smith.langchain.com/user_guide"
);
const getDocs = async () => {
const docs = await loader.load();

console.log(docs.length);
console.log(docs[0].pageContent.length);

// split the documents into smaller pieces
const splitDocs = await splitter.splitDocuments(docs);
console.log(splitDocs.length);
console.log(splitDocs[0].pageContent.length);

/* const vectorstore = await MemoryVectorStore.fromDocuments(
  splitDocs,
  embeddings
); */
}
//getDocs()

const checkApir = async () => {
 const response = await chatModel.invoke("日本語で話せますか?");
 if (response) {
   console.log(response)
 }
}
//checkApi()

const input = "ここにユーザーの入力や必要な値をセット";

const prompt = ChatPromptTemplate.fromMessages([
  ["system","You are a world class funny documentation writer who can speak Japanese."],
  ["user", "{input}"],
]);

const chain = prompt.pipe(chatModel);
const checkApi = async () => {
 const response = await chain.invoke({ input: "眠い"});
 if (response) {
   console.log(response)
 }
}
//checkApi()


const llmChain = prompt.pipe(chatModel).pipe(outputParser);
const handleOutputParser = async () => {
  const response = await  llmChain.invoke({
  input: "what is LangSmith?",
});

  if (response) {
    console.log(response)
  }
 }
 //handleOutputParser()

const app: express.Express = express()

const server: http.Server = http.createServer(app);

const port = process.env.PORT || 8080
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

app.use(cors({
  origin: frontendUrl,
  credentials: true
}))
app.use(cookieParser());
app.use(express.json())

const v1 = "/api/v1"

app.get(`/`, async (req, res) => {
  const text = 'hello world 123'
  try {
    const response = await embeddings.embedDocuments([text]);
    // OpenAIを使用してテキストからベクトルを生成
    console.log(response)
    //const response = await embeddings.embedDocuments([text]);

    //const vector = response.embeddings[0].embedding;

    // ベクトルをデータベースに保存

    res.send({ success: true, message: 'Message and vector saved successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).send({ success: false, message: 'An error occurred.' });
  }

})


app.use(`${v1}/`,/* middleware */Router.mainRoutes);

// Error Handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof HttpError) {
    console.log(err.message);
    res.status(err.statusCode).send(err.message);
  } else {
    res.status(500).send('Internal Server Error');
  }
});


server.listen(port, () => {
  console.log(`Server listening on port ${port}`)
})



export async function run() {
  const config: ClientOptions = {
    node: process.env.ELASTIC_URL ?? "http://127.0.0.1:9200",
  };
  if (process.env.ELASTIC_API_KEY) {
    config.auth = {
      apiKey: process.env.ELASTIC_API_KEY,
    };
  } else if (process.env.ELASTIC_USERNAME && process.env.ELASTIC_PASSWORD) {
    config.auth = {
      username: process.env.ELASTIC_USERNAME,
      password: process.env.ELASTIC_PASSWORD,
    };
  }
  const clientArgs: ElasticClientArgs = {
    client: new Client(config),
    indexName: process.env.ELASTIC_INDEX ?? "test_vectorstore",
  };

  // Index documents

  const docs = [
    new Document({
      metadata: { foo: "bar" },
      pageContent: "Elasticsearch is a powerful vector db",
    }),
    new Document({
      metadata: { foo: "bar" },
      pageContent: "the quick brown fox jumped over the lazy dog",
    }),
    new Document({
      metadata: { baz: "qux" },
      pageContent: "lorem ipsum dolor sit amet",
    }),
    new Document({
      metadata: { baz: "qux" },
      pageContent:
        "Elasticsearch a distributed, RESTful search engine optimized for speed and relevance on production-scale workloads.",
    }),
  ];

  const embeddings = new OpenAIEmbeddings();

  // await ElasticVectorSearch.fromDocuments(docs, embeddings, clientArgs);
  const vectorStore = new ElasticVectorSearch(embeddings, clientArgs);

  // Also supports an additional {ids: []} parameter for upsertion
  const ids = await vectorStore.addDocuments(docs);

  /* Search the vector DB independently with meta filters */
  const results = await vectorStore.similaritySearch("fox jump", 1);
  console.log(JSON.stringify(results, null, 2));
  /* [
        {
          "pageContent": "the quick brown fox jumped over the lazy dog",
          "metadata": {
            "foo": "bar"
          }
        }
    ]
  */

  /* Use as part of a chain (currently no metadata filters) for LLM query */
  const model = new OpenAI();
  const chain = VectorDBQAChain.fromLLM(model, vectorStore, {
    k: 1,
    returnSourceDocuments: true,
  });
  const response = await chain.call({ query: "What is Elasticsearch?" });

  console.log(JSON.stringify(response, null, 2));
  /*
    {
      "text": " Elasticsearch is a distributed, RESTful search engine optimized for speed and relevance on production-scale workloads.",
      "sourceDocuments": [
        {
          "pageContent": "Elasticsearch a distributed, RESTful search engine optimized for speed and relevance on production-scale workloads.",
          "metadata": {
            "baz": "qux"
          }
        }
      ]
    }
    */

  await vectorStore.delete({ ids });

  const response2 = await chain.call({ query: "What is Elasticsearch?" });

  console.log(JSON.stringify(response2, null, 2));

  /*
    []
  */
}
