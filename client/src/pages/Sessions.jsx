import { useState, useEffect } from "react";

import AdminSidebar from "../components/AdminSidebar";
import SessionsHeader from "../components/Sessions/SessionsHeader";
import SessionsStats from "../components/Sessions/SessionsStats";
import SessionsTable from "../components/Sessions/SessionsTable";
import SessionsPagination from "../components/Sessions/SessionsPagination";

export default function Sessions() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const perPage = 6;
  const [page, setPage] = useState(1);


  const sessions = [
  {
    id: "9a6d66dc",
    user: "Harry Potter (USER)",
    hardware: "fan-1 main-1",
    mode: "MANUAL",
    started: "2024-10-24 14:45:22",
    status: "ACTIVE",
    time: "12:44",
    durationMinutes: 30,
    action: "Terminate",
  },
  {
    id: "4f2e88ab",
    user: "Hermione Granger (ADMIN)",
    hardware: "pump-v2 cooling-3",
    mode: "AUTO-OVR",
    started: "2024-10-24 15:10:05",
    status: "ACTIVE",
    time: "45:20",
    durationMinutes: 60,
    action: "Terminate",
  },
  {
    id: "1c4d99fa",
    user: "Ron Weasley (USER)",
    hardware: "fan-2 main-1",
    mode: "MANUAL",
    started: "2024-10-24 12:30:11",
    status: "ENDED",
    time: "Completed (60m)",
    action: "View Logs",
  },
  {
    id: "2b5e003a",
    user: "Albus Dumbledore (ADMIN)",
    hardware: "core-reactor power-bay-1",
    mode: "MAINTENANCE",
    started: "2024-10-24 10:15:45",
    status: "ENDED",
    time: "Force Terminated",
    action: "View Logs",
  },

  {
    id: "7c1a22bd",
    user: "Severus Snape (ADMIN)",
    hardware: "pump-v3 coolant-2",
    mode: "AUTO",
    started: "2024-10-24 09:12:33",
    status: "ACTIVE",
    time: "32:10",
    durationMinutes: 60,
    action: "Terminate",
  },
  {
    id: "8d9f11ac",
    user: "Luna Lovegood (USER)",
    hardware: "fan-3 main-2",
    mode: "MANUAL",
    started: "2024-10-24 11:02:18",
    status: "ACTIVE",
    time: "05:44",
    durationMinutes: 30,
    action: "Terminate",
  },

  {
    id: "5e7b44cc",
    user: "Draco Malfoy (USER)",
    hardware: "valve-1 chamber-4",
    mode: "AUTO",
    started: "2024-10-24 08:55:01",
    status: "ENDED",
    time: "Completed (45m)",
    action: "View Logs",
  },
  {
    id: "3a9d77ef",
    user: "Minerva McGonagall (ADMIN)",
    hardware: "core-reactor power-bay-2",
    mode: "MAINTENANCE",
    started: "2024-10-24 07:40:12",
    status: "ENDED",
    time: "Force Terminated",
    action: "View Logs",
  },

  {
    id: "6f2b88aa",
    user: "Neville Longbottom (USER)",
    hardware: "pump-v1 cooling-1",
    mode: "AUTO",
    started: "2024-10-24 13:22:55",
    status: "ACTIVE",
    time: "22:11",
    durationMinutes: 60,
    action: "Terminate",
  },
  {
    id: "4c7e55bb",
    user: "Cho Chang (USER)",
    hardware: "fan-4 main-3",
    mode: "MANUAL",
    started: "2024-10-24 09:50:44",
    status: "ACTIVE",
    time: "18:33",
    durationMinutes: 30,
    action: "Terminate",
  },

  {
    id: "9e1d22cc",
    user: "Sirius Black (ADMIN)",
    hardware: "valve-3 chamber-1",
    mode: "AUTO-OVR",
    started: "2024-10-24 06:15:22",
    status: "ENDED",
    time: "Completed (90m)",
    action: "View Logs",
  },
  {
    id: "1b4f33dd",
    user: "Remus Lupin (ADMIN)",
    hardware: "pump-v4 cooling-5",
    mode: "MAINTENANCE",
    started: "2024-10-24 05:44:10",
    status: "ENDED",
    time: "Force Terminated",
    action: "View Logs",
  },

  {
    id: "2d8a66ee",
    user: "Ginny Weasley (USER)",
    hardware: "fan-5 main-4",
    mode: "MANUAL",
    started: "2024-10-24 14:01:33",
    status: "ACTIVE",
    time: "09:12",
    durationMinutes: 30,
    action: "Terminate",
  },
  {
    id: "7f3c11ff",
    user: "Fred Weasley (USER)",
    hardware: "valve-2 chamber-3",
    mode: "AUTO",
    started: "2024-10-24 13:10:10",
    status: "ACTIVE",
    time: "28:44",
    durationMinutes: 60,
    action: "Terminate",
  },
  {
    id: "8a9d22aa",
    user: "George Weasley (USER)",
    hardware: "pump-v2 cooling-4",
    mode: "AUTO-OVR",
    started: "2024-10-24 12:44:55",
    status: "ACTIVE",
    time: "14:22",
    durationMinutes: 30,
    action: "Terminate",
  },

  {
    id: "3c4e55bb",
    user: "Filius Flitwick (ADMIN)",
    hardware: "core-reactor power-bay-3",
    mode: "MAINTENANCE",
    started: "2024-10-24 04:22:11",
    status: "ENDED",
    time: "Force Terminated",
    action: "View Logs",
  },
  {
    id: "5d7f88cc",
    user: "Rubeus Hagrid (USER)",
    hardware: "fan-6 main-5",
    mode: "MANUAL",
    started: "2024-10-24 10:33:21",
    status: "ACTIVE",
    time: "33:10",
    durationMinutes: 60,
    action: "Terminate",
  },
];



  const [sessionsState, setSessionsState] = useState(
    sessions.map(s => {
      if (s.status !== "ACTIVE") return s;

      const [mm, ss] = s.time.split(":").map(Number);
      const remainingSeconds = mm * 60 + ss;

      const totalSeconds = s.durationMinutes * 60;


      return {
        ...s,
        remainingSeconds,
        totalSeconds
      };
    })
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setSessionsState(prev =>
        prev.map(s => {
          if (s.status !== "ACTIVE") return s;

          const newRemaining = s.remainingSeconds - 1;

          if (newRemaining <= 0) {
            const minutes = Math.round(s.totalSeconds / 60);
            return {
              ...s,
              status: "ENDED",
              time: `Completed (${minutes}m)`,
              percent: 0,
              remainingSeconds: 0
            };
          }

          const newPercent = Math.round(((s.totalSeconds - newRemaining) / s.totalSeconds) * 100);


          const mm = Math.floor(newRemaining / 60);
          const ss = newRemaining % 60;

          return {
            ...s,
            remainingSeconds: newRemaining,
            percent: newPercent,
            time: `${mm}:${ss.toString().padStart(2, "0")}`
          };
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleTerminate = (id) => {
    setSessionsState(prev =>
      prev.map(s => {
        if (s.id !== id) return s;

        const elapsedSeconds = s.totalSeconds - s.remainingSeconds;
        const elapsedMinutes = Math.round(elapsedSeconds / 60);

        return {
            ...s,
            status: "ENDED",
            time: `Force Terminated (${elapsedMinutes}m)`,
            percent: 0,
            remainingSeconds: 0
        };
      })
    );
  };

  const totalItems = sessionsState.length;
  const start = (page - 1) * perPage;
  const end = start + perPage;
  const pageData = sessionsState.slice(start, end);

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">

      <AdminSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="max-w-[1400px] mx-auto">

          <SessionsHeader setSidebarOpen={setSidebarOpen} />

          <div className="space-y-10">

            <SessionsStats />

            <section>
              <SessionsTable
                data={pageData}
                onTerminate={handleTerminate}
              />

              <SessionsPagination
                totalItems={totalItems}
                perPage={perPage}
                page={page}
                setPage={setPage}
              />
            </section>

          </div>

        </div>
      </main>
    </div>
  );
}
