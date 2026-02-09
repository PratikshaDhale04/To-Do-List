
import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [toDoList, setToDoList] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editText, setEditText] = useState('');
  const [editPriority, setEditPriority] = useState('medium');
  const [editDueDate, setEditDueDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [darkMode, setDarkMode] = useState(false);
  const [streak, setStreak] = useState(0);
  const [focusTaskId, setFocusTaskId] = useState(null);
  const [pomodoroTime, setPomodoroTime] = useState(25 * 60); // 25 minutes in seconds
  const [isPomodoroRunning, setIsPomodoroRunning] = useState(false);
  const [currentTaskId, setCurrentTaskId] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem('toDoList');
    if (saved) {
      setToDoList(JSON.parse(saved));
    }
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode) {
      setDarkMode(JSON.parse(savedDarkMode));
    }
    const savedStreak = localStorage.getItem('streak');
    if (savedStreak) {
      setStreak(JSON.parse(savedStreak));
    }
    const savedFocusTask = localStorage.getItem('focusTaskId');
    if (savedFocusTask) {
      setFocusTaskId(JSON.parse(savedFocusTask));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('toDoList', JSON.stringify(toDoList));
  }, [toDoList]);

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('streak', JSON.stringify(streak));
  }, [streak]);

  useEffect(() => {
    localStorage.setItem('focusTaskId', JSON.stringify(focusTaskId));
  }, [focusTaskId]);

  useEffect(() => {
    let interval = null;
    if (isPomodoroRunning && pomodoroTime > 0) {
      interval = setInterval(() => {
        setPomodoroTime(time => time - 1);
      }, 1000);
    } else if (pomodoroTime === 0) {
      setIsPomodoroRunning(false);
      alert('Pomodoro session completed!');
    }
    return () => clearInterval(interval);
  }, [isPomodoroRunning, pomodoroTime]);

  const saveToDoList = (event) => {
    event.preventDefault();
    const text = event.target.toname.value.trim();
    const priority = event.target.priority.value;
    const dueDate = event.target.dueDate.value;

    if (!text) return;

    const exists = toDoList.some(item => item.text.toLowerCase() === text.toLowerCase());
    if (exists) {
      alert("ToDo Name Already Exists...");
      return;
    }

    const newItem = {
      id: Date.now(),
      text,
      priority,
      dueDate,
      completed: false
    };

    setToDoList([...toDoList, newItem]);
    event.target.reset();
  };

  const deleteToDo = (id) => {
    setToDoList(toDoList.filter(item => item.id !== id));
  };

  const toggleComplete = (id) => {
    const updatedList = toDoList.map(item =>
      item.id === id ? { ...item, completed: !item.completed } : item
    );
    setToDoList(updatedList);

    // Update streak based on completion
    const completedToday = updatedList.filter(item => item.completed).length;
    const totalToday = updatedList.length;
    if (totalToday > 0 && completedToday === totalToday) {
      setStreak(prev => prev + 1);
    }
  };

  const startEdit = (item) => {
    setEditingIndex(item.id);
    setEditText(item.text);
    setEditPriority(item.priority);
    setEditDueDate(item.dueDate);
  };

  const saveEdit = () => {
    if (!editText.trim()) return;
    setToDoList(toDoList.map(item =>
      item.id === editingIndex
        ? { ...item, text: editText.trim(), priority: editPriority, dueDate: editDueDate }
        : item
    ));
    setEditingIndex(null);
    setEditText('');
    setEditPriority('medium');
    setEditDueDate('');
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setEditText('');
    setEditPriority('medium');
    setEditDueDate('');
  };

  const filteredList = toDoList.filter(item => {
    const matchesSearch = item.text.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = filterPriority === 'all' || item.priority === filterPriority;
    const matchesStatus = filterStatus === 'all' ||
      (filterStatus === 'completed' && item.completed) ||
      (filterStatus === 'pending' && !item.completed);
    return matchesSearch && matchesPriority && matchesStatus;
  });

  const completedTasks = toDoList.filter(item => item.completed).length;
  const totalTasks = toDoList.length;
  const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const setFocusTask = (id) => {
    setFocusTaskId(id);
  };

  const startPomodoro = (id) => {
    setCurrentTaskId(id);
    setPomodoroTime(25 * 60);
    setIsPomodoroRunning(true);
  };

  const stopPomodoro = () => {
    setIsPomodoroRunning(false);
    setCurrentTaskId(null);
  };

  const resetPomodoro = () => {
    setPomodoroTime(25 * 60);
    setIsPomodoroRunning(false);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const list = filteredList.map((item) => (
    <ToDoListItems
      key={item.id}
      item={item}
      editingIndex={editingIndex}
      editText={editText}
      editPriority={editPriority}
      editDueDate={editDueDate}
      setEditText={setEditText}
      setEditPriority={setEditPriority}
      setEditDueDate={setEditDueDate}
      deleteToDo={deleteToDo}
      toggleComplete={toggleComplete}
      startEdit={startEdit}
      saveEdit={saveEdit}
      cancelEdit={cancelEdit}
      isFocusTask={item.id === focusTaskId}
      setFocusTask={setFocusTask}
      startPomodoro={startPomodoro}
      currentTaskId={currentTaskId}
      isPomodoroRunning={isPomodoroRunning}
    />
  ));

  return (
    <div className={`App ${darkMode ? 'dark' : ''}`}>
      <div className="app-header">
        <h1>Advanced To-Do List</h1>
        <div className="header-controls">
          <div className="streak-counter">🔥 Streak: {streak}</div>
          <button onClick={toggleDarkMode} className="theme-toggle">
            {darkMode ? '☀️' : '🌙'}
          </button>
        </div>
      </div>

      <div className="progress-section">
        <h3>Progress</h3>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progressPercentage}%` }}></div>
        </div>
        <span className="progress-text">
          {completedTasks} of {totalTasks} tasks completed ({Math.round(progressPercentage)}%)
        </span>
      </div>

      {currentTaskId && (
        <div className="pomodoro-section">
          <h3>Pomodoro Timer</h3>
          <div className="pomodoro-display">
            <div className="timer">{formatTime(pomodoroTime)}</div>
            <div className="pomodoro-controls">
              <button onClick={() => setIsPomodoroRunning(!isPomodoroRunning)}>
                {isPomodoroRunning ? 'Pause' : 'Start'}
              </button>
              <button onClick={stopPomodoro}>Stop</button>
              <button onClick={resetPomodoro}>Reset</button>
            </div>
          </div>
          <p className="current-task">
            Current Task: {toDoList.find(item => item.id === currentTaskId)?.text || 'None'}
          </p>
        </div>
      )}

      <div className="filters-section">
        <input
          type="text"
          placeholder="Search tasks..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}>
          <option value="all">All Priorities</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      <form onSubmit={saveToDoList} className="todo-form">
        <input type='text' name='toname' placeholder="Enter task..." required />
        <select name='priority' defaultValue='medium'>
          <option value='high'>High</option>
          <option value='medium'>Medium</option>
          <option value='low'>Low</option>
        </select>
        <input type='date' name='dueDate' />
        <button type='submit'>Add Task</button>
      </form>

      <div className='outerDiv'>
        <ul>
          {list}
        </ul>
      </div>
    </div>
  );
}

export default App;

function ToDoListItems({
  item,
  editingIndex,
  editText,
  editPriority,
  editDueDate,
  setEditText,
  setEditPriority,
  setEditDueDate,
  deleteToDo,
  toggleComplete,
  startEdit,
  saveEdit,
  cancelEdit,
  isFocusTask,
  setFocusTask,
  startPomodoro,
  currentTaskId,
  isPomodoroRunning
}) {
  const isEditing = editingIndex === item.id;
  const priorityClass = `priority-${item.priority}`;

  return (
    <li className={`${priorityClass} ${item.completed ? 'completed' : ''} ${isFocusTask ? 'focus-task' : ''}`}>
      {isEditing ? (
        <div className="edit-form">
          <input
            type='text'
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
          />
          <select
            value={editPriority}
            onChange={(e) => setEditPriority(e.target.value)}
          >
            <option value='high'>High</option>
            <option value='medium'>Medium</option>
            <option value='low'>Low</option>
          </select>
          <input
            type='date'
            value={editDueDate}
            onChange={(e) => setEditDueDate(e.target.value)}
          />
          <button onClick={saveEdit}>Save</button>
          <button onClick={cancelEdit}>Cancel</button>
        </div>
      ) : (
        <>
          <input
            type="checkbox"
            checked={item.completed}
            onChange={() => toggleComplete(item.id)}
          />
          <span className="task-text">{item.text}</span>
          {item.dueDate && <span className="due-date">Due: {item.dueDate}</span>}
          {isFocusTask && <span className="focus-indicator">🎯 Focus Task</span>}
          <div className="actions">
            <button onClick={() => setFocusTask(item.id)} className={isFocusTask ? 'active' : ''}>
              🎯
            </button>
            <button onClick={() => startPomodoro(item.id)} disabled={isPomodoroRunning && currentTaskId !== item.id}>
              🍅
            </button>
            <button onClick={() => startEdit(item)}>Edit</button>
            <span onClick={() => deleteToDo(item.id)}>&times;</span>
          </div>
        </>
      )}
    </li>
  );
}
