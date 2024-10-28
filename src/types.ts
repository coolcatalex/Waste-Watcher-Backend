export interface functionReturn {
  msg: string,
  code: number
  data?: { [key: string]: any }
}

export type EventSearchType = {
  id: string
  org_id: string
  date: string
  info: string
  uuid: string
  published: boolean
  analysis: string
  attribute_count: string
  orgc_id: string
  timestamp: string
  distribution: string
  sharing_group_id: string
  proposal_email_lock: boolean
  locked: boolean
  threat_level_id: string
  publish_timestamp: string
  sighting_timestamp: string
  disable_correlation: boolean
  extends_uuid: string
  protected: any
  Org: {
    id: string
    name: string
    uuid: string
  }
  Orgc: {
    id: string
    name: string
    uuid: string
  }
  GalaxyCluster: Array<{
    id: string
    uuid: string
    collection_uuid: string
    type: string
    value: string
    tag_name: string
    description: string
    galaxy_id: string
    source: string
    authors: Array<string>
    version: string
    distribution: string
    sharing_group_id: any
    org_id: string
    orgc_id: string
    default: boolean
    locked: boolean
    extends_uuid: string
    extends_version: string
    published: boolean
    deleted: boolean
    Galaxy: {
      id: string
      uuid: string
      name: string
      type: string
      description: string
      version: string
      icon: string
      namespace: string
      enabled: boolean
      local_only: boolean
    }
    meta: {
      "attribution-confidence": Array<string>
      "cfr-suspected-state-sponsor": Array<string>
      "cfr-suspected-victims": Array<string>
      "cfr-target-category": Array<string>
      "cfr-type-of-incident": Array<string>
      country: Array<string>
      refs: Array<string>
      synonyms: Array<string>
    }
    tag_id: string
    local: boolean
  }>
  EventTag: Array<{
    id: string
    event_id: string
    tag_id: string
    local: boolean
    Tag: {
      id: string
      name: string
      colour: string
      is_galaxy: boolean
    }
  }>
}



export interface CorrelationGraphType {
  links: Link[];
  nodes: Node[];
}

interface Link {
  source:       number;
  target:       number;
  linkDistance: number;
}

interface Node {
  unique_id:             string;
  name:                  string;
  type:                  string;
  id:                    string;
  expanded?:             boolean;
  uuid?:                 string;
  image?:                string;
  info?:                 string;
  org?:                  string;
  analysis?:             string;
  distribution?:         string;
  date?:                 string;
  colour?:               string;
  imgClass?:             string;
  taxonomy?:             string;
  description?:          string;
  taxonomy_description?: string;
  galaxy?:               string;
  source?:               string;
  tag_name?:             string;
  authors?:              string;
  synonyms?:             string;
  metacategory?:         string;
  comment?:              string;
  att_category?:         string;
  att_type?:             string;
  att_ids?:              boolean;
}



// -------------------------
export interface FormatedVis {
  edges: {
    source: string;
    target:   string;
  }[];
  nodes: {
    id:    string;
    label: string;
    shape: string;
    font:  {
      color?: string;
    };
    image: string;
  }[];
}




