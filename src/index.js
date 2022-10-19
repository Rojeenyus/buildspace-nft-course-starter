import React from "react";
import ReactDOM from "react-dom";
import "./styles/index.css";
import App from "./App";
import { MoralisProvider } from "react-moralis";

ReactDOM.render(
  <React.StrictMode>
    <MoralisProvider initializeOnMount={false}>
      <App />
    </MoralisProvider>
  </React.StrictMode>,
  document.getElementById("root")
);
