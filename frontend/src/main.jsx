import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./styles/dark-mode.css";
import App from "./App";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
