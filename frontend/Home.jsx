import React from "react";
import Card from "./Card";
import { Link } from "react-router-dom";

function Home() {
  return (
    <div>
      <Link to="/form">
        <Card title="Translate Video" />
      </Link>
      <Link to="/sentence">
        <Card title="Translate Sentence" />
      </Link>
    </div>
  );
}

export default Home;
