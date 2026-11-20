import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

export type JsonValue = null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue };

type Props = {
  value: JsonValue;
  name?: string;
  depth?: number;
};

function getKind(value: JsonValue) {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  return typeof value;
}

export default function JsonTree({ value, name = 'root', depth = 0 }: Props) {
  const [expanded, setExpanded] = useState(depth < 2);
  const isContainer = value !== null && typeof value === 'object';
  const entries = Array.isArray(value)
    ? value.map((item, index) => [String(index), item] as const)
    : isContainer
      ? Object.entries(value)
      : [];
  const kind = getKind(value);

  const preview = Array.isArray(value)
    ? `Array(${value.length})`
    : isContainer
      ? `Object(${entries.length})`
      : '';

  if (!isContainer) {
    return (
      <div className="tree-row" style={{ paddingLeft: depth * 19 }}>
        {name !== 'root' && <span className="tree-key">{name}:</span>}
        <span className={`tree-value tree-${kind}`}>
          {typeof value === 'string' ? JSON.stringify(value) : String(value)}
        </span>
      </div>
    );
  }

  return (
    <div>
      <button
        className="tree-toggle"
        style={{ paddingLeft: depth * 19 }}
        onClick={() => setExpanded((current) => !current)}
        aria-expanded={expanded}
      >
        {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        {name !== 'root' && <span className="tree-key">{name}:</span>}
        <span className="tree-bracket">{kind === 'array' ? '[' : '{'}</span>
        <span className="tree-preview">{preview}</span>
        {!expanded && <span className="tree-bracket">{kind === 'array' ? ']' : '}'}</span>}
      </button>
      {expanded && (
        <div>
          {entries.map(([key, child]) => (
            <JsonTree key={`${depth}-${key}`} value={child as JsonValue} name={key} depth={depth + 1} />
          ))}
          <div className="tree-row" style={{ paddingLeft: depth * 19 + 19 }}>
            <span className="tree-bracket">{kind === 'array' ? ']' : '}'}</span>
          </div>
        </div>
      )}
    </div>
  );
}
