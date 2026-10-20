import unittest
from search import SemanticSearch


class TestSemanticSearch(unittest.TestCase):

    def test_zero_top_k_returns_no_results(self):
        results = self.engine.search("refund", top_k=0)
        self.assertEqual(results, [])

    def test_top_k_larger_than_documents_returns_all(self):
        results = self.engine.search("refund", top_k=10)
        self.assertEqual(len(results), len(self.documents))

    def setUp(self):
        self.documents = [
            "Refunds take five business days.",
            "Customers can get their money back within a week.",
            "Pizza and burgers are available."
        ]
        self.engine = SemanticSearch(self.documents)

    def test_relevant_document_ranks_first(self):
        results = self.engine.search(
            "How long until I receive my refund?"
        )

        self.assertEqual(
            results[0]["text"],
            self.documents[0]
        )

    def test_empty_query_is_rejected(self):
        with self.assertRaises(ValueError):
            self.engine.search("   ")

    def test_empty_documents_return_no_results(self):
        engine = SemanticSearch([])
        self.assertEqual(engine.search("refund"), [])

    def test_top_k_limits_results(self):
        results = self.engine.search(
            "refund",
            top_k=2
        )
        self.assertEqual(len(results), 2)


if __name__ == "__main__":
    unittest.main()