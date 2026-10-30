
const categories = [
  "All stays",
  "Amazing views",
  "Iconic cities",
  "Beachfront",
  "Cabins",
  "Countryside",
];

export default function CategoryFilter({ selected, onSelect }) {
  return (
    <div className="category-bar">
      {categories.map((category, index) => (
        <button
          key={category}
          className={`category-item ${
            selected === category ? "selected" : ""
          }`}
          onClick={() => onSelect(category)}
        >
          <span className="category-icon">
            {["⌂", "◇", "▦", "♒", "⌂", "♧"][index]}
          </span>
          <span>{category}</span>
        </button>
      ))}
    </div>
  );
}
