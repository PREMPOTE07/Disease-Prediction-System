import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";


const ModelChart = ({ data }) => {
  return (
    <div className="w-full h-[300px]">
  <ResponsiveContainer width="100%" height={300}>
    <BarChart data={data}>
          <XAxis dataKey="model" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="accuracy" />
          <Bar dataKey="precision" />
          <Bar dataKey="recall" />
          <Bar dataKey="f1_score" />
          <Bar dataKey="probability" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ModelChart;