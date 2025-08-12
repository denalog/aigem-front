// components/dashboard/PatientList.tsx
const patients = [
  { id: 1, name: "김수현", room: "301호", status: "위험" },
  { id: 2, name: "이영희", room: "302호", status: "주의" },
  { id: 3, name: "박철수", room: "303호", status: "정상" },
];

const getColor = (status: string) => {
  switch (status) {
    case "위험": return "bg-red-500";
    case "주의": return "bg-yellow-400";
    case "정상": return "bg-green-500";
    default: return "bg-gray-300";
  }
};

export default function PatientList() {
  return (
    <div className="space-y-3">
      {patients.map((p) => (
        <div
          key={p.id}
          className="flex items-center justify-between p-3 rounded-lg shadow-md bg-white/60 backdrop-blur-md"
        >
          <div>
            <div className="text-md font-medium">{p.name}</div>
            <div className="text-sm text-gray-600">{p.room}</div>
          </div>
          <div
            className={`w-3 h-3 rounded-full ${getColor(p.status)}`}
            title={p.status}
          />
        </div>
      ))}
    </div>
  );
}
