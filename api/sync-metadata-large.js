/**
 * REST API endpoint for returning Okta IdP sync metadata payload with 5000+ records
 * Returns enterprise group and member information from Okta sync
 * Includes generated data for performance testing and large dataset handling
 */

// Helper function to generate mock member data
function generateMembers(groupId, count) {
  const firstNames = ["Alex", "Blake", "Casey", "Dakota", "Elena", "Finley", "Griffin", "Harper", "Indigo", "Jordan", "Kai", "Logan", "Morgan", "Noah", "Olivia", "Parker", "Quinn", "Riley", "Sage", "Taylor", "Unai", "Victor", "Whitney", "Xavier", "Yara", "Zara"];
  const lastNames = ["Anderson", "Brown", "Chen", "Davis", "Evans", "Foster", "Garcia", "Harrison", "Ibrahim", "Johnson", "Khan", "Lee", "Martinez", "Nelson", "O'Brien", "Patel", "Quinn", "Rodriguez", "Singh", "Thomas", "Usman", "Vega", "Wang", "Xavier", "Yamamoto", "Zhao"];
  const titles = ["Junior Developer", "Senior Developer", "Lead Architect", "DevOps Specialist", "Cloud Architect", "System Administrator", "Security Engineer", "Data Analyst", "Product Manager", "Technical Lead", "QA Engineer", "Solutions Architect", "Infrastructure Engineer", "Database Administrator", "Security Auditor"];
  const departments = ["Engineering", "Operations", "Security", "Product", "Data", "Infrastructure", "Support", "Architecture", "Quality Assurance", "Platform"];
  
  const members = [];
  for (let i = 0; i < count; i++) {
    const empId = `EMP${String((Math.floor(i / 26) * 1000) + (i % 26) * 100).padStart(5, '0')}`;
    const firstName = firstNames[i % firstNames.length];
    const lastName = lastNames[(i + Math.floor(i / firstNames.length)) % lastNames.length];
    const title = titles[i % titles.length];
    const domain = ["globalcorp.com", "enterprise.com", "techcorp.io"][i % 3];
    
    members.push({
      user_id: empId,
      first_name: firstName,
      last_name: lastName,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${domain}`,
      title: title,
      active: Math.random() > 0.1, // 90% active
      department: departments[i % departments.length],
      hire_date: new Date(2020 + Math.floor(i / 500), Math.random() * 12, Math.random() * 28).toISOString().split('T')[0]
    });
  }
  return members;
}

// Helper function to generate groups
function generateGroups() {
  const groupDescriptions = [
    "Platform architecture and core system design",
    "Cloud infrastructure and DevOps operations",
    "Customer support and service management",
    "Security operations and incident response",
    "Human resources and employee management",
    "Data engineering and analytics",
    "Mobile development and cross-platform",
    "Database administration and optimization",
    "Quality assurance and testing",
    "Product management and strategy"
  ];
  
  const departments = ["Engineering", "Operations", "Security", "Product", "Data", "HR", "Infrastructure", "Support", "Quality", "Architecture"];
  
  const groups = [];
  
  // Generate 50 groups with varying member counts
  for (let i = 0; i < 50; i++) {
    const groupNum = String(i + 1).padStart(3, '0');
    const memberCount = Math.floor(Math.random() * 150) + 50; // 50-200 members per group
    const deptIndex = i % departments.length;
    
    groups.push({
      group_id: `GRP-${String(i).padStart(5, '0')}`,
      group_name: `${departments[deptIndex]} Team - Division ${groupNum}`,
      description: groupDescriptions[i % groupDescriptions.length],
      active: Math.random() > 0.05, // 95% active
      department: departments[deptIndex],
      cost_center: `CC-${String(1000 + i).padStart(4, '0')}-${["ENG", "OPS", "SEC", "PRD", "DAT", "HR", "INF", "SUP", "QA", "ARC"][deptIndex]}`,
      members: generateMembers(`GRP-${String(i).padStart(5, '0')}`, memberCount)
    });
  }
  
  return groups;
}

// Generate the payload once
const payload = {
  sync_metadata: {
    source_system: "Enterprise-IdP-Okta",
    sync_timestamp: new Date().toISOString(),
    environment: "Production",
    total_groups_in_payload: 50,
    batch_id: `BATCH-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`
  },
  groups: generateGroups()
};

// Calculate total members
const totalMembers = payload.groups.reduce((sum, group) => sum + group.members.length, 0);

/**
 * GET /api/sync-metadata
 * Returns the Okta sync metadata payload with all groups
 * Query params:
 *   - limit: Max records to return (default: all)
 *   - offset: Pagination offset (default: 0)
 */
function getSyncMetadata(req, res) {
  const limit = req.query.limit ? parseInt(req.query.limit) : undefined;
  const offset = req.query.offset ? parseInt(req.query.offset) : 0;
  
  let groups = payload.groups;
  
  if (limit) {
    groups = groups.slice(offset, offset + limit);
  }
  
  res.status(200).json({
    sync_metadata: {
      ...payload.sync_metadata,
      total_groups: payload.groups.length,
      total_members: totalMembers,
      returned_groups: groups.length
    },
    groups: groups
  });
}

/**
 * GET /api/sync-metadata/groups
 * Returns all groups with metadata
 */
function getAllGroups(req, res) {
  const groupsMetadata = payload.groups.map(g => ({
    group_id: g.group_id,
    group_name: g.group_name,
    description: g.description,
    department: g.department,
    active: g.active,
    member_count: g.members.length
  }));
  
  res.status(200).json({
    total_groups: groupsMetadata.length,
    groups: groupsMetadata
  });
}

/**
 * GET /api/sync-metadata/groups/:groupId
 * Returns a specific group by ID with all members
 * Query params:
 *   - include_members: true/false (default: true)
 */
function getGroupById(req, res) {
  const { groupId } = req.params;
  const includeMembers = req.query.include_members !== 'false';
  
  const group = payload.groups.find(g => g.group_id === groupId);
  
  if (!group) {
    return res.status(404).json({ error: `Group ${groupId} not found` });
  }
  
  const response = {
    group_id: group.group_id,
    group_name: group.group_name,
    description: group.description,
    active: group.active,
    department: group.department,
    cost_center: group.cost_center,
    member_count: group.members.length
  };
  
  if (includeMembers) {
    response.members = group.members;
  }
  
  res.status(200).json(response);
}

/**
 * GET /api/sync-metadata/members/:userId
 * Returns member information across all groups
 */
function getMemberById(req, res) {
  const { userId } = req.params;
  const results = [];
  
  payload.groups.forEach(group => {
    const member = group.members.find(m => m.user_id === userId);
    if (member) {
      results.push({
        group_id: group.group_id,
        group_name: group.group_name,
        department: group.department,
        ...member
      });
    }
  });
  
  if (results.length === 0) {
    return res.status(404).json({ error: `Member ${userId} not found` });
  }
  
  res.status(200).json(results);
}

/**
 * GET /api/sync-metadata/search
 * Search members by name, email, or title
 * Query params:
 *   - q: Search query (required)
 *   - type: 'name' | 'email' | 'title' (default: all)
 *   - limit: Max results (default: 100)
 */
function searchMembers(req, res) {
  const { q, type, limit = 100 } = req.query;
  
  if (!q) {
    return res.status(400).json({ error: "Search query 'q' is required" });
  }
  
  const query = q.toLowerCase();
  const results = [];
  
  for (const group of payload.groups) {
    for (const member of group.members) {
      if (results.length >= parseInt(limit)) break;
      
      let matches = false;
      
      if (!type || type === 'name') {
        matches = matches || `${member.first_name} ${member.last_name}`.toLowerCase().includes(query);
      }
      if (!type || type === 'email') {
        matches = matches || member.email.toLowerCase().includes(query);
      }
      if (!type || type === 'title') {
        matches = matches || member.title.toLowerCase().includes(query);
      }
      
      if (matches) {
        results.push({
          group_id: group.group_id,
          group_name: group.group_name,
          ...member
        });
      }
    }
    if (results.length >= parseInt(limit)) break;
  }
  
  res.status(200).json({
    query: q,
    result_count: results.length,
    results: results
  });
}

/**
 * GET /api/sync-metadata/stats
 * Returns statistics about the payload
 */
function getStats(req, res) {
  const stats = {
    total_groups: payload.groups.length,
    total_members: totalMembers,
    sync_metadata: payload.sync_metadata
  };
  
  // Department breakdown
  const deptMap = {};
  payload.groups.forEach(group => {
    if (!deptMap[group.department]) {
      deptMap[group.department] = 0;
    }
    deptMap[group.department] += group.members.length;
  });
  stats.members_by_department = deptMap;
  
  // Activity breakdown
  let activeMembers = 0;
  payload.groups.forEach(group => {
    activeMembers += group.members.filter(m => m.active).length;
  });
  stats.active_members = activeMembers;
  stats.inactive_members = totalMembers - activeMembers;
  
  // Title breakdown (top 10)
  const titleMap = {};
  payload.groups.forEach(group => {
    group.members.forEach(member => {
      titleMap[member.title] = (titleMap[member.title] || 0) + 1;
    });
  });
  stats.top_titles = Object.entries(titleMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .reduce((acc, [title, count]) => ({ ...acc, [title]: count }), {});
  
  res.status(200).json(stats);
}

module.exports = {
  getSyncMetadata,
  getAllGroups,
  getGroupById,
  getMemberById,
  searchMembers,
  getStats,
  payload // Export payload for testing
};