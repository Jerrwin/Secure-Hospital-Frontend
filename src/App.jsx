import React from "react";
import { BrowserRouter } from "react-router-dom";
import AppRouter from "./routes/AppRouter";

const App = () => {
  // Detect subdomain
  const hostname = window.location.hostname;
  const subdomain = hostname.split(".")[0];
  const isSubdomain =
    subdomain !== "localhost" && subdomain !== "www" && hostname.includes(".");

  return (
    <BrowserRouter>
      <AppRouter isSubdomain={isSubdomain} />
    </BrowserRouter>
  );
};

export default App;
