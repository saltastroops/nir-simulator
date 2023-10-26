import { Simulator } from "./components/Simulator";
import {
  CategoryScale,
  Chart as ChartJS,
  LinearScale,
  LineElement,
  PointElement,
} from "chart.js";

function App() {
  // Register the controllers and elements for the charts
  ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement);

  return (
    <div className="container is-fluid">
      <Simulator />
    </div>
  );
}

export default App;
