import './App.scss';

import usersFromServer from './api/users';
import todosFromServer from './api/todos';
import { useState } from 'react';
import { TodoList } from './components/TodoList';

const listOfTodo = () => {
  return todosFromServer.map(todo => {
    const newUser = usersFromServer.find(user => todo.userId === user.id);

    return {
      ...todo,
      newUser,
    };
  });
};

export const App = () => {
  const [historyChange, setHistoryChange] = useState([...listOfTodo()]);
  const [inputTitle, setInputTitle] = useState('');
  const [selectUser, setSelectUser] = useState('');
  const [status, setStatus] = useState(false);

  const maxId =
    historyChange.length > 0
      ? Math.max(...historyChange.map(todo => todo.id))
      : 0;

  const uniqueUsers = usersFromServer.reduce(
    (acc, item) => {
      if (!acc.some(user => user.id === item.id)) {
        acc.push(item);
      }

      return acc;
    },
    [] as { id: number; name: string }[],
  );

  const handleTitle = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputTitle(event.target.value);
  };

  const handleSelectUser = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectUser(event.target.value);
  };

  const findUser = usersFromServer.find(user => user.name === selectUser);

  const addTodo = () => {
    setStatus(true);

    if (inputTitle.trim() === '' || selectUser.trim() === '') {
      return;
    }

    if (!findUser) {
      return;
    }

    const newId = maxId + 1;

    const newTodo = {
      id: newId,
      title: inputTitle,
      completed: false,
      user: {
        id: findUser.id,
        name: selectUser,
        username: findUser.username,
        email: findUser.email,
      },
      userId: findUser.id,
    };

    setHistoryChange(prev => [...prev, newTodo]);

    setInputTitle('');
    setSelectUser('');
    setStatus(true);
  };

  const hasTitleError = inputTitle.trim() === '' && status;
  const hasUserError = selectUser.trim() === '' && status;

  return (
    <div className="App">
      <h1>Add todo form</h1>

      <form action="/api/todos" method="POST">
        <div className="field">
          <input
            type="text"
            data-cy="titleInput"
            value={inputTitle}
            onChange={handleTitle}
            placeholder="Enter title"
            required
          />

          {hasTitleError && <span className="error">Please enter a title</span>}
        </div>

        <div className="field">
          <select
            data-cy="userSelect"
            value={selectUser}
            onChange={handleSelectUser}
          >
            <option value="" disabled={selectUser !== ''}>
              Choose a user
            </option>

            {uniqueUsers.map(item => {
              return (
                <option value={item.name} key={item.id}>
                  {item.name}
                </option>
              );
            })}
          </select>

          {hasUserError && <span className="error">Please choose a user</span>}
        </div>

        <button
          type="submit"
          data-cy="submitButton"
          onClick={e => {
            e.preventDefault();
            addTodo();
          }}
        >
          Add
        </button>
      </form>

      <TodoList todos={historyChange} />
    </div>
  );
};
