from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity


# Load the model once.
model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")


class SemanticSearch:
    def __init__(self, documents):
        # Keep the original document text.
        self.documents = documents

        # Generate document embeddings only once.
        self.document_vectors = model.encode(documents)

    def search(self, query, top_k=3):
        if not query.strip():
            raise ValueError("Query cannot be empty")

        if not self.documents:
            return []

        # Embed only the new query.
        query_vector = model.encode([query])

        # Compare the query with stored document vectors.
        scores = cosine_similarity(
            query_vector,
            self.document_vectors
        )[0]

        # Rank documents from highest score to lowest.
        ranked_indices = scores.argsort()[::-1][:top_k]

        return [
            {
                "text": self.documents[i],
                "score": float(scores[i])
            }
            for i in ranked_indices
        ]


    def add_documents(self, new_documents):
        # Ignore an empty batch.
        if not new_documents:
            return 0

        # Reject blank documents before embedding them.
        if any(not doc.strip() for doc in new_documents):
            raise ValueError("Documents cannot be empty")

        # Embed only the newly added documents.
        new_vectors = model.encode(new_documents)

        # Add the text to our existing document collection.
        self.documents.extend(new_documents)

        # Append the new vectors without recomputing old ones.
        if len(self.document_vectors) == 0:
            self.document_vectors = new_vectors
        else:
            import numpy as np
            self.document_vectors = np.concatenate(
                [self.document_vectors, new_vectors],
                axis=0,
            )

        return len(new_documents)


if __name__ == "__main__":
    documents = [
        "Refunds are processed within five business days.",
        "Customers receive their money back within a week.",
        "Pizza and burgers are available on the menu.",
    ]

    # Initialize once; document embeddings are computed here.
    search_engine = SemanticSearch(documents)

    queries = [
        "How long does it take to get my money back?",
        "What food is available?",
    ]

    # Reuse the same document embeddings for both queries.
    for query in queries:
        print(f"\nQuery: {query}")

        for result in search_engine.search(query):
            print(f'{result["score"]:.4f} | {result["text"]}')