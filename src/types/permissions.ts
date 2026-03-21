import type { UserRole } from "./auth";

/**
 * Permission definitions for each role in the camp management system
 * 
 * Permission Hierarchy:
 * - CampBoss: Full access to everything
 * - Manager: Manage data, users (except CampBoss), and system settings
 * - Accountant: Manage billing, invoices, meter readings, and penalties
 * - Inspector: Perform hygiene inspections and view inspection history
 * - Security: Manage visitors, view access logs
 * - Staff: View data and register workers
 */

export interface Permission {
  // Dashboard & Overview
  viewDashboard: boolean;
  
  // Camp Management
  viewCamps: boolean;
  manageCamps: boolean;
  
  // Worker Registration
  viewWorkers: boolean;
  registerWorkers: boolean;
  editWorkers: boolean;
  deleteWorkers: boolean;
  
  // Room Management
  viewRooms: boolean;
  manageRooms: boolean;
  
  // Visitor Management
  viewVisitors: boolean;
  registerVisitors: boolean;
  
  // Hygiene Inspection
  viewHygieneReports: boolean;
  performInspection: boolean;
  viewInspectionHistory: boolean;
  
  // Billing & Finance
  viewBilling: boolean;
  manageBilling: boolean;
  viewInvoices: boolean;
  createInvoices: boolean;
  editInvoices: boolean;
  viewMeterReadings: boolean;
  manageMeterReadings: boolean;
  
  // User Management
  viewUsers: boolean;
  approveUsers: boolean;
  manageUserRoles: boolean;
  deleteUsers: boolean;
  
  // Activity Logs
  viewActivityLogs: boolean;
  
  // Manual & Help
  viewManual: boolean;
}

export const ROLE_PERMISSIONS: Record<UserRole, Permission> = {
  MasterAdmin: {
    viewDashboard: true,
    viewCamps: true,
    manageCamps: true,
    viewWorkers: true,
    registerWorkers: true,
    editWorkers: true,
    deleteWorkers: true,
    viewRooms: true,
    manageRooms: true,
    viewVisitors: true,
    registerVisitors: true,
    viewHygieneReports: true,
    performInspection: true,
    viewInspectionHistory: true,
    viewBilling: true,
    manageBilling: true,
    viewInvoices: true,
    createInvoices: true,
    editInvoices: true,
    viewMeterReadings: true,
    manageMeterReadings: true,
    viewUsers: true,
    approveUsers: true,
    manageUserRoles: true,
    deleteUsers: true,
    viewActivityLogs: true,
    viewManual: true,
  },
  
  MD: {
    viewDashboard: true,
    viewCamps: true,
    manageCamps: true,
    viewWorkers: true,
    registerWorkers: true,
    editWorkers: true,
    deleteWorkers: true,
    viewRooms: true,
    manageRooms: true,
    viewVisitors: true,
    registerVisitors: true,
    viewHygieneReports: true,
    performInspection: true,
    viewInspectionHistory: true,
    viewBilling: true,
    manageBilling: true,
    viewInvoices: true,
    createInvoices: true,
    editInvoices: true,
    viewMeterReadings: true,
    manageMeterReadings: true,
    viewUsers: true,
    approveUsers: true,
    manageUserRoles: true,
    deleteUsers: true,
    viewActivityLogs: true,
    viewManual: true,
  },
  
  GM: {
    viewDashboard: true,
    viewCamps: true,
    manageCamps: true,
    viewWorkers: true,
    registerWorkers: true,
    editWorkers: true,
    deleteWorkers: true,
    viewRooms: true,
    manageRooms: true,
    viewVisitors: true,
    registerVisitors: true,
    viewHygieneReports: true,
    performInspection: true,
    viewInspectionHistory: true,
    viewBilling: true,
    manageBilling: true,
    viewInvoices: true,
    createInvoices: true,
    editInvoices: true,
    viewMeterReadings: true,
    manageMeterReadings: true,
    viewUsers: true,
    approveUsers: true,
    manageUserRoles: true,
    deleteUsers: false, // Cannot delete users
    viewActivityLogs: true,
    viewManual: true,
  },
  
  HrManager: {
    viewDashboard: true,
    viewCamps: true,
    manageCamps: false,
    viewWorkers: true,
    registerWorkers: true,
    editWorkers: true,
    deleteWorkers: true, // HR can manage worker records
    viewRooms: true,
    manageRooms: false,
    viewVisitors: true,
    registerVisitors: true,
    viewHygieneReports: true,
    performInspection: false,
    viewInspectionHistory: true,
    viewBilling: false,
    manageBilling: false,
    viewInvoices: false,
    createInvoices: false,
    editInvoices: false,
    viewMeterReadings: false,
    manageMeterReadings: false,
    viewUsers: true,
    approveUsers: true,
    manageUserRoles: true, // HR can manage user roles
    deleteUsers: false,
    viewActivityLogs: true,
    viewManual: true,
  },
  
  CampBoss: {
    viewDashboard: true,
    viewCamps: true,
    manageCamps: true,
    viewWorkers: true,
    registerWorkers: true,
    editWorkers: true,
    deleteWorkers: true,
    viewRooms: true,
    manageRooms: true,
    viewVisitors: true,
    registerVisitors: true,
    viewHygieneReports: true,
    performInspection: true,
    viewInspectionHistory: true,
    viewBilling: true,
    manageBilling: true,
    viewInvoices: true,
    createInvoices: true,
    editInvoices: true,
    viewMeterReadings: true,
    manageMeterReadings: true,
    viewUsers: true,
    approveUsers: true,
    manageUserRoles: true,
    deleteUsers: true,
    viewActivityLogs: true,
    viewManual: true,
  },
  
  Manager: {
    viewDashboard: true,
    viewCamps: true,
    manageCamps: true,
    viewWorkers: true,
    registerWorkers: true,
    editWorkers: true,
    deleteWorkers: true,
    viewRooms: true,
    manageRooms: true,
    viewVisitors: true,
    registerVisitors: true,
    viewHygieneReports: true,
    performInspection: true,
    viewInspectionHistory: true,
    viewBilling: true,
    manageBilling: false, // Can view but not edit billing
    viewInvoices: true,
    createInvoices: false,
    editInvoices: false,
    viewMeterReadings: true,
    manageMeterReadings: false,
    viewUsers: true,
    approveUsers: true,
    manageUserRoles: false, // Cannot change roles
    deleteUsers: false,
    viewActivityLogs: true,
    viewManual: true,
  },
  
  Accountant: {
    viewDashboard: true,
    viewCamps: true,
    manageCamps: false,
    viewWorkers: true,
    registerWorkers: false,
    editWorkers: false,
    deleteWorkers: false,
    viewRooms: true,
    manageRooms: false,
    viewVisitors: true,
    registerVisitors: false,
    viewHygieneReports: true,
    performInspection: false,
    viewInspectionHistory: true,
    viewBilling: true,
    manageBilling: true,
    viewInvoices: true,
    createInvoices: true,
    editInvoices: true,
    viewMeterReadings: true,
    manageMeterReadings: true,
    viewUsers: false,
    approveUsers: false,
    manageUserRoles: false,
    deleteUsers: false,
    viewActivityLogs: false,
    viewManual: true,
  },
  
  Inspector: {
    viewDashboard: true,
    viewCamps: true,
    manageCamps: false,
    viewWorkers: true,
    registerWorkers: false,
    editWorkers: false,
    deleteWorkers: false,
    viewRooms: true,
    manageRooms: false,
    viewVisitors: true,
    registerVisitors: false,
    viewHygieneReports: true,
    performInspection: true,
    viewInspectionHistory: true,
    viewBilling: false,
    manageBilling: false,
    viewInvoices: false,
    createInvoices: false,
    editInvoices: false,
    viewMeterReadings: false,
    manageMeterReadings: false,
    viewUsers: false,
    approveUsers: false,
    manageUserRoles: false,
    deleteUsers: false,
    viewActivityLogs: false,
    viewManual: true,
  },
  
  Security: {
    viewDashboard: true,
    viewCamps: true,
    manageCamps: false,
    viewWorkers: true,
    registerWorkers: false,
    editWorkers: false,
    deleteWorkers: false,
    viewRooms: true,
    manageRooms: false,
    viewVisitors: true,
    registerVisitors: true,
    viewHygieneReports: false,
    performInspection: false,
    viewInspectionHistory: false,
    viewBilling: false,
    manageBilling: false,
    viewInvoices: false,
    createInvoices: false,
    editInvoices: false,
    viewMeterReadings: false,
    manageMeterReadings: false,
    viewUsers: false,
    approveUsers: false,
    manageUserRoles: false,
    deleteUsers: false,
    viewActivityLogs: false,
    viewManual: true,
  },
  
  Staff: {
    viewDashboard: true,
    viewCamps: true,
    manageCamps: false,
    viewWorkers: true,
    registerWorkers: true,
    editWorkers: false,
    deleteWorkers: false,
    viewRooms: true,
    manageRooms: false,
    viewVisitors: true,
    registerVisitors: false,
    viewHygieneReports: true,
    performInspection: false,
    viewInspectionHistory: true,
    viewBilling: false,
    manageBilling: false,
    viewInvoices: false,
    createInvoices: false,
    editInvoices: false,
    viewMeterReadings: false,
    manageMeterReadings: false,
    viewUsers: false,
    approveUsers: false,
    manageUserRoles: false,
    deleteUsers: false,
    viewActivityLogs: false,
    viewManual: true,
  },
};

/**
 * Check if a user has a specific permission
 */
export function hasPermission(userRoles: UserRole[], permission: keyof Permission): boolean {
  // Check if any of the user's roles grants this permission
  return userRoles.some(role => ROLE_PERMISSIONS[role]?.[permission] === true);
}

/**
 * Check if a user has any of the specified roles
 */
export function hasAnyRole(userRoles: UserRole[], requiredRoles: UserRole[]): boolean {
  return requiredRoles.some(role => userRoles.includes(role));
}

/**
 * Get all permissions for a user based on their roles
 */
export function getUserPermissions(userRoles: UserRole[]): Permission {
  const permissions: Permission = {
    viewDashboard: false,
    viewCamps: false,
    manageCamps: false,
    viewWorkers: false,
    registerWorkers: false,
    editWorkers: false,
    deleteWorkers: false,
    viewRooms: false,
    manageRooms: false,
    viewVisitors: false,
    registerVisitors: false,
    viewHygieneReports: false,
    performInspection: false,
    viewInspectionHistory: false,
    viewBilling: false,
    manageBilling: false,
    viewInvoices: false,
    createInvoices: false,
    editInvoices: false,
    viewMeterReadings: false,
    manageMeterReadings: false,
    viewUsers: false,
    approveUsers: false,
    manageUserRoles: false,
    deleteUsers: false,
    viewActivityLogs: false,
    viewManual: false,
  };

  // Merge permissions from all roles (OR operation)
  userRoles.forEach(role => {
    const rolePerms = ROLE_PERMISSIONS[role];
    if (rolePerms) {
      Object.keys(rolePerms).forEach(key => {
        const permKey = key as keyof Permission;
        if (rolePerms[permKey]) {
          permissions[permKey] = true;
        }
      });
    }
  });

  return permissions;
}
