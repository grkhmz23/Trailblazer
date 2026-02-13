"""Clustering candidates into narratives using HDBSCAN."""

import numpy as np
from typing import Any

try:
    import hdbscan
    HAS_HDBSCAN = True
except ImportError:
    HAS_HDBSCAN = False

from sklearn.cluster import DBSCAN
from sklearn.metrics.pairwise import cosine_distances


def cluster_candidates(
    embeddings: list[list[float]],
    labels: list[str],
    min_cluster_size: int = 2,
) -> list[dict]:
    """
    Cluster candidate embeddings into narrative groups.

    Returns a list of clusters, each with:
      - cluster_id: int
      - member_indices: list[int]
      - member_labels: list[str]
    """
    if len(embeddings) < 2:
        # Single candidate = single cluster
        return [{"cluster_id": 0, "member_indices": [0], "member_labels": labels[:1]}]

    X = np.array(embeddings)

    if HAS_HDBSCAN:
        clusterer = hdbscan.HDBSCAN(
            min_cluster_size=min_cluster_size,
            metric="euclidean",
            cluster_selection_method="eom",
        )
        cluster_labels = clusterer.fit_predict(X)
    else:
        # Fallback to DBSCAN with cosine distance
        dist_matrix = cosine_distances(X)
        clusterer = DBSCAN(eps=0.5, min_samples=min_cluster_size, metric="precomputed")
        cluster_labels = clusterer.fit_predict(dist_matrix)

    # Group by cluster
    clusters: dict[int, list[int]] = {}
    noise_indices: list[int] = []

    for idx, label in enumerate(cluster_labels):
        if label == -1:
            noise_indices.append(idx)
        else:
            clusters.setdefault(label, []).append(idx)

    # Convert noise points into singleton clusters
    next_id = max(clusters.keys(), default=-1) + 1
    for idx in noise_indices:
        clusters[next_id] = [idx]
        next_id += 1

    result = []
    for cid, indices in sorted(clusters.items()):
        result.append({
            "cluster_id": cid,
            "member_indices": indices,
            "member_labels": [labels[i] for i in indices],
        })

    return result


def compute_saturation(
    idea_embedding: list[float],
    corpus_embeddings: dict[str, list[float]],
    corpus_meta: dict[str, dict],
    top_k: int = 3,
) -> dict:
    """
    Compute saturation score by finding nearest neighbors in project corpus.

    Returns:
      {
        "level": "low" | "medium" | "high",
        "score": float (0-1),
        "neighbors": [{"name", "similarity", "url"}]
      }
    """
    if not corpus_embeddings or not idea_embedding:
        return {"level": "low", "score": 0.0, "neighbors": []}

    idea_vec = np.array([idea_embedding])
    names = list(corpus_embeddings.keys())
    corpus_vecs = np.array([corpus_embeddings[n] for n in names])

    # Cosine similarity
    from sklearn.metrics.pairwise import cosine_similarity
    sims = cosine_similarity(idea_vec, corpus_vecs)[0]

    # Get top K
    top_indices = np.argsort(sims)[::-1][:top_k]
    neighbors = []
    for idx in top_indices:
        name = names[idx]
        meta = corpus_meta.get(name, {})
        neighbors.append({
            "name": name,
            "similarity": round(float(sims[idx]), 3),
            "url": meta.get("url", ""),
        })

    # Score = average similarity of top K
    avg_sim = float(np.mean([sims[i] for i in top_indices]))

    if avg_sim >= 0.75:
        level = "high"
    elif avg_sim >= 0.45:
        level = "medium"
    else:
        level = "low"

    return {
        "level": level,
        "score": round(avg_sim, 3),
        "neighbors": neighbors,
    }
