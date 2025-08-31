import { ChromaClient } from "chromadb";
import csv from "csv-parser";
import fs from "fs";
import dotenv from 'dotenv';
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const genai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GEN_AI_API_KEY });
const chromaClient = new ChromaClient();

// Cria a coleção com a dimensão correta de 384
const collection = await chromaClient.getOrCreateCollection({
  name: "movies_gemini",
  embedding_dimension: 384,
  space: "cosine",
});

const ids = [];
const documents = [];
const metadatas = [];

// Lê o CSV e prepara os dados
fs.createReadStream("mpst_full_data.csv")
  .pipe(csv())
  .on('data', (row) => {
    const document = {
      title: row["title"],
      tags: row["tags"],
      synopsis: row["plot_synopsis"]
    };

    ids.push(row["imdb_id"]);
    documents.push(JSON.stringify(document));
    metadatas.push(document);
  })
  .on('end', async () => {
    let startIdx = 0;

    while (startIdx < ids.length) {
      const endIdx = Math.min(startIdx + 100, ids.length); // Evita ultrapassar o tamanho do array
      const documentsToEmbed = documents.slice(startIdx, endIdx);

      console.log(`Gerando embeddings de ${startIdx} a ${endIdx}...`);

      // Gera os embeddings com o GenAI
      const response = await genai.models.embedContent({
        model: "models/text-embedding-004",
        contents: documentsToEmbed,
        config: { task_type: "retrieval_document" }
      });

      console.log(`Adicionando documentos de ${startIdx} a ${endIdx} na coleção...`);

      await collection.add({
        ids: ids.slice(startIdx, endIdx),
        embeddings: response.embeddings.map(e => e.values),
        metadatas: metadatas.slice(startIdx, endIdx),
      });

      startIdx = endIdx;
    }

    console.log("Todos os documentos foram adicionados com sucesso!");
  });
