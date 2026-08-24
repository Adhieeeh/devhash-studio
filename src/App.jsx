import React, { useState, useMemo } from 'react';


const hashToDegrees = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % 360;
};


const INITIAL_PHYSICAL_NODES = [
  { id: 'node-alpha', name: 'Node Alpha', color: '#38bdf8' },
  { id: 'node-beta', name: 'Node Beta', color: '#a855f7' },
  { id: 'node-gamma', name: 'Node Gamma', color: '#10b981' }
];

const INITIAL_KEYS = [
  { id: 'k1', key: 'user:session:9940' },
  { id: 'k2', key: 'cart:item:4012' },
  { id: 'k3', key: 'order:invoice:8812' },
  { id: 'k4', key: 'auth:token:5519' },
  { id: 'k5', key: 'image:thumb:3002' },
  { id: 'k6', key: 'cache:profile:1120' }
];

function App() {
  
  const [nodes, setNodes] = useState(INITIAL_PHYSICAL_NODES);
  const [vnodesPerNode, setVnodesPerNode] = useState(3);
  const [keys, setKeys] = useState(INITIAL_KEYS);
  
  
  const [newNodeName, setNewNodeName] = useState('');
  const [inputDataKey, setInputDataKey] = useState('');
  const [searchKey, setSearchKey] = useState('');

  
  const [clusterLogs, setClusterLogs] = useState([
    ' DevHash Distributed Ring initialized. 3 Physical nodes mapped across 360° token space.'
  ]);


  const ringVNodes = useMemo(() => {
    const vnodeList = [];
    nodes.forEach(node => {
      for (let v = 0; v < vnodesPerNode; v++) {
        const vnodeId = `${node.id}-vn${v}`;
        const degree = hashToDegrees(vnodeId);
        vnodeList.push({
          id: vnodeId,
          physicalNodeId: node.id,
          physicalNodeName: node.name,
          color: node.color,
          degree
        });
      }
    });
   
    return vnodeList.sort((a, b) => a.degree - b.degree);
  }, [nodes, vnodesPerNode]);

  
  const mappedKeys = useMemo(() => {
    if (ringVNodes.length === 0) return [];

    return keys.map(k => {
      const keyDegree = hashToDegrees(k.key);
      
      let targetVNode = ringVNodes.find(vn => vn.degree >= keyDegree);
      if (!targetVNode) {
        
        targetVNode = ringVNodes[0];
      }

      return {
        ...k,
        degree: keyDegree,
        assignedVNode: targetVNode.id,
        assignedNodeId: targetVNode.physicalNodeId,
        assignedNodeName: targetVNode.physicalNodeName,
        assignedColor: targetVNode.color
      };
    });
  }, [keys, ringVNodes]);

  
  const handleAddNode = (e) => {
    e.preventDefault();
    if (!newNodeName.trim()) return;

    const colors = ['#f43f5e', '#fbbf24', '#06b6d4', '#ec4899', '#8b5cf6'];
    const assignedColor = colors[nodes.length % colors.length];

    const freshNode = {
      id: `node-${Date.now().toString().slice(-4)}`,
      name: newNodeName.trim(),
      color: assignedColor
    };

    setNodes(prev => [...prev, freshNode]);
    setClusterLogs(prev => [
      ` REBALANCE EVENT: Added [${freshNode.name}] to ring with ${vnodesPerNode} vnodes. Slices recalculated.`,
      ...prev
    ]);
    setNewNodeName('');
  };

  
  const handleRemoveNode = (nodeId) => {
    if (nodes.length <= 1) {
      setClusterLogs(prev => ['❌ CLUSTER ERROR: Cannot drain last operational node.', ...prev]);
      return;
    }
    const targetNode = nodes.find(n => n.id === nodeId);
    setNodes(prev => prev.filter(n => n.id !== nodeId));
    setClusterLogs(prev => [
      ` REBALANCE EVENT: Drained node [${targetNode.name}]. Only impacted token ranges remapped.`,
      ...prev
    ]);
  };


  const handleAddKey = (e) => {
    e.preventDefault();
    if (!inputDataKey.trim()) return;

    const cleanKey = inputDataKey.trim();
    if (keys.some(k => k.key === cleanKey)) return;

    const freshKeyObj = {
      id: `k-${Date.now().toString().slice(-4)}`,
      key: cleanKey
    };

    setKeys(prev => [freshKeyObj, ...prev]);
    const deg = hashToDegrees(cleanKey);
    setClusterLogs(prev => [
      ` KEY INGESTED: [${cleanKey}] hashed to ${deg}° on ring.`,
      ...prev
    ]);
    setInputDataKey('');
  };

  
  const handleTraceLookup = (e) => {
    e.preventDefault();
    if (!searchKey.trim()) return;

    const cleanKey = searchKey.trim();
    const deg = hashToDegrees(cleanKey);

    let targetVNode = ringVNodes.find(vn => vn.degree >= deg);
    if (!targetVNode) targetVNode = ringVNodes[0];

    setClusterLogs(prev => [
      ` ROUTING TRACE [${cleanKey}]: Token ${deg}° ➔ Clockwise Coordinator: [${targetVNode.physicalNodeName}] (${targetVNode.id})`,
      ...prev
    ]);
  };

  return (
    <div style={{ maxWidth: '1350px', margin: '30px auto', padding: '0 24px', fontFamily: 'monospace', backgroundColor: '#070a13', color: '#f8fafc', minHeight: '92vh' }}>
      
      
      <header style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1e293b', paddingBottom: '20px', marginBottom: '30px', gap: '20px' }}>
        <div>
          <h1 style={{ margin: '0', fontSize: '24px', fontWeight: 'bold', color: '#38bdf8', letterSpacing: '-0.5px' }}> DevHash Consistent Hashing & Ring Sharding Studio</h1>
          <p style={{ margin: '4px 0 0 0', color: '#475569', fontSize: '12px' }}>
            Interactive 360° Distributed Token Ring: Virtual node distribution (vnodes), zero-downtime cluster rebalancing & routing telemetry.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', padding: '8px 16px', borderRadius: '8px', fontSize: '12px' }}>
            <span style={{ color: '#64748b' }}>Active Token Slices: </span>
            <strong style={{ color: '#38bdf8' }}>{ringVNodes.length} VNodes</strong>
          </div>
        </div>
      </header>

      
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr 340px', gap: '25px', marginBottom: '30px' }}>
        
        
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          
          <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '14px', padding: '20px' }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '12px', color: '#64748b', textTransform: 'uppercase' }}>Provision Cluster Node</h3>
            <form onSubmit={handleAddNode} style={{ display: 'flex', gap: '8px' }}>
              <input type="text" placeholder="Node Name (e.g. Node Delta)" value={newNodeName} onChange={(e) => setNewNodeName(e.target.value)} style={{ flex: 1, padding: '8px 12px', backgroundColor: '#070a13', border: '1px solid #1e293b', borderRadius: '6px', color: '#fff', fontSize: '12px', boxSizing: 'border-box' }} />
              <button type="submit" style={{ padding: '8px 14px', backgroundColor: '#38bdf8', color: '#070a13', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>Add ➕</button>
            </form>
          </div>

          
          <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '14px', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <h3 style={{ margin: 0, fontSize: '12px', color: '#64748b', textTransform: 'uppercase' }}>VNodes per Physical Node</h3>
              <span style={{ fontSize: '12px', color: '#38bdf8', fontWeight: 'bold' }}>{vnodesPerNode} VNodes</span>
            </div>
            <input type="range" min="1" max="8" value={vnodesPerNode} onChange={(e) => setVnodesPerNode(Number(e.target.value))} style={{ width: '100%', accentColor: '#38bdf8', cursor: 'pointer' }} />
            <p style={{ margin: '8px 0 0 0', fontSize: '10px', color: '#475569', lineHeight: '1.4' }}>
              Higher vnodes distribute ring slices uniformly, mitigating data hotspot skews across server instances.
            </p>
          </div>

          
          <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '14px', padding: '20px', flexGrow: 1 }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '12px', color: '#64748b', textTransform: 'uppercase' }}>Physical Nodes Cluster</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {nodes.map(n => {
                const keyCount = mappedKeys.filter(k => k.assignedNodeId === n.id).length;
                return (
                  <div key={n.id} style={{ backgroundColor: '#070a13', border: `1px solid ${n.color}`, borderRadius: '8px', padding: '10px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong style={{ color: n.color, fontSize: '12px' }}>{n.name}</strong>
                      <div style={{ fontSize: '10px', color: '#64748b' }}>Shard Load: {keyCount} Keys</div>
                    </div>
                    <button onClick={() => handleRemoveNode(n.id)} style={{ padding: '4px 8px', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', borderRadius: '4px', fontSize: '10px', cursor: 'pointer' }}>Drain</button>
                  </div>
                );
              })}
            </div>
          </div>

        </aside>

        
        <main style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '14px', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', minHeight: '440px' }}>
          <h3 style={{ position: 'absolute', top: 20, left: 20, margin: 0, fontSize: '12px', color: '#64748b', textTransform: 'uppercase' }}>360° Continuous Hash Ring Space</h3>

          <div style={{ position: 'relative', width: '320px', height: '320px', borderRadius: '50%', border: '2px dashed #1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '20px' }}>
            
            {/* Center Cluster Hub HUD */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#38bdf8' }}>{keys.length}</div>
              <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase' }}>Mapped Keys</div>
            </div>

            
            {ringVNodes.map(vn => {
              const rad = (vn.degree - 90) * (Math.PI / 180);
              const x = 160 + 150 * Math.cos(rad);
              const y = 160 + 150 * Math.sin(rad);

              return (
                <div
                  key={vn.id}
                  title={`${vn.physicalNodeName} (${vn.id}) @ ${vn.degree}°`}
                  style={{
                    position: 'absolute',
                    left: `${x - 7}px`,
                    top: `${y - 7}px`,
                    width: '14px',
                    height: '14px',
                    borderRadius: '50%',
                    backgroundColor: vn.color,
                    boxShadow: `0 0 8px ${vn.color}`,
                    cursor: 'pointer',
                    zIndex: 2
                  }}
                />
              );
            })}

            
            {mappedKeys.map(k => {
              const rad = (k.degree - 90) * (Math.PI / 180);
              const x = 160 + 115 * Math.cos(rad);
              const y = 160 + 115 * Math.sin(rad);

              return (
                <div
                  key={k.id}
                  title={`Key: ${k.key} ➔ Assigned to ${k.assignedNodeName}`}
                  style={{
                    position: 'absolute',
                    left: `${x - 4}px`,
                    top: `${y - 4}px`,
                    width: '8px',
                    height: '8px',
                    borderRadius: '2px',
                    backgroundColor: k.assignedColor,
                    zIndex: 3
                  }}
                />
              );
            })}

          </div>

          <div style={{ marginTop: '20px', display: 'flex', gap: '15px', fontSize: '10px', color: '#64748b' }}>
            <span>● Large Dots: VNodes on Ring</span>
            <span>■ Small Squares: Data Keys</span>
          </div>
        </main>

        
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          
          <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '14px', padding: '20px' }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '12px', color: '#64748b', textTransform: 'uppercase' }}>Ingest Data Partition Key</h3>
            <form onSubmit={handleAddKey} style={{ display: 'flex', gap: '8px' }}>
              <input type="text" placeholder="Key (e.g. order:9901)" value={inputDataKey} onChange={(e) => setInputDataKey(e.target.value)} style={{ flex: 1, padding: '8px 12px', backgroundColor: '#070a13', border: '1px solid #1e293b', borderRadius: '6px', color: '#38bdf8', fontSize: '12px', boxSizing: 'border-box' }} />
              <button type="submit" style={{ padding: '8px 14px', backgroundColor: '#10b981', color: '#070a13', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>SET</button>
            </form>
          </div>

          
          <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '14px', padding: '20px' }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '12px', color: '#64748b', textTransform: 'uppercase' }}>Clockwise Routing Lookup</h3>
            <form onSubmit={handleTraceLookup} style={{ display: 'flex', gap: '8px' }}>
              <input type="text" placeholder="Lookup Key..." value={searchKey} onChange={(e) => setSearchKey(e.target.value)} style={{ flex: 1, padding: '8px 12px', backgroundColor: '#070a13', border: '1px solid #1e293b', borderRadius: '6px', color: '#fff', fontSize: '12px', boxSizing: 'border-box' }} />
              <button type="submit" style={{ padding: '8px 14px', backgroundColor: '#a855f7', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>GET 🎯</button>
            </form>
          </div>

          
          <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '14px', padding: '20px', flexGrow: 1 }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '12px', color: '#64748b', textTransform: 'uppercase' }}>Data Key Distribution</h3>
            <div style={{ maxHeight: '160px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {mappedKeys.map(k => (
                <div key={k.id} style={{ backgroundColor: '#070a13', border: '1px solid #1e293b', padding: '6px 10px', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px' }}>
                  <span style={{ color: '#cbd5e1' }}>{k.key}</span>
                  <span style={{ color: k.assignedColor, fontWeight: 'bold' }}>{k.assignedNodeName}</span>
                </div>
              ))}
            </div>
          </div>

        </aside>

      </div>

      
      <footer style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '14px', padding: '20px' }}>
        <h3 style={{ margin: '0 0 12px 0', fontSize: '12px', color: '#64748b', textTransform: 'uppercase' }}>Distributed Ring Telemetry Logs</h3>
        <div style={{ backgroundColor: '#070a13', borderRadius: '8px', padding: '12px', height: '110px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {clusterLogs.map((log, idx) => (
            <div key={idx} style={{ fontSize: '11px', color: log.includes('❌') ? '#ef4444' : log.includes('REBALANCE') ? '#eab308' : log.includes('🎯') ? '#a855f7' : '#38bdf8' }}>
              {log}
            </div>
          ))}
        </div>
      </footer>

    </div>
  );
}

export default App;