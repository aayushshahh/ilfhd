import React from "react";
import "./App.css";
import Home from "./Home";
import Header from "./Header";
import { Route, Link } from "react-router-dom";
import Form from "./Form";
import Sentence from "./Sentence";
import Footer from "./Footer";

function App() {
  return (
    <div className="main-container">
      <Link to="/">
        <Header />
      </Link>
      <Route exact path="/" component={Home} />
      <Route exact path="/form" component={Form} />
      <Route exact path="/sentence" component={Sentence} />
    </div>
  );
}

export default App;
