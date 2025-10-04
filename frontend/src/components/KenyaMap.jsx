import { MapContainer, TileLayer, CircleMarker, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const KenyaMap = ({ data }) => (
  <MapContainer
    center={[-0.0236, 37.9062]}
    zoom={6}
    style={{ height: "500px" }}
  >
    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
    {data.map((d, i) => (
      <CircleMarker
        key={i}
        center={[Math.random() * 3 - 1, Math.random() * 3 + 35]} // mock lat/lon
        radius={d.ndvi * 10}
        color={d.anomaly ? "red" : "green"}
      >
        <Tooltip>
          <div>
            <p>
              <b>County:</b> {d.county}
            </p>
            <p>
              <b>NDVI:</b> {d.ndvi}
            </p>
            <p>
              <b>Date:</b> {new Date(d.date).toLocaleDateString()}
            </p>
          </div>
        </Tooltip>
      </CircleMarker>
    ))}
  </MapContainer>
);

export default KenyaMap;
