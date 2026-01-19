export default function CapacityBadge({ capacity, enrolled }) {
  const percent = (enrolled / capacity) * 100;

  let color = "green";
  if (percent >= 100) color = "red";
  else if (percent >= 70) color = "orange";

  return (
    <span style={{
      background: color,
      color: "white",
      padding: "3px 8px",
      borderRadius: 5
    }}>
      {enrolled}/{capacity} seats
    </span>
  );
}
