import { getRole } from '../../roleStore';
import { maskAccount } from '../../utils/maskAccount';

/**
 * ActionLog Component
 * 
 * Displays rich audit trail with reasoning and graph cross-linking.
 * Dark enterprise styling — terminal aesthetic.
 */
const ActionLog = ({ logs, onLogClick }) => {
  const role = getRole();
  const isViewer = role !== 'admin';

  const getActionColor = (type) => {
    switch (type) {
      case 'FREEZE': return '#60a5fa';
      case 'FLAG':   return '#fbbf24';
      case 'ALERT':  return '#a78bfa';
      default:       return '#64748b';
    }
  };

  const formatTarget = (target) => {
    if (!target || target === 'GLOBAL' || target === 'SUSPECTS') return target;
    return isViewer ? maskAccount(target) : target;
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
      overflowY: 'auto',
      maxHeight: '280px',
      padding: '2px'
    }}>
      <h4 style={{ 
        margin: '0 0 6px 0', 
        fontSize: '0.6rem', 
        color: '#475569', 
        textTransform: 'uppercase', 
        letterSpacing: '0.12em',
        fontFamily: 'JetBrains Mono, monospace'
      }}>
        Audit Trail
      </h4>
      
      {logs.length === 0 && (
        <div style={{ 
          fontSize: '0.75rem', color: '#374151', fontStyle: 'italic',
          fontFamily: 'JetBrains Mono, monospace', padding: '8px 0'
        }}>
          Initializing investigation ledger...
        </div>
      )}

      {logs.map((log) => (
        <div 
          key={log.action_id} 
          onClick={() => log.target !== 'GLOBAL' && onLogClick(log.target)}
          style={{
            fontSize: '0.7rem',
            fontFamily: 'JetBrains Mono, monospace',
            padding: '9px 10px',
            background: log.status === 'NACK' ? 'rgba(127,29,29,0.25)' : '#0d1829',
            border: `1px solid ${log.status === 'NACK' ? 'rgba(239,68,68,0.25)' : '#1e293b'}`,
            borderRadius: '8px',
            cursor: log.target !== 'GLOBAL' ? 'pointer' : 'default',
            transition: 'all 0.15s ease',
            boxShadow: log.status === 'NACK' ? 'inset 0 1px 0 rgba(239,68,68,0.1)' : 'none'
          }}
          onMouseEnter={(e) => {
            if (log.target !== 'GLOBAL') {
              e.currentTarget.style.background = log.status === 'NACK' ? 'rgba(127,29,29,0.4)' : '#111927';
              e.currentTarget.style.borderColor = log.status === 'NACK' ? 'rgba(239,68,68,0.4)' : '#293548';
            }
          }}
          onMouseLeave={(e) => {
            if (log.target !== 'GLOBAL') {
              e.currentTarget.style.background = log.status === 'NACK' ? 'rgba(127,29,29,0.25)' : '#0d1829';
              e.currentTarget.style.borderColor = log.status === 'NACK' ? 'rgba(239,68,68,0.25)' : '#1e293b';
            }
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
            <div style={{ color: '#475569', overflow: 'hidden' }}>
              <span style={{ color: '#374151' }}>[{log.timestamp}]</span>{' '}
              <span style={{ fontWeight: 800, color: getActionColor(log.action_type) }}>{log.action_type}</span>{' '}
              <span style={{ color: '#94a3b8' }}>{formatTarget(log.target)}</span>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: '8px' }}>
              <span style={{ 
                color: log.status === 'ACK' ? '#34d399' : '#f87171', 
                fontWeight: 800 
              }}>
                {log.status}
              </span>
            </div>
          </div>
          
          <div style={{ fontSize: '0.6rem', color: '#374151', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontStyle: 'italic', maxWidth: '70%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {log.reason || 'System Action'}
            </span>
            <span style={{ color: '#475569' }}>{log.latency}ms</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ActionLog;
