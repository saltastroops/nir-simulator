import {Tabs} from "./components/Tabs.jsx";
import {CategoryScale, Chart as ChartJS, LinearScale, LineElement, PointElement} from "chart.js";

function App() {
    ChartJS.register(
        CategoryScale,
        LinearScale,
        PointElement,
        LineElement
    )
  return (
      <div>
        <Tabs />
      </div>
  );
}

export default App;
