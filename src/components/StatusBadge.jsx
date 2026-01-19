export default function StatusBadge({ status }) {
  const colors = {
    Draft: "#999",
    Published: "green",
    Closed: "red",
    Open: "green",
    Full: "orange",
  };

  return (
    <span
      style={{
        background: colors[status] || "#ccc",
        color: "white",
        padding: "3px 8px",
        borderRadius: 5,
        fontSize: 12,
      }}
    >
      {status}
    </span>
  );
}
