import { X, Cpu, Database, Server, Shield, BookOpen, Layers } from 'lucide-react';
import { useThemeStore } from '../stores/themeStore';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandReferenceModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  const theme = useThemeStore((state) => state.theme);
  if (!isOpen) return null;

  const isLight = theme === 'light';

  const modalBg = isLight ? 'rgba(255, 255, 255, 0.95)' : 'rgba(15, 15, 20, 0.95)';
  const textColor = isLight ? '#1f2937' : '#f3f4f6';
  const subtextColor = isLight ? '#4b5563' : '#9ca3af';
  const codeBg = isLight ? 'rgba(0, 0, 0, 0.06)' : 'rgba(255, 255, 255, 0.08)';
  const borderColor = isLight ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)';

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(0, 0, 0, 0.65)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        background: modalBg,
        color: textColor,
        border: `1px solid ${borderColor}`,
        borderRadius: '16px',
        width: '100%',
        maxWidth: '680px',
        maxHeight: '85vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: `1px solid ${borderColor}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BookOpen size={20} color="#00ffff" />
            <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 600 }}>coreSHell Command Reference</h3>
          </div>
          <button onClick={onClose} style={{
            background: 'none',
            border: 'none',
            color: subtextColor,
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center'
          }}>
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px', fontSize: '13px' }}>
          <div>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#00ffff' }}>1. Shell Built-ins</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div style={{ background: codeBg, padding: '10px', borderRadius: '8px' }}>
                <code style={{ fontWeight: 'bold' }}>cd &lt;dir&gt;</code>
                <div style={{ color: subtextColor, marginTop: '4px' }}>Change current directory (supports relative, absolute, and ~)</div>
              </div>
              <div style={{ background: codeBg, padding: '10px', borderRadius: '8px' }}>
                <code style={{ fontWeight: 'bold' }}>pwd</code>
                <div style={{ color: subtextColor, marginTop: '4px' }}>Print the current working directory path</div>
              </div>
              <div style={{ background: codeBg, padding: '10px', borderRadius: '8px' }}>
                <code style={{ fontWeight: 'bold' }}>echo [args...]</code>
                <div style={{ color: subtextColor, marginTop: '4px' }}>Print text or environment variables to stdout</div>
              </div>
              <div style={{ background: codeBg, padding: '10px', borderRadius: '8px' }}>
                <code style={{ fontWeight: 'bold' }}>type &lt;cmd&gt;</code>
                <div style={{ color: subtextColor, marginTop: '4px' }}>Identify whether a command is a builtin or executable</div>
              </div>
              <div style={{ background: codeBg, padding: '10px', borderRadius: '8px' }}>
                <code style={{ fontWeight: 'bold' }}>history</code>
                <div style={{ color: subtextColor, marginTop: '4px' }}>List past commands executed in this session</div>
              </div>
              <div style={{ background: codeBg, padding: '10px', borderRadius: '8px' }}>
                <code style={{ fontWeight: 'bold' }}>exit [code]</code>
                <div style={{ color: subtextColor, marginTop: '4px' }}>Exit and terminate the sandbox shell container</div>
              </div>
            </div>
          </div>

          <div>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#00ffff' }}>2. External Binaries & Coreutils</h4>
            <div style={{ background: codeBg, padding: '12px', borderRadius: '8px', lineHeight: '1.6' }}>
              Every sandbox container runs an isolated Linux userland with standard binaries:
              <br />
              <code style={{ color: '#00ff41' }}>ls -la</code> &nbsp;•&nbsp;
              <code style={{ color: '#00ff41' }}>cat &lt;file&gt;</code> &nbsp;•&nbsp;
              <code style={{ color: '#00ff41' }}>grep &lt;pattern&gt;</code> &nbsp;•&nbsp;
              <code style={{ color: '#00ff41' }}>tail -n 20</code> &nbsp;•&nbsp;
              <code style={{ color: '#00ff41' }}>wc -l</code> &nbsp;•&nbsp;
              <code style={{ color: '#00ff41' }}>find .</code>
            </div>
          </div>

          <div>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#00ffff' }}>3. I/O Redirection & Pipelines</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ background: codeBg, padding: '10px', borderRadius: '8px' }}>
                <code style={{ color: '#ffb3ba' }}>cmd1 | cmd2 | cmd3</code>
                <span style={{ color: subtextColor, marginLeft: '10px' }}>Stream output of cmd1 into stdin of cmd2</span>
              </div>
              <div style={{ background: codeBg, padding: '10px', borderRadius: '8px' }}>
                <code style={{ color: '#ffb3ba' }}>cmd &gt; output.txt</code>
                <span style={{ color: subtextColor, marginLeft: '10px' }}>Redirect standard output (overwrite)</span>
              </div>
              <div style={{ background: codeBg, padding: '10px', borderRadius: '8px' }}>
                <code style={{ color: '#ffb3ba' }}>cmd &gt;&gt; append.txt</code>
                <span style={{ color: subtextColor, marginLeft: '10px' }}>Redirect standard output (append mode)</span>
              </div>
              <div style={{ background: codeBg, padding: '10px', borderRadius: '8px' }}>
                <code style={{ color: '#ffb3ba' }}>cmd 2&gt; error.txt</code>
                <span style={{ color: subtextColor, marginLeft: '10px' }}>Redirect standard error</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '12px 20px', borderTop: `1px solid ${borderColor}`, display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{
            background: 'rgba(255, 255, 255, 0.1)',
            border: `1px solid ${borderColor}`,
            color: textColor,
            padding: '8px 16px',
            borderRadius: '8px',
            cursor: 'pointer'
          }}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export const ArchitectureModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  const theme = useThemeStore((state) => state.theme);
  if (!isOpen) return null;

  const isLight = theme === 'light';

  const modalBg = isLight ? 'rgba(255, 255, 255, 0.95)' : 'rgba(15, 15, 20, 0.95)';
  const textColor = isLight ? '#1f2937' : '#f3f4f6';
  const subtextColor = isLight ? '#4b5563' : '#9ca3af';
  const codeBg = isLight ? 'rgba(0, 0, 0, 0.06)' : 'rgba(255, 255, 255, 0.08)';
  const borderColor = isLight ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)';

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(0, 0, 0, 0.65)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        background: modalBg,
        color: textColor,
        border: `1px solid ${borderColor}`,
        borderRadius: '16px',
        width: '100%',
        maxWidth: '720px',
        maxHeight: '85vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: `1px solid ${borderColor}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Layers size={20} color="#ea1266" />
            <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 600 }}>coreSHell Distributed Architecture</h3>
          </div>
          <button onClick={onClose} style={{
            background: 'none',
            border: 'none',
            color: subtextColor,
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center'
          }}>
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '13px' }}>
          <div style={{ background: codeBg, padding: '14px', borderRadius: '10px', display: 'flex', gap: '12px' }}>
            <Server size={24} color="#00ffff" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <div style={{ fontWeight: 600, fontSize: '14px' }}>Real-time Bidirectional Streaming</div>
              <div style={{ color: subtextColor, marginTop: '4px' }}>
                React SPA interacts with Node.js via Socket.IO WebSocket streams. Terminal inputs and stdout/stderr are bridged sub-50ms directly to container PTY streams.
              </div>
            </div>
          </div>

          <div style={{ background: codeBg, padding: '14px', borderRadius: '10px', display: 'flex', gap: '12px' }}>
            <Shield size={24} color="#00ff41" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <div style={{ fontWeight: 600, fontSize: '14px' }}>Per-User Docker Sandbox Isolation</div>
              <div style={{ color: subtextColor, marginTop: '4px' }}>
                Each authenticated session spawns an isolated container with constrained CPU/memory limits and dedicated virtual filesystem, ensuring zero cross-tenant contamination.
              </div>
            </div>
          </div>

          <div style={{ background: codeBg, padding: '14px', borderRadius: '10px', display: 'flex', gap: '12px' }}>
            <Cpu size={24} color="#ffb3ba" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <div style={{ fontWeight: 600, fontSize: '14px' }}>Redis-Backed Session Reaper</div>
              <div style={{ color: subtextColor, marginTop: '4px' }}>
                When users disconnect, sessions enter a PAUSED state with a 10-minute TTL in Redis. Native keyspace expiration notifications automatically trigger the Reaper to terminate containers without polling.
              </div>
            </div>
          </div>

          <div style={{ background: codeBg, padding: '14px', borderRadius: '10px', display: 'flex', gap: '12px' }}>
            <Database size={24} color="#ea1266" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <div style={{ fontWeight: 600, fontSize: '14px' }}>Self-Hosted Docker Infrastructure</div>
              <div style={{ color: subtextColor, marginTop: '4px' }}>
                Containerized PostgreSQL 16 and Redis 7 with persistent Docker volumes ensure 100% independent cloud uptime without third-party database trial expirations.
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '12px 20px', borderTop: `1px solid ${borderColor}`, display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{
            background: 'rgba(255, 255, 255, 0.1)',
            border: `1px solid ${borderColor}`,
            color: textColor,
            padding: '8px 16px',
            borderRadius: '8px',
            cursor: 'pointer'
          }}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
