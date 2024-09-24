import React from "react";
import DealTable from "./components/DealTable/DealTable";
import "./App.css";

function App() {
    return (
        <div className="app">
            <h1>Список сделок</h1>
            <DealTable />
        </div>
    );
}

export default App;
