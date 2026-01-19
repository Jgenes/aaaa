import { Badge } from "react-bootstrap";
import "../app.css";
const categories = [
  "Business",
  "Artificial Intelligence",
  "Data Science",
  "Computer Science",
  "Information Technology",
  "Personal Development",
  "Healthcare",
  "Language Learning",
  "Social Sciences",
  "Arts and Humanities",
  "Physical Science and Engineering",
  "Math and Logic",
];

export default function CategoryChips() {
  return (
    <div className="d-flex flex-wrap gap-2">
      {categories.map((cat) => (
        <Badge
          key={cat}
          bg="light"
          text="dark"
          className="px-3 py-2 rounded-pill border"
        >
          {cat}
        </Badge>
      ))}
    </div>
  );
}
