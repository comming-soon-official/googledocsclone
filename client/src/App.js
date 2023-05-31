import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import TextEditor from "./TextEditor";

function App() {
  return (
    //setingup routers and routes for to navigate and assign routes
    <BrowserRouter>
      <Routes>
        <Route
          exact
          path="/"
          element={<Navigate to={`/documents/${uuidv4()}`} replace={true} />} // if user access / route they redirected to new route randomly generated from uuidv4
        />
        <Route path="/documents/:id" Component={TextEditor} />{" "}
        {/*this route contains the editor*/}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
