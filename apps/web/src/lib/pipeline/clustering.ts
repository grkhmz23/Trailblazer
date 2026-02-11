/**
 * Agglomerative clustering using cosine similarity.
 * Pure TypeScript — no native dependencies, runs on Vercel.
 */

export interface ClusterResult {
  clusterId: number;
  memberIndices: number[];
}

function dot(a: number[], b: number[]): number {
  let sum = 0;
  for (let i = 0; i < a.length; i++) sum += a[i] * b[i];
  return sum;
}

function norm(a: number[]): number {
  return Math.sqrt(dot(a, a));
}

function cosineSimilarity(a: number[], b: number[]): number {
  const na = norm(a);
  const nb = norm(b);
  if (na === 0 || nb === 0) return 0;
  return dot(a, b) / (na * nb);
}

/**
 * Simple agglomerative clustering (single linkage).
 * Merges clusters until similarity drops below threshold.
 */
export function agglomerativeCluster(
  embeddings: number[][],
  threshold = 0.45,
  maxClusters = 10
): ClusterResult[] {
  const n = embeddings.length;
  if (n === 0) return [];
  if (n === 1) return [{ clusterId: 0, memberIndices: [0] }];

  // Compute pairwise similarity matrix
  const sim: number[][] = Array.from({ length: n }, () => new Array(n).fill(0));
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const s = cosineSimilarity(embeddings[i], embeddings[j]);
      sim[i][j] = s;
      sim[j][i] = s;
    }
  }

  // Initialize: each point is its own cluster
  let clusters: number[][] = Array.from({ length: n }, (_, i) => [i]);
  const active = new Set(Array.from({ length: n }, (_, i) => i));

  // Merge loop
  while (active.size > 1 && clusters.length > maxClusters) {
    let bestSim = -1;
    let bestI = -1;
    let bestJ = -1;

    const activeArr = Array.from(active);
    for (let ai = 0; ai < activeArr.length; ai++) {
      for (let aj = ai + 1; aj < activeArr.length; aj++) {
        const ci = activeArr[ai];
        const cj = activeArr[aj];

        // Average linkage
        let totalSim = 0;
        let count = 0;
        for (const mi of clusters[ci]) {
          for (const mj of clusters[cj]) {
            totalSim += sim[mi][mj];
            count++;
          }
        }
        const avgSim = totalSim / count;

        if (avgSim > bestSim) {
          bestSim = avgSim;
          bestI = ci;
          bestJ = cj;
        }
      }
    }

    if (bestSim < threshold) break;

    // Merge bestJ into bestI
    clusters[bestI] = [...clusters[bestI], ...clusters[bestJ]];
    clusters[bestJ] = [];
    active.delete(bestJ);
  }

  // Also merge remaining pairs above threshold even if under maxClusters
  let changed = true;
  while (changed && active.size > 1) {
    changed = false;
    const activeArr = Array.from(active);
    for (let ai = 0; ai < activeArr.length && !changed; ai++) {
      for (let aj = ai + 1; aj < activeArr.length && !changed; aj++) {
        const ci = activeArr[ai];
        const cj = activeArr[aj];
        let totalSim = 0;
        let count = 0;
        for (const mi of clusters[ci]) {
          for (const mj of clusters[cj]) {
            totalSim += sim[mi][mj];
            count++;
          }
        }
        if (totalSim / count >= threshold) {
          clusters[ci] = [...clusters[ci], ...clusters[cj]];
          clusters[cj] = [];
          active.delete(cj);
          changed = true;
        }
      }
    }
  }

  // Build results
  const results: ClusterResult[] = [];
  let clusterId = 0;
  for (const idx of active) {
    if (clusters[idx].length > 0) {
      results.push({ clusterId: clusterId++, memberIndices: clusters[idx] });
    }
  }

  return results;
}

/**
 * Compute saturation score: how similar is the idea embedding to the project corpus?
 */
export function computeSaturation(
  ideaEmbedding: number[],
  corpusEmbeddings: number[][],
  corpusMeta: Array<{ name: string; url: string }>,
  topK = 3
): {
  level: "low" | "medium" | "high";
  score: number;
  neighbors: Array<{ name: string; similarity: number; url: string }>;
} {
  const similarities = corpusEmbeddings.map((emb, i) => ({
    index: i,
    similarity: cosineSimilarity(ideaEmbedding, emb),
  }));

  similarities.sort((a, b) => b.similarity - a.similarity);
  const topNeighbors = similarities.slice(0, topK);

  const avgSim =
    topNeighbors.reduce((s, n) => s + n.similarity, 0) / topK;

  const level: "low" | "medium" | "high" =
    avgSim > 0.75 ? "high" : avgSim > 0.45 ? "medium" : "low";

  return {
    level,
    score: avgSim,
    neighbors: topNeighbors.map((n) => ({
      name: corpusMeta[n.index]?.name ?? "Unknown",
      similarity: Math.round(n.similarity * 100) / 100,
      url: corpusMeta[n.index]?.url ?? "",
    })),
  };
}

/**
 * Generate a simple embedding from text using character n-gram hashing.
 * Not as good as sentence-transformers, but works without any API keys.
 * Deterministic and fast.
 */
export function simpleTextEmbed(text: string, dims = 384): number[] {
  const vec = new Float64Array(dims);
  const lower = text.toLowerCase().replace(/[^a-z0-9 ]/g, "");
  const words = lower.split(/\s+/);

  // Character trigram hashing into vector
  for (const word of words) {
    for (let i = 0; i <= word.length - 3; i++) {
      const trigram = word.substring(i, i + 3);
      let hash = 0;
      for (let c = 0; c < trigram.length; c++) {
        hash = (hash * 31 + trigram.charCodeAt(c)) >>> 0;
      }
      const idx = hash % dims;
      vec[idx] += 1;
    }
  }

  // L2 normalize
  let norm = 0;
  for (let i = 0; i < dims; i++) norm += vec[i] * vec[i];
  norm = Math.sqrt(norm) || 1;
  const result: number[] = new Array(dims);
  for (let i = 0; i < dims; i++) result[i] = vec[i] / norm;
  return result;
}
