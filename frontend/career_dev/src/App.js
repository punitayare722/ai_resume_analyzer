import React, { useState, useEffect } from "react";

function App() {
  const [message, setMessage] = useState("");
  const [greeting, setGreeting] = useState("");

  // Call FastAPI backend when page loads
  useEffect(() => {
    fetch("http://127.0.0.1:8000/")
      .then((res) => res.json())
      .then((data) => setMessage(data.message));
  }, []);

  // Button click → call backend
  const fetchGreeting = () => {
    fetch("http://127.0.0.1:8000/api/greet/Punit")
      .then((res) => res.json())
      .then((data) => setGreeting(data.greeting));
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>{message}</h1>
      <button onClick={fetchGreeting}>Get Greeting</button>
      <h2>{greeting}</h2>
    </div>
  );
}

export default App;
