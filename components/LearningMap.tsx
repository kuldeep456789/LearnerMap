import React, { useRef, useEffect, useState, useMemo, forwardRef, useImperativeHandle } from 'react';
import * as d3 from 'd3';
import { MapData, MapNode, MapLink } from '../types';
import NodeTooltip from './NodeTooltip';

interface LearningMapProps {
  data: MapData | null;
  onNodeSelect: (node: MapNode | null) => void;
  selectedNodeId: string | null;
}

export interface LearningMapRef {
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
}

const LearningMap = forwardRef<LearningMapRef, LearningMapProps>(({ data, onNodeSelect, selectedNodeId }, ref) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<{ node: MapNode; x: number; y: number } | null>(null);
  const simulationRef = useRef<d3.Simulation<MapNode, MapLink> | null>(null);
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const [collapsedNodes, setCollapsedNodes] = useState(new Set<string>());

  useImperativeHandle(ref, () => ({
    zoomIn: () => {
      if (svgRef.current && zoomRef.current) {
        d3.select(svgRef.current).transition().duration(250).call(zoomRef.current.scaleBy, 1.2);
      }
    },
    zoomOut: () => {
      if (svgRef.current && zoomRef.current) {
        d3.select(svgRef.current).transition().duration(250).call(zoomRef.current.scaleBy, 0.8);
      }
    },
    resetZoom: () => {
      if (svgRef.current && zoomRef.current) {
        d3.select(svgRef.current).transition().duration(250).call(zoomRef.current.transform, d3.zoomIdentity);
      }
    }
  }));

  // Reset collapsed state when new data arrives
  useEffect(() => {
    setCollapsedNodes(new Set());
  }, [data]);

  const displayData = useMemo(() => {
    if (!data) return null;

    const hasChildrenMap = new Map<string, boolean>();
    const childrenMap = new Map<string, string[]>();
    data.nodes.forEach(n => {
        hasChildrenMap.set(n.id, false);
        childrenMap.set(n.id, []);
    });

    data.links.forEach(link => {
      const sourceId = typeof link.source === 'string' ? link.source : (link.source as MapNode).id;
      const targetId = typeof link.target === 'string' ? link.target : (link.target as MapNode).id;
      
      if (childrenMap.has(sourceId)) {
        childrenMap.get(sourceId)!.push(targetId);
      }
      hasChildrenMap.set(sourceId, true);
    });

    const hiddenNodeIds = new Set<string>();
    const getDescendants = (nodeId: string) => {
      const descendants = new Set<string>();
      const queue = [...(childrenMap.get(nodeId) || [])];
      while (queue.length > 0) {
        const currentId = queue.shift()!;
        if (!descendants.has(currentId)) {
          descendants.add(currentId);
          const kids = childrenMap.get(currentId) || [];
          queue.push(...kids);
        }
      }
      return descendants;
    };

    collapsedNodes.forEach(nodeId => {
      getDescendants(nodeId).forEach(id => hiddenNodeIds.add(id));
    });

    const visibleNodes = data.nodes.filter(node => !hiddenNodeIds.has(node.id));
    const visibleNodeIds = new Set(visibleNodes.map(n => n.id));

    const visibleLinks = data.links.filter(link => {
      const sourceId = typeof link.source === 'string' ? link.source : (link.source as MapNode).id;
      const targetId = typeof link.target === 'string' ? link.target : (link.target as MapNode).id;
      return visibleNodeIds.has(sourceId) && visibleNodeIds.has(targetId);
    });

    return { nodes: visibleNodes, links: visibleLinks, hasChildrenMap };
  }, [data, collapsedNodes]);


  useEffect(() => {
    if (!displayData || !svgRef.current || !containerRef.current) {
        if(svgRef.current) d3.select(svgRef.current).selectAll("*").remove();
        return;
    };

    const { nodes, links, hasChildrenMap } = displayData;
    const { width, height } = containerRef.current.getBoundingClientRect();

    // Adjacency map for hover highlighting
    const adjacency = new Map<string, Set<string>>();
    nodes.forEach(n => adjacency.set(n.id, new Set()));
    links.forEach(l => {
        const sourceId = typeof l.source === 'string' ? l.source : (l.source as MapNode).id;
        const targetId = typeof l.target === 'string' ? l.target : (l.target as MapNode).id;
        adjacency.get(sourceId)?.add(targetId);
        adjacency.get(targetId)?.add(sourceId);
    });

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [-width / 2, -height / 2, width, height]);

    svg.selectAll("*").remove(); // Clear previous render
    
    const g = svg.append("g");

    if (simulationRef.current) {
        simulationRef.current.stop();
    }
    
    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink<MapNode, MapLink>(links).id(d => d.id).distance(d => (d.source as MapNode).isRoot || (d.target as MapNode).isRoot ? 120 : 60))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(0, 0))
      .force("x", d3.forceX().strength(0.05))
      .force("y", d3.forceY().strength(0.05));

    simulationRef.current = simulation;

    const link = g.append('g')
      .attr('stroke', '#475569') // slate-600
      .attr('stroke-opacity', 0.6)
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke-width', 1.5);

    const node = g.append('g')
      .selectAll('g')
      .data(nodes)
      .join('g')
      .attr('cursor', 'pointer');
      
    node.append('circle')
      .attr('r', d => d.isRoot ? 12 : 7)
      .attr('fill', d => {
        if (collapsedNodes.has(d.id)) return '#ec4899'; // pink-500 for collapsed
        if (d.isRoot) return '#6366f1'; // indigo-500 for root
        if (hasChildrenMap.get(d.id)) return '#8b5cf6'; // violet-500 for parents
        return '#d946ef'; // fuchsia-500 for leaves
      })
      .attr('stroke', d => {
        if (d.id === selectedNodeId) return '#34d399'; // emerald-400 for selected
        if (collapsedNodes.has(d.id)) return '#f9a8d4'; // pink-300
        return '#1e293b';
      })
      .attr('stroke-width', d => (d.id === selectedNodeId || collapsedNodes.has(d.id)) ? 2.5 : 2);

    node.append('text')
      .text(d => d.label)
      .attr('x', d => d.isRoot ? 16 : 10)
      .attr('y', 4)
      .attr('fill', '#cbd5e1') // slate-300
      .style('font-size', d => d.isRoot ? '14px' : '12px')
      .style('pointer-events', 'none');

    node.on('click', (event, d) => {
      onNodeSelect(d.id === selectedNodeId ? null : d);
    });

    node.on('dblclick', (event, d) => {
      if (hasChildrenMap.get(d.id)) {
        event.preventDefault(); // Prevent zoom on double click
        setCollapsedNodes(prev => {
          const newSet = new Set(prev);
          if (newSet.has(d.id)) {
            newSet.delete(d.id);
          } else {
            newSet.add(d.id);
          }
          return newSet;
        });
      }
    });

    node.on('mouseover', (event, d) => {
        setTooltip({ node: d, x: event.clientX, y: event.clientY });
        if (d.id !== selectedNodeId) {
            d3.select(event.currentTarget).select('circle').transition().duration(200).attr('r', r => ((r as number) === 12 || (r as number) === 16) ? 16 : 10);
        }
      
        const neighbors = adjacency.get(d.id) || new Set();

        node
            .transition().duration(200)
            .style('opacity', n => (neighbors.has(n.id) || n.id === d.id) ? 1 : 0.2);
        
        link
            .transition().duration(200)
            .style('stroke', l => ((l.source as MapNode).id === d.id || (l.target as MapNode).id === d.id) ? '#a78bfa' : '#475569')
            .style('stroke-opacity', l => ((l.source as MapNode).id === d.id || (l.target as MapNode).id === d.id) ? 0.9 : 0.1);

      })
      .on('mousemove', (event) => {
        setTooltip(prev => prev ? { ...prev, x: event.clientX, y: event.clientY } : null);
      })
      .on('mouseout', (event, d) => {
        setTooltip(null);
        if (d.id !== selectedNodeId) {
            d3.select(event.currentTarget).select('circle').transition().duration(200).attr('r', (d as MapNode).isRoot ? 12 : 7);
        }

        node
            .transition().duration(200)
            .style('opacity', 1);

        link
            .transition().duration(200)
            .style('stroke', '#475569')
            .style('stroke-opacity', 0.6);
      });

    const drag = d3.drag<SVGGElement, MapNode>()
      .on('start', (event, d) => {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      })
      .on('drag', (event, d) => {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on('end', (event, d) => {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      });

    node.call(drag);

    simulation.on('tick', () => {
      link
        .attr('x1', d => (d.source as MapNode).x!)
        .attr('y1', d => (d.source as MapNode).y!)
        .attr('x2', d => (d.target as MapNode).x!)
        .attr('y2', d => (d.target as MapNode).y!);

      node.attr('transform', d => `translate(${d.x},${d.y})`);
    });

    const zoom = d3.zoom<SVGSVGElement, unknown>().on('zoom', (event) => {
      g.attr('transform', event.transform);
    });
    
    zoomRef.current = zoom;
    svg.call(zoom);
  
    const resizeObserver = new ResizeObserver(entries => {
        for (let entry of entries) {
            const { width, height } = entry.contentRect;
            d3.select(svgRef.current)
                .attr('width', width)
                .attr('height', height)
                .attr('viewBox', [-width / 2, -height / 2, width, height]);
            simulation.force('center', d3.forceCenter(0,0));
            simulation.alpha(0.3).restart();
        }
    });
    
    if (containerRef.current) {
        resizeObserver.observe(containerRef.current);
    }
    
    return () => {
      simulation.stop();
      resizeObserver.disconnect();
    };
  }, [displayData, selectedNodeId, onNodeSelect]);

  return (
    <div ref={containerRef} className="w-full h-full relative overflow-hidden bg-transparent rounded-lg">
      <svg ref={svgRef}></svg>
      {tooltip && <NodeTooltip node={tooltip.node} position={{ x: tooltip.x, y: tooltip.y }} />}
    </div>
  );
});

export default LearningMap;
