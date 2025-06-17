"use client";

import { useState } from "react";

export default function Home() {
  const [topic, setTopic] = useState("");
  const [participant, setParticipant] = useState("");
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setQuestion("");

    try {
      const response = await fetch("/api/generate-question", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ topic, participant }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate question");
      }

      setQuestion(data.question);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8 flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mb-8">Icebreaker Question Generator</h1>

      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
        <div>
          <label htmlFor="topic" className="block text-sm font-medium mb-2">
            Topic
          </label>
          <input
            type="text"
            id="topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g., team building, networking"
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div>
          <label
            htmlFor="participant"
            className="block text-sm font-medium mb-2"
          >
            Participant
          </label>
          <input
            type="text"
            id="participant"
            value={participant}
            onChange={(e) => setParticipant(e.target.value)}
            placeholder="e.g., software engineers, students"
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
        >
          {loading ? "Generating..." : "Generate Question"}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded">{error}</div>
      )}

      {question && (
        <div className="mt-8 p-6 bg-gray-50 rounded-lg max-w-md">
          <h2 className="text-xl font-semibold mb-2">
            Your Icebreaker Question:
          </h2>
          <p className="text-gray-700">{question}</p>
        </div>
      )}
    </div>
  );
}
