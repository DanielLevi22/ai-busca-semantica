import { ChromaClient } from "chromadb";
import { useEffect, useState } from "react";
import { env } from "chromadb-default-embed";

env.useBrowserCache = false;
env.allowLocalModels = false;

export default function useChroma(collectionName) {
  const [chromaCollection, setChromaCollection] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const initializeChroma = async () => {
      const chromaClient = new ChromaClient({ path: "http://localhost:8000" });

      // Se for a coleção que você populou com embeddings Gemini, use 384 dimensões
      const dimension = collectionName === "movies_gemini" ? 384 : 768;

      const collection = await chromaClient.getOrCreateCollection({ 
        name: collectionName,
        space: "cosine",
        embedding_dimension: dimension
      });

      setChromaCollection(collection);
      setIsConnected(true);
    }

    initializeChroma();
  }, [collectionName]);

  return [chromaCollection, isConnected];
}
