import { useMemo, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import {
  Braces, Check, CheckCircle2, ChevronDown, Code2, Copy, Download,
  FileJson, FileUp, ShieldCheck, Sparkles, Trash2, WandSparkles,
  XCircle, ArrowDownUp, FileCode2, AlignLeft, Minimize2, TreePine,
} from 'lucide-react';
import JsonTree, { type JsonValue } from './components/JsonTree';
import {
  convertData, type Conversion, formatJson, getJsonErrorPosition,
  getTextStats, minifyJson, parseJson, SAMPLE_JSON, sortJsonKeys,
} from './lib/jsonTools';

type Tool = 'format' | 'minify' | 'validate' | 'tree' | 'convert';
type Notice = { type: 'success' | 'error' | 'info'; message: string };

const toolItems: { id: Tool; label: string; icon: typeof AlignLeft }[] = [
  { id: 'format', label: 'Format', icon: AlignLeft },
  { id: 'minify', label: 'Minify', icon: Minimize2 },
  { id: 'validate', label: 'Validate', icon: CheckCircle2 },
  { id: 'tree', label: 'Tree view', icon: TreePine },
  { id: 'convert', label: 'Convert', icon: ArrowDownUp },
];

const conversions: { value: Conversion; label: string; input: string; output: string }[] = [
  { value: 'json-csv', label: 'JSON → CSV', input: 'JSON', output: 'CSV' },
  { value: 'csv-json', label: 'CSV → JSON', input: 'CSV', output: 'JSON' },
  { value: 'json-yaml', label: 'JSON → YAML', input: 'JSON', output: 'YAML' },
  { value: 'yaml-json', label: 'YAML → JSON', input: 'YAML', output: 'JSON' },
];

function App() {
  const [input, setInput] = useState(SAMPLE_JSON);
  const [output, setOutput] = useState('');
  const [tool, setTool] = useState<Tool>('format');
  const [conversion, setConversion] = useState<Conversion>('json-yaml');
  const [notice, setNotice] = useState<Notice>({ type: 'info', message: 'Ready when you are. Your data stays in this browser.' });
  const [hasRun, setHasRun] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const inputStats = useMemo(() => getTextStats(input), [input]);
  const outputStats = useMemo(() => getTextStats(output), [output]);
  const selectedConversion = conversions.find((item) => item.value === conversion)!;

  function runTool(selectedTool = tool) {
    setHasRun(true);
    setCopied(false);
    try {
      if (!input.trim()) throw new Error('Add some data to the input panel first.');

      if (selectedTool === 'format') {
        const result = formatJson(input);
        setOutput(result);
        setNotice({ type: 'success', message: 'JSON formatted successfully.' });
      } else if (selectedTool === 'minify') {
        const result = minifyJson(input);
        setOutput(result);
        setNotice({ type: 'success', message: 'JSON minified successfully.' });
      } else if (selectedTool === 'validate') {
        parseJson(input);
        setOutput(formatJson(input));
        setNotice({ type: 'success', message: 'Valid JSON. No syntax errors found.' });
      } else if (selectedTool === 'tree') {
        const result = formatJson(input);
        setOutput(result);
        setNotice({ type: 'success', message: 'JSON parsed. Explore the structure in Tree view.' });
      } else {
        const result = convertData(input, conversion);
        setOutput(result);
        setNotice({ type: 'success', message: `Converted ${selectedConversion.input} to ${selectedConversion.output}.` });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Something went wrong.';
      setOutput('');
      setNotice({ type: 'error', message });
    }
  }

  function handleToolChange(nextTool: Tool) {
    setTool(nextTool);
    if (nextTool !== 'tree') runTool(nextTool);
    else runTool('tree');
  }

  function handleInputChange(event: ChangeEvent<HTMLTextAreaElement>) {
    setInput(event.target.value);
    setOutput('');
    setHasRun(false);
    setNotice({ type: 'info', message: 'Input changed. Run a tool to refresh the result.' });
  }

  // Read selected files locally with the browser File API.
  function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setInput(String(reader.result ?? ''));
      setHasRun(false);
      setNotice({ type: 'success', message: `${file.name} loaded successfully.` });
      setOutput('');
    };
    reader.onerror = () => setNotice({ type: 'error', message: 'Could not read that file.' });
    reader.readAsText(file);
    event.target.value = '';
  }

  // Clipboard access requires HTTPS or localhost in most browsers.
  async function copyOutput() {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setNotice({ type: 'error', message: 'Clipboard access was blocked by the browser.' });
    }
  }

  function downloadOutput() {
    if (!output) return;
    const extension = tool === 'convert' ? selectedConversion.output.toLowerCase() : 'json';
    const mime = extension === 'json' ? 'application/json' : 'text/plain';
    const blob = new Blob([output], { type: `${mime};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `json-toolkit-output.${extension}`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function clearAll() {
    setInput('');
    setOutput('');
    setHasRun(false);
    setNotice({ type: 'info', message: 'Workspace cleared.' });
  }

  function sortKeys() {
    setTool('format');
    try {
      const sorted = sortJsonKeys(parseJson(input));
      setOutput(JSON.stringify(sorted, null, 2));
      setHasRun(true);
      setNotice({ type: 'success', message: 'Object keys sorted alphabetically.' });
    } catch (error) {
      setOutput('');
      setNotice({ type: 'error', message: error instanceof Error ? error.message : 'Invalid JSON.' });
    }
  }

  const outputIsJson = hasRun && output.trim().length > 0 && (tool !== 'convert' || selectedConversion.output === 'JSON');
  const treeResult = useMemo(() => {
    if (!outputIsJson) return { ready: false, value: null };
    try { return { ready: true, value: JSON.parse(output) as JsonValue }; }
    catch { return { ready: false, value: null }; }
  }, [output, outputIsJson]);
  const errorPosition = notice.type === 'error' ? getJsonErrorPosition(notice.message, input) : null;

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="JSON Toolkit home">
          <span className="brand-mark"><Braces size={22} strokeWidth={2.5} /></span>
          <span>json<span className="brand-accent">toolkit</span></span>
        </a>
        <div className="topbar-right">
          <div className="privacy-chip"><ShieldCheck size={14} /> 100% Local Processing</div>
          <a className="github-link" href="https://github.com/" target="_blank" rel="noreferrer">
            <Code2 size={15} /> GitHub
          </a>
        </div>
      </header>

      <main id="top" className="main-content">
        <section className="hero">
          <div className="eyebrow"><Sparkles size={13} /> DEVELOPER UTILITIES</div>
          <h1>Work with JSON.<br /><span>Without the busywork.</span></h1>
          <p>A clean, private workspace to format, validate, explore, and convert your data.</p>
        </section>

        <section className="workspace" aria-label="JSON workspace">
          <div className="workspace-head">
            <div className="tool-tabs" role="tablist" aria-label="JSON tools">
              {toolItems.map(({ id, label, icon: Icon }) => (
                <button key={id} className={`tool-tab ${tool === id ? 'active' : ''}`} onClick={() => handleToolChange(id)} role="tab" aria-selected={tool === id}>
                  <Icon size={15} /> {label}
                </button>
              ))}
            </div>
            <div className="workspace-actions">
              <button className="text-action" onClick={sortKeys} title="Sort object keys"><WandSparkles size={14} /> Sort keys</button>
              <button className="icon-action danger-hover" onClick={clearAll} title="Clear workspace"><Trash2 size={15} /></button>
            </div>
          </div>

          {tool === 'convert' && (
            <div className="conversion-bar">
              <span>CONVERSION</span>
              <label className="select-wrap">
                <select value={conversion} onChange={(event) => { setConversion(event.target.value as Conversion); setOutput(''); setHasRun(false); }}>
                  {conversions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                </select>
                <ChevronDown size={14} />
              </label>
              <span className="conversion-hint">Runs entirely in your browser</span>
            </div>
          )}

          <div className="editor-grid">
            <section className="editor-panel">
              <div className="panel-heading">
                <div className="panel-title"><span className="panel-dot input-dot" />
                  <span>INPUT</span><span className="format-tag">{tool === 'convert' ? selectedConversion.input : 'JSON'}</span>
                </div>
                <div className="panel-tools">
                  <button onClick={() => fileInputRef.current?.click()} title="Upload a file"><FileUp size={14} /> <span>Upload</span></button>
                  <input ref={fileInputRef} type="file" accept=".json,.csv,.yaml,.yml,.txt,application/json,text/csv,text/plain" onChange={handleUpload} hidden />
                  <button onClick={() => { setInput(SAMPLE_JSON); setHasRun(false); setNotice({ type: 'info', message: 'Sample JSON loaded.' }); }} title="Load sample"><FileJson size={14} /> <span>Sample</span></button>
                </div>
              </div>
              <div className="textarea-wrap input-wrap">
                <div className="line-gutter" aria-hidden="true">{Array.from({ length: Math.max(input.split('\n').length, 1) }, (_, index) => <span key={index}>{index + 1}</span>)}</div>
                <textarea
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={(event) => { if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') runTool(); }}
                  spellCheck={false}
                  autoCapitalize="off"
                  autoCorrect="off"
                  aria-label="Input data"
                  placeholder={'Paste your JSON here...\n\n{\n  "hello": "world"\n}'}
                />
              </div>
              <div className="panel-footer">
                <span>{inputStats.lines} lines</span><span>{inputStats.characters.toLocaleString()} chars</span><span>{inputStats.bytes.toLocaleString()} B</span>
              </div>
            </section>

            <div className="run-column">
              <button className="run-button" onClick={() => runTool()}>
                <WandSparkles size={16} /> <span>{tool === 'validate' ? 'Validate' : tool === 'convert' ? 'Convert' : tool === 'tree' ? 'Explore' : tool === 'minify' ? 'Minify' : 'Format'}</span>
                <kbd>⌘ ↵</kbd>
              </button>
              <div className="run-divider"><span /></div>
              <div className="run-caption">PROCESS</div>
            </div>

            <section className="editor-panel output-panel">
              <div className="panel-heading">
                <div className="panel-title"><span className="panel-dot output-dot" />
                  <span>OUTPUT</span><span className="format-tag output-tag">{tool === 'convert' ? selectedConversion.output : 'JSON'}</span>
                </div>
                <div className="panel-tools">
                  <button onClick={copyOutput} disabled={!output} title="Copy output">{copied ? <Check size={14} /> : <Copy size={14} />} <span>{copied ? 'Copied' : 'Copy'}</span></button>
                  <button onClick={downloadOutput} disabled={!output} title="Download output"><Download size={14} /> <span>Export</span></button>
                </div>
              </div>
              {tool === 'tree' && treeResult.ready ? (
                <div className="tree-view"><JsonTree value={treeResult.value} /></div>
              ) : (
                <div className="textarea-wrap output-wrap">
                  {output ? <pre className="output-code">{output}</pre> : (
                    <div className="empty-state">
                      <div className="empty-icon"><FileCode2 size={22} /></div>
                      <strong>Your result will appear here</strong>
                      <span>Choose a tool and run it to get started.</span>
                    </div>
                  )}
                </div>
              )}
              <div className="panel-footer">
                <span>{outputStats.lines} lines</span><span>{outputStats.characters.toLocaleString()} chars</span><span>{outputStats.bytes.toLocaleString()} B</span>
              </div>
            </section>
          </div>

          <div className={`status-bar status-${notice.type}`}>
            {notice.type === 'success' ? <CheckCircle2 size={15} /> : notice.type === 'error' ? <XCircle size={15} /> : <ShieldCheck size={15} />}
            <span>{notice.message}</span>
            {errorPosition && <span className="error-position">Line {errorPosition.line}, column {errorPosition.column}</span>}
            <span className="status-spacer" />
            <span className="status-label">{notice.type === 'success' ? 'DONE' : notice.type === 'error' ? 'ERROR' : 'READY'}</span>
          </div>
        </section>

        <section className="feature-strip" aria-label="Features">
          <div className="feature-item"><span className="feature-icon"><ShieldCheck size={17} /></span><div><strong>Private by design</strong><span>Your data never leaves your device.</span></div></div>
          <div className="feature-item"><span className="feature-icon"><ZapIcon /></span><div><strong>Instant results</strong><span>No accounts, no waiting, no setup.</span></div></div>
          <div className="feature-item"><span className="feature-icon"><Braces size={17} /></span><div><strong>Developer focused</strong><span>Useful tools, without the clutter.</span></div></div>
        </section>

        <footer className="footer"><span>JSON TOOLKIT <span className="footer-separator">/</span> OPEN SOURCE DEVELOPER UTILITY</span><span>Built for the web. Runs in your browser.</span></footer>
      </main>
    </div>
  );
}

function ZapIcon() {
  return <Minimize2 size={17} />;
}

export default App;
