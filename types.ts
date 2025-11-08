// Fix: The d3 type import is no longer needed as the interfaces are now explicitly defined.
// import type { SimulationNodeDatum, SimulationLinkDatum } from 'd3';

export type LearningLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export interface Resource {
  title: string;
  url: string;
  type: 'video' | 'website';
}

// Fix: Redefined MapNode to be structurally compatible with d3.SimulationNodeDatum.
// This resolves errors where properties like 'x' and 'y' were not found,
// likely due to issues with 'extends SimulationNodeDatum' in the build environment.
export interface MapNode {
  id: string;
  label: string;
  description: string;
  resources: Resource[];
  level: LearningLevel;
  isRoot: boolean;
  // Properties added by d3-force simulation
  index?: number;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number | null;
  fy?: number | null;
}

// Fix: Redefined MapLink to be structurally compatible with d3.SimulationLinkDatum.
// This resolves errors where 'source' and 'target' properties were not found.
export interface MapLink {
  source: string | MapNode;
  target: string | MapNode;
  index?: number;
}

export interface MapData {
  nodes: MapNode[];
  links: MapLink[];
}
