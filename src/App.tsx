import { useEffect, useMemo, useState } from "react";

type Tab = "today" | "goals" | "habits" | "ai" | "history";
type GoalCategory =
  | "Здоровье"
  | "Учёба"
  | "Работа"
  | "Финансы"
  | "Развитие"
  | "Отношения"
  | "Хобби"
  | "Путешествия"
  | "Дом"
  | "Другое";

type Goal = {
  id: number;
  title: string;
  category: GoalCategory;
  progress: number;
  target: number;
  unit: string;
  deadline?: string;
};

type Habit = {
  id: number;
  title: string;
  icon: string;
  done: boolean;
};

const defaultGoals: Goal[] = [
  { id: 1, title: "Пробежать 10 км", category: "Здоровье", progress: 5.2, target: 10, unit: "км", deadline: "30 ноя" },
  { id: 2, title: "Изучать новое каждый день", category: "Развитие", progress: 18, target: 30, unit: "дней" },
  { id: 3, title: "Закончить важный проект", category: "Работа", progress: 62, target: 100, unit: "%" },
];

const defaultHabits: Habit[] = [
  { id: 1, title: "Выпить достаточно воды", icon: "💧", done: true },
  { id: 2, title: "Тренировка", icon: "🏋️", done: false },
  { id: 3, title: "30 минут учёбы", icon: "📚", done: true },
  { id: 4, title: "Лечь до 00:00", icon: "🌙", done: false },
];

function load<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

function App() {
  const [tab, setTab] = useState<Tab>("today");
  const [goals, setGoals] = useState<Goal[]>(() => load("life-goals", defaultGoals));
  const [habits, setHabits] = useState<Habit[]>(() => load("life-habits", defaultHabits));
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [newGoal, setNewGoal] = useState("");
  const [newCategory, setNewCategory] = useState<GoalCategory>("Здоровье");
  const [aiInput, setAiInput] = useState("");

  useEffect(() => {
    localStorage.setItem("life-goals", JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem("life-habits", JSON.stringify(habits));
  }, [habits]);

  const doneHabits = habits.filter((h) => h.done).length;
  const averageProgress = Math.round(
    goals.reduce((sum, g) => sum + Math.min(g.progress / g.target, 1), 0) /
      Math.max(goals.length, 1) *
      100
  );

  const telegramUser = window.Telegram?.WebApp?.initDataUnsafe.user;
  const displayName = telegramUser?.first_name || "Твоя жизнь";

  const recommendations = useMemo(
    () => [
      "Сегодня у тебя хороший потенциал для тренировки: привычки выполнены на 50%.",
      "Сон и восстановление стоит держать в фокусе, если завтра планируется высокая нагрузка.",
      "Цель «Пробежать 10 км» уже выполнена больше чем наполовину — продолжай маленькими шагами.",
    ],
    []
  );

  function toggleHabit(id: number) {
    setHabits((items) =>
      items.map((habit) =>
        habit.id === id ? { ...habit, done: !habit.done } : habit
      )
    );
  }

  function addGoal() {
    const title = newGoal.trim();
    if (!title) return;
    setGoals((items) => [
      ...items,
      {
        id: Date.now(),
        title,
        category: newCategory,
        progress: 0,
        target: 100,
        unit: "%",
      },
    ]);
    setNewGoal("");
    setShowGoalForm(false);
  }

  return (
    <div className="app">
      <header className="topbar">
        <div>
          <div className="eyebrow">LIFE / DIGITAL MIRROR</div>
          <h1>{tab === "today" ? `Привет, ${displayName}` : tabTitle(tab)}</h1>
        </div>
        <button className="avatar-button" onClick={() => setShowProfile(true)} aria-label="Профиль">
          <span className="pixel-avatar">🙂</span>
        </button>
      </header>

      <main className="content">
        {tab === "today" && (
          <>
            <section className="hero-card">
              <div>
                <span className="muted">Сегодня</span>
                <h2>Твой день</h2>
                <p>Не идеальный. Просто реальный.</p>
              </div>
              <div className="life-score">
                <strong>{averageProgress}</strong>
                <span>фокус</span>
              </div>
            </section>

            <section className="metric-grid">
              <Metric icon="🌙" label="Сон" value="7ч 42м" note="восстановление" />
              <Metric icon="⚡" label="Энергия" value="78%" note="хорошо" />
              <Metric icon="🚶" label="Активность" value="6.4к" note="шагов" />
              <Metric icon="🎯" label="Цели" value={`${averageProgress}%`} note="средний прогресс" />
            </section>

            <SectionTitle title="Сегодня" action="Открыть историю" onClick={() => setTab("history")} />
            <div className="timeline">
              <TimelineItem time="08:10" icon="☀️" title="Начало дня" text="Проснулся и начал день" />
              <TimelineItem time="14:30" icon="📚" title="Учёба" text="Работа над задачами" />
              <TimelineItem time="17:30" icon="🏋️" title="Тренировка" text="Запланировано" pending />
            </div>

            <SectionTitle title="Полезные привычки" action={`${doneHabits}/${habits.length}`} />
            <div className="habit-list">
              {habits.map((habit) => (
                <button
                  className={`habit-row ${habit.done ? "done" : ""}`}
                  key={habit.id}
                  onClick={() => toggleHabit(habit.id)}
                >
                  <span className="habit-icon">{habit.icon}</span>
                  <span>{habit.title}</span>
                  <span className="check">{habit.done ? "✓" : ""}</span>
                </button>
              ))}
            </div>
          </>
        )}

        {tab === "goals" && (
          <>
            <div className="section-head">
              <div>
                <span className="muted">Направления жизни</span>
                <h2>Мои цели</h2>
              </div>
              <button className="primary small" onClick={() => setShowGoalForm(true)}>+ Цель</button>
            </div>

            <div className="category-chips">
              {(["Здоровье", "Учёба", "Работа", "Финансы", "Развитие", "Хобби"] as GoalCategory[]).map(
                (category) => (
                  <span className="chip" key={category}>{category}</span>
                )
              )}
            </div>

            <div className="goal-list">
              {goals.map((goal) => {
                const percent = Math.min(Math.round((goal.progress / goal.target) * 100), 100);
                return (
                  <article className="goal-card" key={goal.id}>
                    <div className="goal-top">
                      <div>
                        <span className="tag">{goal.category}</span>
                        <h3>{goal.title}</h3>
                      </div>
                      <strong>{percent}%</strong>
                    </div>
                    <div className="progress"><span style={{ width: `${percent}%` }} /></div>
                    <div className="goal-bottom">
                      <span>{goal.progress} / {goal.target} {goal.unit}</span>
                      {goal.deadline && <span>до {goal.deadline}</span>}
                    </div>
                  </article>
                );
              })}
            </div>
          </>
        )}

        {tab === "habits" && (
          <>
            <section className="hero-card compact">
              <div>
                <span className="muted">Без наказаний и стресса</span>
                <h2>Полезные привычки</h2>
                <p>Отмечай то, что реально сделал.</p>
              </div>
              <div className="life-score"><strong>{doneHabits}</strong><span>сегодня</span></div>
            </section>
            <div className="habit-list large">
              {habits.map((habit) => (
                <button
                  className={`habit-row ${habit.done ? "done" : ""}`}
                  key={habit.id}
                  onClick={() => toggleHabit(habit.id)}
                >
                  <span className="habit-icon">{habit.icon}</span>
                  <span>{habit.title}</span>
                  <span className="check">{habit.done ? "✓" : ""}</span>
                </button>
              ))}
            </div>
          </>
        )}

        {tab === "ai" && (
          <>
            <section className="ai-card">
              <div className="ai-orb">✦</div>
              <div>
                <span className="muted">AI LIFE ADVISER</span>
                <h2>Я смотрю на твою жизнь целиком.</h2>
                <p>Цели, привычки, активность, сон и история — чтобы замечать закономерности.</p>
              </div>
            </section>

            <SectionTitle title="Что я заметил" />
            <div className="recommendations">
              {recommendations.map((text, index) => (
                <article className="recommendation" key={text}>
                  <span>{["💡", "⚠️", "🎯"][index]}</span>
                  <p>{text}</p>
                </article>
              ))}
            </div>

            <div className="ai-input">
              <input
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                placeholder="Спроси про свою жизнь…"
              />
              <button onClick={() => setAiInput("")}>→</button>
            </div>
          </>
        )}

        {tab === "history" && (
          <>
            <section className="hero-card compact">
              <div>
                <span className="muted">Твоя история</span>
                <h2>Жизнь во времени</h2>
                <p>События, изменения, достижения и воспоминания.</p>
              </div>
              <div className="calendar-icon">▦</div>
            </section>

            <div className="calendar">
              {["Пн","Вт","Ср","Чт","Пт","Сб","Вс"].map((d) => <span className="weekday" key={d}>{d}</span>)}
              {Array.from({ length: 30 }, (_, i) => (
                <button className={`day ${i === 7 ? "selected" : ""} ${[2,7,15,21].includes(i) ? "has-event" : ""}`} key={i}>
                  {i + 1}
                </button>
              ))}
            </div>

            <SectionTitle title="7 октября" />
            <div className="timeline">
              <TimelineItem time="09:20" icon="📚" title="Учёба" text="Работа над задачами" />
              <TimelineItem time="16:40" icon="🚶" title="Прогулка" text="42 минуты активности" />
              <TimelineItem time="21:10" icon="🎯" title="Цель" text="Обновлён прогресс" />
            </div>
          </>
        )}
      </main>

      <nav className="bottom-nav">
        <NavItem icon="⌂" label="Сегодня" active={tab === "today"} onClick={() => setTab("today")} />
        <NavItem icon="◎" label="Цели" active={tab === "goals"} onClick={() => setTab("goals")} />
        <NavItem icon="✓" label="Привычки" active={tab === "habits"} onClick={() => setTab("habits")} />
        <NavItem icon="✦" label="AI" active={tab === "ai"} onClick={() => setTab("ai")} />
        <NavItem icon="▦" label="История" active={tab === "history"} onClick={() => setTab("history")} />
      </nav>

      {showGoalForm && (
        <Modal title="Новая цель" onClose={() => setShowGoalForm(false)}>
          <input className="modal-input" value={newGoal} onChange={(e) => setNewGoal(e.target.value)} placeholder="Например: пробежать 10 км" autoFocus />
          <select className="modal-input" value={newCategory} onChange={(e) => setNewCategory(e.target.value as GoalCategory)}>
            {["Здоровье","Учёба","Работа","Финансы","Развитие","Отношения","Хобби","Путешествия","Дом","Другое"].map(c => <option key={c}>{c}</option>)}
          </select>
          <button className="primary full" onClick={addGoal}>Создать цель</button>
        </Modal>
      )}

      {showProfile && (
        <Modal title="Профиль" onClose={() => setShowProfile(false)}>
          <div className="profile">
            <div className="big-avatar">🙂</div>
            <h3>{displayName}</h3>
            <p className="muted">Твоя жизнь — твои данные.</p>
            <div className="profile-stat"><span>Целей</span><strong>{goals.length}</strong></div>
            <div className="profile-stat"><span>Привычек</span><strong>{habits.length}</strong></div>
            <div className="profile-stat"><span>Выполнено сегодня</span><strong>{doneHabits}</strong></div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function tabTitle(tab: Tab) {
  return ({ today: "Сегодня", goals: "Мои цели", habits: "Привычки", ai: "AI советник", history: "История" } as const)[tab];
}

function Metric({ icon, label, value, note }: { icon: string; label: string; value: string; note: string }) {
  return <div className="metric"><span className="metric-icon">{icon}</span><span className="muted">{label}</span><strong>{value}</strong><small>{note}</small></div>;
}

function SectionTitle({ title, action, onClick }: { title: string; action?: string; onClick?: () => void }) {
  return <div className="section-title"><h3>{title}</h3>{action && <button onClick={onClick}>{action}</button>}</div>;
}

function TimelineItem({ time, icon, title, text, pending }: { time: string; icon: string; title: string; text: string; pending?: boolean }) {
  return <div className={`timeline-item ${pending ? "pending" : ""}`}><span className="time">{time}</span><span className="event-icon">{icon}</span><div><strong>{title}</strong><p>{text}</p></div></div>;
}

function NavItem({ icon, label, active, onClick }: { icon: string; label: string; active: boolean; onClick: () => void }) {
  return <button className={`nav-item ${active ? "active" : ""}`} onClick={onClick}><span>{icon}</span><small>{label}</small></button>;
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return <div className="modal-backdrop" onClick={onClose}><div className="modal" onClick={(e) => e.stopPropagation()}><div className="modal-head"><h2>{title}</h2><button onClick={onClose}>×</button></div>{children}</div></div>;
}

export default App;