

export interface IAdminService{
    //usermanagement
   fetchAllUsers(page:number,limit:number,search:string):Promise<any>;
   toggleUserBlock(userId: string, blockedStatus: boolean, adminId: string):Promise<any>
   removeUser(userId: string, adminId: string):Promise<any>
 //dashbord
   getDashboardStats():Promise<{
       totalUsers:number;
       pendingApplications:number;
    }>
    //guidemanagement

   fetchPendingGuides():Promise<any[]>;
   approveGuide(guideId: string):Promise<any>;
   fetchAllGuides():Promise<any[]>
   rejectApplication(guideId: string):Promise<any>

}