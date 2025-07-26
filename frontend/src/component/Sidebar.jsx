export function Sidebar({ onSelect, selected, companies }) {
  return (
    <div className="sidebar">
      <h3>Companies</h3>
      <ul>
        {companies.map((company, index) => (
          <li
            key={index}
            className={selected === index ? 'active' : ''}
            onClick={() => onSelect(index)}
          >
            {company.name}
          </li>
        ))}
      </ul>
    </div>
  );
}