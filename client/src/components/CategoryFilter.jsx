
const categories = [
  { name: "All stays", icon: "⌂" },
  { name: "Amazing views", icon: "◇" },
  { name: "Mountains", icon: "△" },
  { name: "Beachfront", icon: "♒" },
  { name: "Cabins", icon: "⌂" },
  { name: "Countryside", icon: "♧" },
  { name: "City", icon: "▦" },
];

export default function CategoryFilter({ selected, onSelect }) {
  return (
    <div className="category-bar">
      {categories.map((category) => (
        <button
          key={category.name}
          className={`category-item ${
            selected === category.name ? "selected" : ""
          }`}
          onClick={() => onSelect(category.name)}
        >
          <span className="category-icon">
            {category.icon}
          </span>

          <span>{category.name}</span>
        </button>
      ))}
    </div>
  );
}
