import TableRow from "./TableRow";

export const logsData = [
  {
    timestamp: "2023-11-24 14:32:11",
    eventType: "Access Login",
    user: "Alex Rivera",
    equipment: "Master Console 01",
    action: "Authenticated User Session",
    status: "SUCCESS",
  },
  {
    timestamp: "2023-11-24 14:28:44",
    eventType: "Intrusion Detected",
    user: "Unknown IP (89.23.1.2)",
    equipment: "Core Switch A",
    action: "Multiple Brute Force Attempts",
    status: "FAILED",
  },
  {
    timestamp: "2023-11-24 14:25:12",
    eventType: "Firmware",
    user: "System (Auto)",
    equipment: "Thermal Sensor S12",
    action: "OTA Update Applied v3.4",
    status: "SUCCESS",
  },
  {
    timestamp: "2023-11-24 14:20:30",
    eventType: "Connectivity",
    user: "IoT Device",
    equipment: "Valve Controller 09",
    action: "High Latency Detected (450ms)",
    status: "WARNING",
  },
  {
    timestamp: "2023-11-24 14:18:02",
    eventType: "Access Login",
    user: "Maria Lopez",
    equipment: "Admin Panel 02",
    action: "User Session Started",
    status: "SUCCESS",
  },
  {
    timestamp: "2023-11-24 14:15:47",
    eventType: "Intrusion Detected",
    user: "Unknown IP (102.44.21.9)",
    equipment: "Firewall Node B",
    action: "Suspicious Port Scanning",
    status: "FAILED",
  },
  {
    timestamp: "2023-11-24 14:10:33",
    eventType: "Connectivity",
    user: "IoT Device",
    equipment: "Pump Controller 04",
    action: "Packet Loss 12%",
    status: "WARNING",
  },
  {
    timestamp: "2023-11-24 14:05:21",
    eventType: "Firmware",
    user: "System (Auto)",
    equipment: "Humidity Sensor H7",
    action: "OTA Update Applied v2.9",
    status: "SUCCESS",
  },
  {
    timestamp: "2023-11-24 14:02:10",
    eventType: "Access Login",
    user: "Daniel Kim",
    equipment: "Master Console 01",
    action: "Authenticated User Session",
    status: "SUCCESS",
  },
  {
    timestamp: "2023-11-24 13:59:55",
    eventType: "Intrusion Detected",
    user: "Unknown IP (77.12.88.4)",
    equipment: "Core Switch A",
    action: "Failed Login Attempts (x12)",
    status: "FAILED",
  },
  {
    timestamp: "2023-11-24 13:13:41",
    eventType: "Intrusion Detected",
    user: "Unknown IP (104.21.09.4)",
    equipment: "Humidity Sensor H7",
    action: "Suspicious Port Scanning",
    status: "FAILED",
  },
];


export default function LogsTable({ data }) {
  return (
    <div className="w-full overflow-x-auto rounded-xl border border-slate-200 shadow-sm bg-white">
      <table className="w-full text-left">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            <th className="px-6 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide">Timestamp</th>
            <th className="px-6 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide">Event Type</th>
            <th className="px-6 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide">User</th>
            <th className="px-6 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide">Equipment</th>
            <th className="px-6 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide">Action</th>
            <th className="px-6 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide">Status</th>
          </tr>
        </thead>

        <tbody>
          {data.map((log, index) => (
            <TableRow key={index} log={log} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
