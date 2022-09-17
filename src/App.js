import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './App.css';
import TanstackTodo from './components/TanstackTodo';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="App">
        <TanstackTodo />
    </div>

    </QueryClientProvider>
    
  );
}

export default App;
