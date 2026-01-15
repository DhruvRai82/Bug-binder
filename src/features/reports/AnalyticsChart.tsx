import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

interface AnalyticsChartProps {
  type: 'pie' | 'bar' | 'line';
  data: any[];
  title: string;
  dataKey?: string;
  nameKey?: string;
  colors?: string[];
  onClick?: (data: any) => void;
  height?: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export function AnalyticsChart({ type, data, title, dataKey = 'value', nameKey = 'name', colors = COLORS, onClick, height = 300 }: AnalyticsChartProps) {
  const renderChart = () => {
    switch (type) {
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey={dataKey}
                onClick={onClick}
                cursor="pointer"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        );

      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={nameKey} />
              <YAxis />
              <Tooltip />
              <Bar dataKey={dataKey} fill="#8884d8" onClick={onClick} cursor="pointer" />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'line':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={nameKey} />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey={dataKey} stroke="#8884d8" activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? renderChart() : (
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            No data available
          </div>
        )}
      </CardContent>
    </Card>
  );
}