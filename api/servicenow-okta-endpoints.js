/**
 * ServiceNow Integration Configuration
 * Complete REST API endpoints for Okta IdP sync metadata
 * 
 * This module provides full-featured endpoints optimized for ServiceNow integration
 * including proper response formatting, error handling, and pagination
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
      active: Math.random() > 0.1,
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
  
  for (let i = 0; i < 50; i++) {
    const groupNum = String(i + 1).padStart(3, '0');
    const memberCount = Math.floor(Math.random() * 150) + 50;
    const deptIndex = i % departments.length;
    
    groups.push({
      group_id: `GRP-${String(i).padStart(5, '0')}`,
      group_name: `${departments[deptIndex]} Team - Division ${groupNum}`,
      description: groupDescriptions[i % groupDescriptions.length],
      active: Math.random() > 0.05,
      department: departments[deptIndex],
      cost_center: `CC-${String(1000 + i).padStart(4, '0')}-${["ENG", "OPS", "SEC", "PRD", "DAT", "HR", "INF", "SUP", "QA", "ARC"][deptIndex]}`,
      members: generateMembers(`GRP-${String(i).padStart(5, '0')}`, memberCount)
    });
  }
  
  return groups;
}

// Generate the payload
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

const totalMembers = payload.groups.reduce((sum, group) => sum + group.members.length, 0);

// ============================================================================
// SERVICENOW OPTIMIZED ENDPOINTS
// ============================================================================

/**
 * GET /api/okta/sync
 * @description Main endpoint for full Okta sync payload
 * @param limit {integer} - Records per page (default: 100)
 * @param offset {integer} - Pagination offset (default: 0)
 * @returns {object} - Full sync payload with metadata
 * 
 * ServiceNow Configuration:
 * - Mid Server: Required for secure communication
 * - Authentication: Basic Auth or OAuth2
 * - Timeout: 30 seconds
 * - Response Format: JSON
 */
function getOktaSyncPayload(req, res) {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 100, 500);
    const offset = parseInt(req.query.offset) || 0;
    
    let groups = payload.groups;
    const totalRecords = groups.length;
    
    if (limit) {
      groups = groups.slice(offset, offset + limit);
    }
    
    res.status(200).json({
      status: "success",
      sync_metadata: {
        ...payload.sync_metadata,
        total_groups: payload.groups.length,
        total_members: totalMembers,
        returned_groups: groups.length,
        pagination: {
          offset: offset,
          limit: limit,
          total_records: totalRecords,
          has_more: (offset + limit) < totalRecords
        }
      },
      groups: groups,
      request_timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      error_code: "SYNC_ERROR",
      message: error.message
    });
  }
}

/**
 * GET /api/okta/groups
 * @description Get all groups metadata (lightweight response)
 * @param active {boolean} - Filter by active status
 * @param department {string} - Filter by department
 * @returns {object} - List of groups with member counts
 * 
 * ServiceNow Use Case: Populate group selection dropdowns
 */
function getAllOktaGroups(req, res) {
  try {
    const { active, department } = req.query;
    
    let groups = payload.groups;
    
    if (active !== undefined) {
      const activeFilter = active === 'true';
      groups = groups.filter(g => g.active === activeFilter);
    }
    
    if (department) {
      groups = groups.filter(g => g.department.toLowerCase() === department.toLowerCase());
    }
    
    const groupsMetadata = groups.map(g => ({
      sys_id: g.group_id,
      group_id: g.group_id,
      group_name: g.group_name,
      description: g.description,
      department: g.department,
      cost_center: g.cost_center,
      active: g.active,
      member_count: g.members.length,
      created_at: g.created_at || new Date().toISOString()
    }));
    
    res.status(200).json({
      status: "success",
      result: groupsMetadata,
      count: groupsMetadata.length,
      request_timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      error_code: "GROUPS_FETCH_ERROR",
      message: error.message
    });
  }
}

/**
 * GET /api/okta/groups/:groupId
 * @description Get specific group with all members
 * @param groupId {string} - Group identifier (e.g., GRP-00000)
 * @returns {object} - Group details with member list
 * 
 * ServiceNow Use Case: Populate group membership tables
 */
function getOktaGroupById(req, res) {
  try {
    const { groupId } = req.params;
    const group = payload.groups.find(g => g.group_id === groupId);
    
    if (!group) {
      return res.status(404).json({
        status: "error",
        error_code: "GROUP_NOT_FOUND",
        message: `Group ${groupId} not found`
      });
    }
    
    res.status(200).json({
      status: "success",
      result: {
        sys_id: group.group_id,
        group_id: group.group_id,
        group_name: group.group_name,
        description: group.description,
        active: group.active,
        department: group.department,
        cost_center: group.cost_center,
        member_count: group.members.length,
        members: group.members.map(m => ({
          sys_id: m.user_id,
          user_id: m.user_id,
          first_name: m.first_name,
          last_name: m.last_name,
          email: m.email,
          title: m.title,
          department: m.department,
          active: m.active,
          hire_date: m.hire_date
        }))
      },
      request_timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      error_code: "GROUP_FETCH_ERROR",
      message: error.message
    });
  }
}

/**
 * GET /api/okta/users
 * @description Get all users/members across all groups
 * @param active {boolean} - Filter by active status
 * @param limit {integer} - Records per page (default: 100)
 * @param offset {integer} - Pagination offset
 * @returns {object} - List of all users
 * 
 * ServiceNow Use Case: Sync users to ServiceNow employee records
 */
function getAllOktaUsers(req, res) {
  try {
    const { active } = req.query;
    const limit = Math.min(parseInt(req.query.limit) || 100, 500);
    const offset = parseInt(req.query.offset) || 0;
    
    const users = [];
    const userMap = new Map();
    
    payload.groups.forEach(group => {
      group.members.forEach(member => {
        if (!userMap.has(member.user_id)) {
          let activeFilter = true;
          if (active !== undefined) {
            activeFilter = (active === 'true' ? member.active : !member.active);
          }
          
          if (activeFilter) {
            userMap.set(member.user_id, {
              sys_id: member.user_id,
              user_id: member.user_id,
              first_name: member.first_name,
              last_name: member.last_name,
              email: member.email,
              title: member.title,
              department: member.department,
              active: member.active,
              hire_date: member.hire_date,
              groups: [group.group_id]
            });
          }
        } else if (active === undefined || (active === 'true' ? member.active : !member.active)) {
          const user = userMap.get(member.user_id);
          if (!user.groups.includes(group.group_id)) {
            user.groups.push(group.group_id);
          }
        }
      });
    });
    
    const allUsers = Array.from(userMap.values());
    const totalRecords = allUsers.length;
    const paginatedUsers = allUsers.slice(offset, offset + limit);
    
    res.status(200).json({
      status: "success",
      result: paginatedUsers,
      count: paginatedUsers.length,
      pagination: {
        offset: offset,
        limit: limit,
        total_records: totalRecords,
        has_more: (offset + limit) < totalRecords
      },
      request_timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      error_code: "USERS_FETCH_ERROR",
      message: error.message
    });
  }
}

/**
 * GET /api/okta/users/:userId
 * @description Get specific user details
 * @param userId {string} - User identifier (e.g., EMP00001)
 * @returns {object} - User details with all group memberships
 * 
 * ServiceNow Use Case: Get user profile with group assignments
 */
function getOktaUserById(req, res) {
  try {
    const { userId } = req.params;
    const results = [];
    
    payload.groups.forEach(group => {
      const member = group.members.find(m => m.user_id === userId);
      if (member) {
        results.push({
          sys_id: member.user_id,
          user_id: member.user_id,
          first_name: member.first_name,
          last_name: member.last_name,
          email: member.email,
          title: member.title,
          department: member.department,
          active: member.active,
          hire_date: member.hire_date,
          group_id: group.group_id,
          group_name: group.group_name,
          group_department: group.department
        });
      }
    });
    
    if (results.length === 0) {
      return res.status(404).json({
        status: "error",
        error_code: "USER_NOT_FOUND",
        message: `User ${userId} not found`
      });
    }
    
    res.status(200).json({
      status: "success",
      result: results,
      count: results.length,
      request_timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      error_code: "USER_FETCH_ERROR",
      message: error.message
    });
  }
}

/**
 * GET /api/okta/search
 * @description Search for users by multiple criteria
 * @param query {string} - Search query (name, email, or title)
 * @param type {string} - Search type: 'name', 'email', 'title', 'all' (default: all)
 * @param limit {integer} - Max results (default: 100)
 * @returns {object} - Matching users
 * 
 * ServiceNow Use Case: Real-time user lookup
 */
function searchOktaUsers(req, res) {
  try {
    const { query, type = 'all', limit = 100 } = req.query;
    
    if (!query) {
      return res.status(400).json({
        status: "error",
        error_code: "INVALID_QUERY",
        message: "Search query parameter is required"
      });
    }
    
    const searchQuery = query.toLowerCase();
    const results = [];
    const limit_int = Math.min(parseInt(limit), 500);
    
    for (const group of payload.groups) {
      if (results.length >= limit_int) break;
      
      for (const member of group.members) {
        if (results.length >= limit_int) break;
        
        let matches = false;
        
        if (type === 'all' || type === 'name') {
          const fullName = `${member.first_name} ${member.last_name}`.toLowerCase();
          matches = matches || fullName.includes(searchQuery) || member.first_name.toLowerCase().includes(searchQuery) || member.last_name.toLowerCase().includes(searchQuery);
        }
        if (type === 'all' || type === 'email') {
          matches = matches || member.email.toLowerCase().includes(searchQuery);
        }
        if (type === 'all' || type === 'title') {
          matches = matches || member.title.toLowerCase().includes(searchQuery);
        }
        
        if (matches) {
          results.push({
            sys_id: member.user_id,
            user_id: member.user_id,
            first_name: member.first_name,
            last_name: member.last_name,
            email: member.email,
            title: member.title,
            department: member.department,
            active: member.active,
            group_id: group.group_id,
            group_name: group.group_name
          });
        }
      }
    }
    
    res.status(200).json({
      status: "success",
      query: query,
      search_type: type,
      result: results,
      count: results.length,
      request_timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      error_code: "SEARCH_ERROR",
      message: error.message
    });
  }
}

/**
 * GET /api/okta/stats
 * @description Get statistical information about the Okta sync
 * @returns {object} - Statistics and metrics
 * 
 * ServiceNow Use Case: Dashboards and reporting
 */
function getOktaStats(req, res) {
  try {
    const stats = {
      status: "success",
      sync_metadata: payload.sync_metadata,
      summary: {
        total_groups: payload.groups.length,
        total_members: totalMembers,
        active_members: 0,
        inactive_members: 0
      }
    };
    
    const deptMap = {};
    const titleMap = {};
    
    payload.groups.forEach(group => {
      if (!deptMap[group.department]) {
        deptMap[group.department] = 0;
      }
      deptMap[group.department] += group.members.length;
      
      group.members.forEach(member => {
        if (member.active) {
          stats.summary.active_members++;
        } else {
          stats.summary.inactive_members++;
        }
        
        titleMap[member.title] = (titleMap[member.title] || 0) + 1;
      });
    });
    
    stats.members_by_department = deptMap;
    stats.top_titles = Object.entries(titleMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .reduce((acc, [title, count]) => ({ ...acc, [title]: count }), {});
    
    stats.request_timestamp = new Date().toISOString();
    
    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({
      status: "error",
      error_code: "STATS_ERROR",
      message: error.message
    });
  }
}

/**
 * GET /api/okta/health
 * @description Health check endpoint for ServiceNow connection testing
 * @returns {object} - API health status
 * 
 * ServiceNow Use Case: Connection verification
 */
function getOktaHealth(req, res) {
  res.status(200).json({
    status: "healthy",
    service: "Okta IdP Sync API",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    endpoints_available: [
      "GET /api/okta/sync",
      "GET /api/okta/groups",
      "GET /api/okta/groups/:groupId",
      "GET /api/okta/users",
      "GET /api/okta/users/:userId",
      "GET /api/okta/search",
      "GET /api/okta/stats",
      "GET /api/okta/health"
    ]
  });
}

module.exports = {
  getOktaSyncPayload,
  getAllOktaGroups,
  getOktaGroupById,
  getAllOktaUsers,
  getOktaUserById,
  searchOktaUsers,
  getOktaStats,
  getOktaHealth,
  payload
};