/**
 * Netlify Serverless Function for Okta Endpoints
 * Converts api/servicenow-okta-endpoints.js to serverless functions
 */

// Helper function to generate mock member data
function generateMembers(groupId, count) {
  const firstNames = ["Alex", "Blake", "Casey", "Dakota", "Elena", "Finley", "Griffin", "Harper", "Indigo", "Jordan", "Kai", "Logan", "Morgan", "Noah", "Olivia", "Parker", "Quinn", "Riley", "Sage", "Taylor"];
  const lastNames = ["Anderson", "Brown", "Chen", "Davis", "Evans", "Foster", "Garcia", "Harrison", "Ibrahim", "Johnson", "Khan", "Lee", "Martinez", "Nelson", "O'Brien", "Patel", "Quinn", "Rodriguez"];
  const titles = ["Junior Developer", "Senior Developer", "Lead Architect", "DevOps Specialist", "Cloud Architect", "System Administrator", "Security Engineer", "Data Analyst", "Product Manager", "Technical Lead"];
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

const totalMembers = payload.groups.reduce((sum, group) => sum + group.members.length, 0);

// Netlify Function Handler
exports.handler = async (event, context) => {
  const path = event.path;
  const method = event.httpMethod;
  const queryParams = event.queryStringParameters || {};
  const pathParams = event.pathParameters || {};

  try {
    // Route: GET /api/okta/complete-payload
    if (path === '/.netlify/functions/okta-endpoints' && method === 'GET' && queryParams.action === 'complete-payload') {
      const formattedGroups = payload.groups.map(group => ({
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
      }));

      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: "success",
          sync_metadata: {
            ...payload.sync_metadata,
            total_groups: payload.groups.length,
            total_members: totalMembers,
            export_type: "complete_payload"
          },
          groups: formattedGroups,
          request_timestamp: new Date().toISOString()
        })
      };
    }

    // Route: GET /api/okta/sync
    if (path === '/.netlify/functions/okta-endpoints' && method === 'GET' && queryParams.action === 'sync') {
      const limit = Math.min(parseInt(queryParams.limit) || 100, 500);
      const offset = parseInt(queryParams.offset) || 0;
      
      let groups = payload.groups;
      const totalRecords = groups.length;
      
      if (limit) {
        groups = groups.slice(offset, offset + limit);
      }
      
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
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
        })
      };
    }

    // Route: GET /api/okta/health
    if (method === 'GET' && queryParams.action === 'health') {
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: "healthy",
          service: "Okta IdP Sync API",
          version: "1.0.0",
          timestamp: new Date().toISOString(),
          endpoints_available: [
            "GET /.netlify/functions/okta-endpoints?action=sync",
            "GET /.netlify/functions/okta-endpoints?action=complete-payload",
            "GET /.netlify/functions/okta-endpoints?action=groups",
            "GET /.netlify/functions/okta-endpoints?action=health"
          ]
        })
      };
    }

    // Route: GET /api/okta/groups
    if (path === '/.netlify/functions/okta-endpoints' && method === 'GET' && queryParams.action === 'groups') {
      const { active, department } = queryParams;
      
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
      
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: "success",
          result: groupsMetadata,
          count: groupsMetadata.length,
          request_timestamp: new Date().toISOString()
        })
      };
    }

    // Default response
    return {
      statusCode: 400,
      body: JSON.stringify({
        status: "error",
        message: "Invalid endpoint. Use ?action=sync, ?action=complete-payload, ?action=groups, or ?action=health"
      })
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        status: "error",
        error_code: "SERVER_ERROR",
        message: error.message
      })
    };
  }
};
