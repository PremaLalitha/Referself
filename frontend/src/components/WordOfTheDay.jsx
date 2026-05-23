import { useState, useEffect } from 'react';

const WordOfTheDay = () => {
  const [wordData, setWordData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Hardcoded array of words with meanings and examples
  const words = [
    {
      word: "Ephemeral",
      meaning: "Lasting for a very short time",
      example: "The beauty of cherry blossoms is ephemeral, lasting only a few weeks."
    },
    {
      word: "Serendipity",
      meaning: "The occurrence of events by chance in a happy or beneficial way",
      example: "Finding that rare book in the library was pure serendipity."
    },
    {
      word: "Resilient",
      meaning: "Able to recover quickly from difficulties",
      example: "The resilient community rebuilt their homes after the storm."
    },
    {
      word: "Ubiquitous",
      meaning: "Present, appearing, or found everywhere",
      example: "Smartphones have become ubiquitous in modern society."
    },
    {
      word: "Mellifluous",
      meaning: "Sweet or musical; pleasant to hear",
      example: "The singer's mellifluous voice captivated the audience."
    },
    {
      word: "Quintessential",
      meaning: "Representing the most perfect or typical example of a quality or class",
      example: "The Eiffel Tower is the quintessential symbol of Paris."
    },
    {
      word: "Eloquent",
      meaning: "Fluent or persuasive in speaking or writing",
      example: "The lawyer delivered an eloquent closing argument."
    },
    {
      word: "Nostalgia",
      meaning: "A sentimental longing or wistful affection for the past",
      example: "Looking at old photos filled her with nostalgia."
    },
    {
      word: "Paradigm",
      meaning: "A typical example or pattern of something; a model",
      example: "The discovery shifted the paradigm of scientific thinking."
    },
    {
      word: "Empathy",
      meaning: "The ability to understand and share the feelings of another",
      example: "Her empathy helped her connect deeply with her patients."
    }
  ];

  useEffect(() => {
    // Select a random word based on the current day to keep it consistent throughout the day
    const today = new Date().toDateString();
    const seed = today.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    const randomIndex = seed % words.length;
    setWordData(words[randomIndex]);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="word-of-the-day">
        <h3>Word of the Day</h3>
        <div className="word-content">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="word-of-the-day">
        <h3>Word of the Day</h3>
        <div className="word-content">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!wordData) return null;

  return (
    <div className="word-of-the-day">
      <h3>Word of the Day</h3>
      <div className="word-content">
        <h4 className="word">{wordData.word}</h4>
        <p className="meaning"><strong>Meaning:</strong> {wordData.meaning}</p>
        <p className="example"><strong>Example:</strong> {wordData.example}</p>
      </div>
    </div>
  );
};

export default WordOfTheDay;
