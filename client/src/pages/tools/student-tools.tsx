import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToolLayout, ResultDisplay } from "@/components/tool-layout";
import { getToolById } from "@/lib/tools-data";
import { Plus, Trash2, Play, Pause, RotateCcw, Edit2, Check, X } from "lucide-react";

function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = (value: T | ((prev: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error("Error saving to localStorage:", error);
    }
  };

  return [storedValue, setValue];
}

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
}

export function NotesManager() {
  const tool = getToolById("notes-manager")!;
  const [notes, setNotes] = useLocalStorage<Note[]>("student-notes", []);
  const [selectedNote, setSelectedNote] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");

  const currentNote = notes.find(n => n.id === selectedNote);

  useEffect(() => {
    if (currentNote) {
      setEditTitle(currentNote.title);
      setEditContent(currentNote.content);
    }
  }, [selectedNote]);

  const addNote = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: "Untitled Note",
      content: "",
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    setNotes(prev => [newNote, ...prev]);
    setSelectedNote(newNote.id);
  };

  const updateNote = () => {
    if (!selectedNote) return;
    setNotes(prev => prev.map(n => 
      n.id === selectedNote 
        ? { ...n, title: editTitle, content: editContent, updatedAt: Date.now() }
        : n
    ));
  };

  const deleteNote = (id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
    if (selectedNote === id) {
      setSelectedNote(null);
    }
  };

  return (
    <ToolLayout tool={tool}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 min-h-[500px]">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Notes ({notes.length})</Label>
            <Button size="sm" onClick={addNote} data-testid="button-add-note">
              <Plus className="w-4 h-4 mr-1" /> New
            </Button>
          </div>
          
          <div className="space-y-2 max-h-[450px] overflow-auto">
            {notes.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No notes yet. Click "New" to create one.
              </p>
            ) : (
              notes.map(note => (
                <div
                  key={note.id}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedNote === note.id 
                      ? "bg-primary/10 border border-primary" 
                      : "bg-muted/50 hover-elevate"
                  }`}
                  onClick={() => setSelectedNote(note.id)}
                  data-testid={`note-${note.id}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{note.title}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {note.content.slice(0, 50) || "Empty note"}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="shrink-0 h-6 w-6"
                      onClick={(e) => { e.stopPropagation(); deleteNote(note.id); }}
                      data-testid={`button-delete-${note.id}`}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="md:col-span-2 space-y-4">
          {selectedNote ? (
            <>
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onBlur={updateNote}
                placeholder="Note title"
                className="text-lg font-semibold"
                data-testid="input-note-title"
              />
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                onBlur={updateNote}
                placeholder="Start writing your note..."
                className="min-h-[400px] resize-none"
                data-testid="textarea-note-content"
              />
              <p className="text-xs text-muted-foreground">
                Last updated: {new Date(currentNote?.updatedAt || 0).toLocaleString()}
              </p>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Select a note or create a new one
            </div>
          )}
        </div>
      </div>
    </ToolLayout>
  );
}

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
}

export function TodoList() {
  const tool = getToolById("todo-list")!;
  const [todos, setTodos] = useLocalStorage<Todo[]>("student-todos", []);
  const [newTodo, setNewTodo] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");

  const addTodo = () => {
    if (!newTodo.trim()) return;
    const todo: Todo = {
      id: Date.now().toString(),
      text: newTodo.trim(),
      completed: false,
      createdAt: Date.now()
    };
    setTodos(prev => [todo, ...prev]);
    setNewTodo("");
  };

  const toggleTodo = (id: string) => {
    setTodos(prev => prev.map(t => 
      t.id === id ? { ...t, completed: !t.completed } : t
    ));
  };

  const deleteTodo = (id: string) => {
    setTodos(prev => prev.filter(t => t.id !== id));
  };

  const clearCompleted = () => {
    setTodos(prev => prev.filter(t => !t.completed));
  };

  const filteredTodos = todos.filter(t => {
    if (filter === "active") return !t.completed;
    if (filter === "completed") return t.completed;
    return true;
  });

  const completedCount = todos.filter(t => t.completed).length;

  return (
    <ToolLayout tool={tool}>
      <div className="max-w-xl mx-auto space-y-6">
        <div className="flex gap-2">
          <Input
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTodo()}
            placeholder="Add a new task..."
            data-testid="input-new-todo"
          />
          <Button onClick={addTodo} data-testid="button-add-todo">
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex gap-2">
            {(["all", "active", "completed"] as const).map(f => (
              <Button
                key={f}
                variant={filter === f ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(f)}
                data-testid={`button-filter-${f}`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </Button>
            ))}
          </div>
          
          <p className="text-sm text-muted-foreground">
            {completedCount}/{todos.length} completed
          </p>
        </div>

        <div className="space-y-2">
          {filteredTodos.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              {filter === "all" ? "No tasks yet. Add one above!" : `No ${filter} tasks`}
            </p>
          ) : (
            filteredTodos.map(todo => (
              <div
                key={todo.id}
                className={`flex items-center gap-3 p-3 rounded-lg bg-muted/50 ${
                  todo.completed ? "opacity-60" : ""
                }`}
                data-testid={`todo-${todo.id}`}
              >
                <Checkbox
                  checked={todo.completed}
                  onCheckedChange={() => toggleTodo(todo.id)}
                  data-testid={`checkbox-${todo.id}`}
                />
                <span className={`flex-1 ${todo.completed ? "line-through" : ""}`}>
                  {todo.text}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => deleteTodo(todo.id)}
                  data-testid={`button-delete-${todo.id}`}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))
          )}
        </div>

        {completedCount > 0 && (
          <Button 
            variant="outline" 
            onClick={clearCompleted} 
            className="w-full"
            data-testid="button-clear-completed"
          >
            Clear Completed ({completedCount})
          </Button>
        )}
      </div>
    </ToolLayout>
  );
}

export function PomodoroTimer() {
  const tool = getToolById("pomodoro-timer")!;
  const [mode, setMode] = useState<"work" | "break" | "longBreak">("work");
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const durations = {
    work: 25 * 60,
    break: 5 * 60,
    longBreak: 15 * 60
  };

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
      if (mode === "work") {
        const newSessions = sessions + 1;
        setSessions(newSessions);
        if (newSessions % 4 === 0) {
          setMode("longBreak");
          setTimeLeft(durations.longBreak);
        } else {
          setMode("break");
          setTimeLeft(durations.break);
        }
      } else {
        setMode("work");
        setTimeLeft(durations.work);
      }
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, timeLeft]);

  const toggleTimer = () => setIsRunning(!isRunning);
  
  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(durations[mode]);
  };

  const switchMode = (newMode: typeof mode) => {
    setMode(newMode);
    setTimeLeft(durations[newMode]);
    setIsRunning(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const progress = ((durations[mode] - timeLeft) / durations[mode]) * 100;

  return (
    <ToolLayout tool={tool}>
      <div className="max-w-md mx-auto space-y-8 text-center">
        <div className="flex justify-center gap-2">
          {(["work", "break", "longBreak"] as const).map(m => (
            <Button
              key={m}
              variant={mode === m ? "default" : "outline"}
              size="sm"
              onClick={() => switchMode(m)}
              data-testid={`button-mode-${m}`}
            >
              {m === "work" ? "Work" : m === "break" ? "Break" : "Long Break"}
            </Button>
          ))}
        </div>

        <div className="relative">
          <div className="w-64 h-64 mx-auto rounded-full border-8 border-muted flex items-center justify-center relative overflow-hidden">
            <div 
              className="absolute bottom-0 left-0 right-0 bg-primary/20 transition-all duration-1000"
              style={{ height: `${progress}%` }}
            />
            <span className="text-6xl font-mono font-bold relative z-10" data-testid="display-time">
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>

        <div className="flex justify-center gap-4">
          <Button
            size="lg"
            onClick={toggleTimer}
            className="w-32"
            data-testid="button-toggle"
          >
            {isRunning ? (
              <><Pause className="w-5 h-5 mr-2" /> Pause</>
            ) : (
              <><Play className="w-5 h-5 mr-2" /> Start</>
            )}
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={resetTimer}
            data-testid="button-reset"
          >
            <RotateCcw className="w-5 h-5" />
          </Button>
        </div>

        <div className="text-muted-foreground">
          <p>Sessions completed: <span className="font-bold text-foreground">{sessions}</span></p>
          <p className="text-sm mt-1">
            {mode === "work" 
              ? "Focus on your work!" 
              : mode === "break" 
              ? "Take a short break" 
              : "Take a longer break, you've earned it!"}
          </p>
        </div>
      </div>
    </ToolLayout>
  );
}

interface StudySession {
  id: string;
  subject: string;
  topic: string;
  date: string;
  duration: number;
  completed: boolean;
}

export function StudyPlanner() {
  const tool = getToolById("study-planner")!;
  const [sessions, setSessions] = useLocalStorage<StudySession[]>("student-study-plan", []);
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [duration, setDuration] = useState("60");

  const addSession = () => {
    if (!subject.trim() || !topic.trim()) return;
    const session: StudySession = {
      id: Date.now().toString(),
      subject: subject.trim(),
      topic: topic.trim(),
      date,
      duration: parseInt(duration) || 60,
      completed: false
    };
    setSessions(prev => [...prev, session].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
    setSubject("");
    setTopic("");
  };

  const toggleSession = (id: string) => {
    setSessions(prev => prev.map(s => 
      s.id === id ? { ...s, completed: !s.completed } : s
    ));
  };

  const deleteSession = (id: string) => {
    setSessions(prev => prev.filter(s => s.id !== id));
  };

  const todaySessions = sessions.filter(s => s.date === new Date().toISOString().split("T")[0]);
  const upcomingSessions = sessions.filter(s => new Date(s.date) > new Date());

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label>Subject</Label>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g., Mathematics"
              data-testid="input-subject"
            />
          </div>
          <div className="space-y-2">
            <Label>Topic</Label>
            <Input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., Calculus"
              data-testid="input-topic"
            />
          </div>
          <div className="space-y-2">
            <Label>Date</Label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              data-testid="input-date"
            />
          </div>
          <div className="space-y-2">
            <Label>Duration (min)</Label>
            <Input
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="60"
              data-testid="input-duration"
            />
          </div>
        </div>

        <Button onClick={addSession} data-testid="button-add-session">
          <Plus className="w-4 h-4 mr-2" /> Add Study Session
        </Button>

        {todaySessions.length > 0 && (
          <ResultDisplay title={`Today's Sessions (${todaySessions.length})`}>
            <div className="space-y-2">
              {todaySessions.map(session => (
                <SessionItem key={session.id} session={session} onToggle={toggleSession} onDelete={deleteSession} />
              ))}
            </div>
          </ResultDisplay>
        )}

        <ResultDisplay title={`All Sessions (${sessions.length})`}>
          {sessions.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No study sessions planned yet.</p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-auto">
              {sessions.map(session => (
                <SessionItem key={session.id} session={session} onToggle={toggleSession} onDelete={deleteSession} />
              ))}
            </div>
          )}
        </ResultDisplay>
      </div>
    </ToolLayout>
  );
}

function SessionItem({ session, onToggle, onDelete }: { session: StudySession; onToggle: (id: string) => void; onDelete: (id: string) => void }) {
  return (
    <div className={`flex items-center gap-3 p-3 rounded-lg bg-background ${session.completed ? "opacity-60" : ""}`}>
      <Checkbox
        checked={session.completed}
        onCheckedChange={() => onToggle(session.id)}
      />
      <div className="flex-1 min-w-0">
        <p className={`font-medium ${session.completed ? "line-through" : ""}`}>
          {session.subject}: {session.topic}
        </p>
        <p className="text-xs text-muted-foreground">
          {new Date(session.date).toLocaleDateString()} • {session.duration} min
        </p>
      </div>
      <Button variant="ghost" size="icon" className="shrink-0" onClick={() => onDelete(session.id)}>
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
}

interface Homework {
  id: string;
  subject: string;
  assignment: string;
  dueDate: string;
  priority: "low" | "medium" | "high";
  completed: boolean;
}

export function HomeworkTracker() {
  const tool = getToolById("homework-tracker")!;
  const [homework, setHomework] = useLocalStorage<Homework[]>("student-homework", []);
  const [subject, setSubject] = useState("");
  const [assignment, setAssignment] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<Homework["priority"]>("medium");

  const addHomework = () => {
    if (!subject.trim() || !assignment.trim() || !dueDate) return;
    const hw: Homework = {
      id: Date.now().toString(),
      subject: subject.trim(),
      assignment: assignment.trim(),
      dueDate,
      priority,
      completed: false
    };
    setHomework(prev => [...prev, hw].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()));
    setSubject("");
    setAssignment("");
    setDueDate("");
    setPriority("medium");
  };

  const toggleHomework = (id: string) => {
    setHomework(prev => prev.map(h => 
      h.id === id ? { ...h, completed: !h.completed } : h
    ));
  };

  const deleteHomework = (id: string) => {
    setHomework(prev => prev.filter(h => h.id !== id));
  };

  const priorityColors = {
    low: "bg-green-500/10 text-green-600 dark:text-green-400",
    medium: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
    high: "bg-red-500/10 text-red-600 dark:text-red-400"
  };

  const pendingCount = homework.filter(h => !h.completed).length;
  const overdueCount = homework.filter(h => !h.completed && new Date(h.dueDate) < new Date()).length;

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-muted/50 rounded-lg text-center">
            <p className="text-3xl font-bold text-primary">{pendingCount}</p>
            <p className="text-sm text-muted-foreground">Pending Assignments</p>
          </div>
          <div className="p-4 bg-muted/50 rounded-lg text-center">
            <p className={`text-3xl font-bold ${overdueCount > 0 ? "text-red-500" : "text-green-500"}`}>
              {overdueCount}
            </p>
            <p className="text-sm text-muted-foreground">Overdue</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label>Subject</Label>
            <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject" data-testid="input-subject" />
          </div>
          <div className="space-y-2">
            <Label>Assignment</Label>
            <Input value={assignment} onChange={(e) => setAssignment(e.target.value)} placeholder="Assignment details" data-testid="input-assignment" />
          </div>
          <div className="space-y-2">
            <Label>Due Date</Label>
            <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} data-testid="input-due-date" />
          </div>
          <div className="space-y-2">
            <Label>Priority</Label>
            <Select value={priority} onValueChange={(v) => setPriority(v as Homework["priority"])}>
              <SelectTrigger data-testid="select-priority">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button onClick={addHomework} data-testid="button-add-homework">
          <Plus className="w-4 h-4 mr-2" /> Add Assignment
        </Button>

        <div className="space-y-2">
          {homework.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No assignments yet. Add one above!</p>
          ) : (
            homework.map(hw => (
              <div
                key={hw.id}
                className={`flex items-center gap-3 p-4 rounded-lg bg-muted/50 ${hw.completed ? "opacity-60" : ""}`}
                data-testid={`homework-${hw.id}`}
              >
                <Checkbox checked={hw.completed} onCheckedChange={() => toggleHomework(hw.id)} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className={`font-medium ${hw.completed ? "line-through" : ""}`}>{hw.subject}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${priorityColors[hw.priority]}`}>
                      {hw.priority}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{hw.assignment}</p>
                  <p className={`text-xs ${new Date(hw.dueDate) < new Date() && !hw.completed ? "text-red-500" : "text-muted-foreground"}`}>
                    Due: {new Date(hw.dueDate).toLocaleDateString()}
                  </p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => deleteHomework(hw.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))
          )}
        </div>
      </div>
    </ToolLayout>
  );
}

interface TimetableEntry {
  id: string;
  day: string;
  time: string;
  subject: string;
  room: string;
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function TimetableGenerator() {
  const tool = getToolById("timetable-generator")!;
  const [entries, setEntries] = useLocalStorage<TimetableEntry[]>("student-timetable", []);
  const [day, setDay] = useState("Monday");
  const [time, setTime] = useState("");
  const [subject, setSubject] = useState("");
  const [room, setRoom] = useState("");

  const addEntry = () => {
    if (!time || !subject.trim()) return;
    const entry: TimetableEntry = {
      id: Date.now().toString(),
      day,
      time,
      subject: subject.trim(),
      room: room.trim()
    };
    setEntries(prev => [...prev, entry].sort((a, b) => {
      const dayDiff = DAYS.indexOf(a.day) - DAYS.indexOf(b.day);
      if (dayDiff !== 0) return dayDiff;
      return a.time.localeCompare(b.time);
    }));
    setTime("");
    setSubject("");
    setRoom("");
  };

  const deleteEntry = (id: string) => {
    setEntries(prev => prev.filter(e => e.id !== id));
  };

  const getEntriesForDay = (d: string) => entries.filter(e => e.day === d);

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label>Day</Label>
            <Select value={day} onValueChange={setDay}>
              <SelectTrigger data-testid="select-day">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DAYS.map(d => (
                  <SelectItem key={d} value={d}>{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Time</Label>
            <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} data-testid="input-time" />
          </div>
          <div className="space-y-2">
            <Label>Subject</Label>
            <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject name" data-testid="input-subject" />
          </div>
          <div className="space-y-2">
            <Label>Room (optional)</Label>
            <Input value={room} onChange={(e) => setRoom(e.target.value)} placeholder="Room number" data-testid="input-room" />
          </div>
        </div>

        <Button onClick={addEntry} data-testid="button-add-entry">
          <Plus className="w-4 h-4 mr-2" /> Add Class
        </Button>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {DAYS.map(d => {
            const dayEntries = getEntriesForDay(d);
            return (
              <div key={d} className="bg-muted/50 rounded-lg p-4">
                <h3 className="font-semibold mb-3">{d}</h3>
                {dayEntries.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No classes</p>
                ) : (
                  <div className="space-y-2">
                    {dayEntries.map(entry => (
                      <div key={entry.id} className="flex items-center gap-2 p-2 bg-background rounded">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{entry.time}</p>
                          <p className="text-sm">{entry.subject}</p>
                          {entry.room && <p className="text-xs text-muted-foreground">Room: {entry.room}</p>}
                        </div>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => deleteEntry(entry.id)}>
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </ToolLayout>
  );
}

interface ExamCountdown {
  id: string;
  name: string;
  date: string;
  subject: string;
}

export function ExamCountdownTimer() {
  const tool = getToolById("exam-countdown")!;
  const [exams, setExams] = useLocalStorage<ExamCountdown[]>("student-exams", []);
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [date, setDate] = useState("");
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => forceUpdate(n => n + 1), 60000);
    return () => clearInterval(interval);
  }, []);

  const addExam = () => {
    if (!name.trim() || !date) return;
    const exam: ExamCountdown = {
      id: Date.now().toString(),
      name: name.trim(),
      subject: subject.trim(),
      date
    };
    setExams(prev => [...prev, exam].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
    setName("");
    setSubject("");
    setDate("");
  };

  const deleteExam = (id: string) => {
    setExams(prev => prev.filter(e => e.id !== id));
  };

  const getTimeRemaining = (examDate: string) => {
    const now = new Date();
    const target = new Date(examDate);
    const diff = target.getTime() - now.getTime();
    
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, passed: true };
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return { days, hours, minutes, passed: false };
  };

  const upcomingExams = exams.filter(e => new Date(e.date) >= new Date());

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Exam Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Final Exam" data-testid="input-name" />
          </div>
          <div className="space-y-2">
            <Label>Subject (optional)</Label>
            <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g., Mathematics" data-testid="input-subject" />
          </div>
          <div className="space-y-2">
            <Label>Exam Date</Label>
            <Input type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} data-testid="input-date" />
          </div>
        </div>

        <Button onClick={addExam} data-testid="button-add-exam">
          <Plus className="w-4 h-4 mr-2" /> Add Exam
        </Button>

        {upcomingExams.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No upcoming exams. Add one above!</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {upcomingExams.map(exam => {
              const remaining = getTimeRemaining(exam.date);
              return (
                <div
                  key={exam.id}
                  className={`p-6 rounded-xl border ${
                    remaining.days <= 3 ? "border-red-500 bg-red-500/5" : "border-border bg-muted/50"
                  }`}
                  data-testid={`exam-${exam.id}`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">{exam.name}</h3>
                      {exam.subject && <p className="text-sm text-muted-foreground">{exam.subject}</p>}
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(exam.date).toLocaleString()}
                      </p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => deleteExam(exam.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  {remaining.passed ? (
                    <p className="text-center text-muted-foreground">Exam has passed</p>
                  ) : (
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div className="p-3 bg-background rounded-lg">
                        <p className="text-3xl font-bold text-primary">{remaining.days}</p>
                        <p className="text-xs text-muted-foreground">Days</p>
                      </div>
                      <div className="p-3 bg-background rounded-lg">
                        <p className="text-3xl font-bold text-primary">{remaining.hours}</p>
                        <p className="text-xs text-muted-foreground">Hours</p>
                      </div>
                      <div className="p-3 bg-background rounded-lg">
                        <p className="text-3xl font-bold text-primary">{remaining.minutes}</p>
                        <p className="text-xs text-muted-foreground">Minutes</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
