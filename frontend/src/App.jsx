import { useEffect, useState } from "react";
import KenyaMap from "./components/KenyaMap";
import { fetchBlooms } from "./services/api";
import NavBar from "./components/NavBar";


function App() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetchBlooms().then(setData);
  }, []);

  return (
    <div className="p-4">
      <NavBar />
      {/* <h1 className="text-3xl font-bold mb-4">🌍 Bloom Watchers - Kenya</h1> */}
      <KenyaMap data={data} />
      <div className="mt-6 flex gap-2">
        <button className="btn btn-primary">Filter</button>
        <button className="btn btn-secondary">Predict</button>
      </div>
    </div>
  );
}

export default App;
