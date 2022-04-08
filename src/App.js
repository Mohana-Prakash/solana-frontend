import React from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  useParams,
} from "react-router-dom";
import CandyMachine from "./component/candyMachine";
import SplToken from "./component/splToken";
import Home from "./component/index";
import { LoaderProvider } from "./component/loadercontext";

function App() {
  return (
    <div id="root">
      <LoaderProvider>
        <ToastContainer />
        <Router>
          <Switch>
            <Route exact path="/">
              <Home />
            </Route>
            <Route path="/candy_machine/:cluster/:id">
              <CandyMachine />
            </Route>
            <Route path="/spl_token/:cluster/:id">
              <SplToken />
            </Route>
          </Switch>
        </Router>
      </LoaderProvider>
    </div>
  );
}

export default App;
