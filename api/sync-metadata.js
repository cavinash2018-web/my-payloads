/**
 * REST API endpoint for returning Okta IdP sync metadata payload
 * Returns enterprise group and member information from Okta sync
 */

const payload = {
  sync_metadata: {
    source_system: "Enterprise-IdP-Okta",
    sync_timestamp: "2026-06-08T21:50:00Z",
    environment: "Production",
    total_groups_in_payload: 5,
    batch_id: "BATCH-2026-991A"
  },
  groups: [
    {
      group_id: "GRP-ITSM-01",
      group_name: "ITSM Platform Architecture",
      description: "Senior architects managing platform integrations, modules, and core configurations.",
      active: true,
      department: "IT Service Management",
      cost_center: "CC-9901-IT",
      members: [
        { user_id: "EMP801", first_name: "Elena", last_name: "Rostova", email: "erostova@globalcorp.com", title: "Lead Architect", active: true },
        { user_id: "EMP802", first_name: "Marcus", last_name: "Vance", email: "mvance@globalcorp.com", title: "Senior Technical Consultant", active: true },
        { user_id: "EMP803", first_name: "Priya", last_name: "Nair", email: "pnair@globalcorp.com", title: "ServiceNow Platform Owner", active: true },
        { user_id: "EMP804", first_name: "David", last_name: "Kim", email: "dkim@globalcorp.com", title: "Integration Engineer", active: true },
        { user_id: "EMP805", first_name: "Chloe", last_name: "Dupont", email: "cdupont@globalcorp.com", title: "System Administrator", active: true },
        { user_id: "EMP806", first_name: "Aisling", last_name: "O'Connor", email: "aoconnor@globalcorp.com", title: "Junior Developer", active: true }
      ]
    },
    {
      group_id: "GRP-CLD-SRE",
      group_name: "Cloud Infrastructure & SRE",
      description: "Site Reliability Engineers managing AWS/Azure multi-region clusters and Kubernetes deployments.",
      active: true,
      department: "Cloud Engineering",
      cost_center: "CC-4412-OPS",
      members: [
        { user_id: "EMP201", first_name: "Alex", last_name: "Honold", email: "ahonold@globalcorp.com", title: "Principal SRE", active: true },
        { user_id: "EMP202", first_name: "Beatriz", last_name: "Silva", email: "bsilva@globalcorp.com", title: "Cloud Architect", active: true },
        { user_id: "EMP203", first_name: "Chen", last_name: "Wei", email: "cwei@globalcorp.com", title: "DevOps Specialist", active: true },
        { user_id: "EMP204", first_name: "Devon", last_name: "Brooks", email: "dbrooks@globalcorp.com", title: "Infrastructure Engineer", active: true },
        { user_id: "EMP205", first_name: "Emma", last_name: "Watson", email: "ewatson@globalcorp.com", title: "SRE II", active: true },
        { user_id: "EMP206", first_name: "Fahad", last_name: "Al-Mansoor", email: "falmansoor@globalcorp.com", title: "Security DevOps Architect", active: true }
      ]
    },
    {
      group_id: "GRP-CSM-SUP",
      group_name: "Tier 3 Customer Support",
      description: "Escalation point for Customer Service Management handling high-value enterprise accounts.",
      active: true,
      department: "Customer Success",
      cost_center: "CC-1102-CSM",
      members: [
        { user_id: "EMP301", first_name: "Giovanni", last_name: "Rossi", email: "grossi@globalcorp.com", title: "Support Director", active: true },
        { user_id: "EMP302", first_name: "Hana", last_name: "Tanaka", email: "htanaka@globalcorp.com", title: "Tier 3 Lead", active: true },
        { user_id: "EMP303", first_name: "Ian", last_name: "Macdonald", email: "imacdonald@globalcorp.com", title: "Technical Account Manager", active: true },
        { user_id: "EMP304", first_name: "Julia", last_name: "Roberts", email: "jroberts@globalcorp.com", title: "CSM Engineer", active: true },
        { user_id: "EMP305", first_name: "Kevin", last_name: "Mitnick", email: "kmitnick@globalcorp.com", title: "SecOps Support Specialist", active: true },
        { user_id: "EMP306", first_name: "Lucia", last_name: "Fernandez", email: "lfernandez@globalcorp.com", title: "Enterprise Support Engineer", active: true }
      ]
    },
    {
      group_id: "GRP-SEC-OPS",
      group_name: "Global Security Operations (SOC)",
      description: "Cybersecurity Incident Response Team monitoring real-time network threats and data vulnerabilities.",
      active: true,
      department: "Information Security",
      cost_center: "CC-7755-SEC",
      members: [
        { user_id: "EMP401", first_name: "Malik", last_name: "Jabal", email: "mjabal@globalcorp.com", title: "SOC Manager", active: true },
        { user_id: "EMP402", first_name: "Nina", last_name: "Sato", email: "nsato@globalcorp.com", title: "Threat Hunter", active: true },
        { user_id: "EMP403", first_name: "Omar", last_name: "Farooq", email: "ofarooq@globalcorp.com", title: "Incident Responder", active: true },
        { user_id: "EMP404", first_name: "Paige", last_name: "Matthews", email: "pmatthews@globalcorp.com", title: "SecOps Engineer", active: true },
        { user_id: "EMP405", first_name: "Quincy", last_name: "Jones", email: "qjones@globalcorp.com", title: "Compliance Auditor", active: true },
        { user_id: "EMP406", first_name: "Rachel", last_name: "Green", email: "rgreen@globalcorp.com", title: "Access Management Specialist", active: true }
      ]
    },
    {
      group_id: "GRP-HRSD-ADMIN",
      group_name: "HR Systems Administrators",
      description: "HRSD configurations, employee relations workflows, lifecycle events administration.",
      active: true,
      department: "Human Resources",
      cost_center: "CC-2233-HR",
      members: [
        { user_id: "EMP501", first_name: "Siddharth", last_name: "Sharma", email: "ssharma@globalcorp.com", title: "HR Systems Director", active: true },
        { user_id: "EMP502", first_name: "Taylor", last_name: "Swift", email: "tswift@globalcorp.com", title: "Lifecycle Operations Specialist", active: true },
        { user_id: "EMP503", first_name: "Umar", last_name: "Khalid", email: "ukhalid@globalcorp.com", title: "HRSD Config Lead", active: true },
        { user_id: "EMP504", first_name: "Victoria", last_name: "Beckham", email: "vbeckham@globalcorp.com", title: "Employee Relations Admin", active: true },
        { user_id: "EMP505", first_name: "William", last_name: "Wright", email: "wwright@globalcorp.com", title: "HR Analytics Specialist", active: true },
        { user_id: "EMP506", first_name: "Xavier", last_name: "Woods", email: "xwoods@globalcorp.com", title: "Compensation & Benefits Admin", active: true }
      ]
    }
  ]
};

/**
 * GET /api/sync-metadata
 * Returns the Okta sync metadata payload
 */
function getSyncMetadata(req, res) {
  res.status(200).json(payload);
}

/**
 * GET /api/sync-metadata/groups/:groupId
 * Returns a specific group by ID
 */
function getGroupById(req, res) {
  const { groupId } = req.params;
  const group = payload.groups.find(g => g.group_id === groupId);
  
  if (!group) {
    return res.status(404).json({ error: `Group ${groupId} not found` });
  }
  
  res.status(200).json(group);
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
        ...member
      });
    }
  });
  
  if (results.length === 0) {
    return res.status(404).json({ error: `Member ${userId} not found` });
  }
  
  res.status(200).json(results);
}

module.exports = {
  getSyncMetadata,
  getGroupById,
  getMemberById
};