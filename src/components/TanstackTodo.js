import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

const fetchTodoList = async () => {
  const res = await fetch('https://tanstack-todo.onrender.com/todos');
  if (!res.ok) {
    throw new Error(`${res.status} ${res.statusText}`);
  }
  return res.json();
};

const TanstackTodo = () => {
  const [name, setName] = useState('');
  const queryClient = useQueryClient();

  const addTodo = async (todo) => {
    const res = await fetch('https://tanstack-todo.onrender.com/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(todo),
    });
    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText}`);
    }
    return res.json();
  };

  const deleteTodo = async (id) => {
    const res = await fetch(`https://tanstack-todo.onrender.com/todos/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      console.log('res', res);
      throw new Error(`${res.status} ${res.statusText}`);
    }
    return res.json();
  };

  const updateTodo = async (todo) => {
    const res = await fetch(`https://tanstack-todo.onrender.com/todos/${todo.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(todo),
    });
    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText}`);
    }
    return res.json();
  };

  const addMutation = useMutation(addTodo, {
    onMutate: async (todo) => {
      await queryClient.cancelQueries(['todos']);

      // Snapshot the previous value
      const previousTodos = queryClient.getQueryData(['todos']);

      // Optimistically update to the new value
      queryClient.setQueryData(['todos'], (old) => [...old, todo]);

      // Return a context object with the snapshotted value
      return { previousTodos };
    },
    onError: (err, todo, context) => {
      queryClient.setQueryData(['todos'], context.previousTodos);
    },
    onSettled: () => {
      queryClient.invalidateQueries('todos');
    },
  });

  const deleteMutation = useMutation(deleteTodo, {
    onSuccess: () => {
      queryClient.invalidateQueries('todos');
    },
  });

  const updateMutation = useMutation(updateTodo, {
    onSuccess: () => {
      queryClient.invalidateQueries('todos');
    },
  });

  const handleChange = (e) => {
    setName(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    addMutation.mutate({ name, isCompleted: false });
  };

  const handleRemoveTodo = (id) => {
    deleteMutation.mutate(id);
  };

  const handleCheckChange = (todo) => {
    updateMutation.mutate(todo);
  };

  const {
    isLoading,
    isError,
    data: todos,
    error,
  } = useQuery(['todos'], fetchTodoList);

  if (isLoading) {
    return <span>Loading...</span>;
  }

  if (isError) {
    return <span>Error: {error.message}</span>;
  }

  return (
    <>
      <h1>Todo一覧</h1>
      <div>
        <form onSubmit={handleSubmit}>
          <label htmlFor="name">Add Todo :</label>
          <input
            placeholder="Add New Todo"
            value={name}
            onChange={handleChange}
            id="name"
          />
          <button>追加</button>
        </form>
      </div>
      <ul>
        {todos?.map((todo) => (
          <li
            key={todo.id}
            style={
              todo.isCompleted === true
                ? { textDecorationLine: 'line-through' }
                : {}
            }
          >
            <input
              type="checkbox"
              checked={todo.isCompleted}
              onChange={() =>
                handleCheckChange({ ...todo, isCompleted: !todo.isCompleted })
              }
            />
            {todo.name}
            <button
              style={{ marginLeft: '0.2em', cursor: 'pointer' }}
              onClick={() => handleRemoveTodo(todo.id)}
            >
              X
            </button>
          </li>
        ))}
      </ul>
    </>
  );
};

export default TanstackTodo;