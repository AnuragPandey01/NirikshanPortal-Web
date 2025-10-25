import { create } from "zustand";
import pb from "@/lib/pb";

const useAuthStore = create((set, get) => ({
  user: null,
  loading: true,
  needsOrgSelection: false,

  // Initialize auth state
  init: async () => {
    set({ loading: true });
    try {
      // Check if user is already authenticated
      if (pb.authStore.isValid) {
        const userProfile = await pb.collection("userProfile").getFirstListItem();
        const hasOrg = userProfile.organisation_id !== "";
        set({
          user: userProfile,
          needsOrgSelection: !hasOrg,
          loading: false,
        });
      } else {
        set({ loading: false });
      }
    } catch (error) {
      console.error("Auth initialization error:", error);
      set({ loading: false });
    }
  },

  // Send OTP to email
  sendOTP: async (name,email) => {
    try {

      //try creating a user
      try{
        const randomPassword = Math.random().toString(36).substring(2, 15);
        await pb.collection("users").create({
          email: email,
          name: name,
          password: randomPassword,
          passwordConfirm: randomPassword,
        });
      }catch(error){
        console.debug("Maybe user already exists, lets send OTP", error);
      }

      //send OTP
      const req = await pb.collection("users").requestOTP(email);

      return { success: true, data: req };
    } catch (error) {
      console.error("Error sending OTP:", error);
      throw error;
    }
  },

  // Verify OTP and login
  loginWithOTP: async (otpId, otp) => {
    set({ loading: true });
    try {
      // Verify OTP and authenticate
      await pb
        .collection("users")
        .authWithOTP(otpId, otp);

      await get().init();

      return { success: true };
    } catch (error) {
      set({ loading: false });
      console.error("Error verifying OTP:", error);
      throw error;
    }
  },

  // Google OAuth login
  loginWithGoogle: async () => {
    set({ loading: true });
    try {
      const authData = await pb.collection("users").authWithOAuth2({
        provider: "google",
        urlCallback: (url) => {
          window.open(url, "_blank", "width=500,height=600");
        },
      });

      const user = authData.record;
      const org = await get().getUserOrganization(user.id);

      set({
        user,
        organization: org,
        needsOrgSelection: !org,
        loading: false,
      });

      return { success: true };
    } catch (error) {
      set({ loading: false });
      console.error("Error with Google login:", error);
      throw error;
    }
  },

  // Join existing organization
  joinOrganization: async (orgId, inviteCode) => {
    set({ loading: true });
    try {
      const { user, init } = get();

      // Add user as member
      await pb.collection("OrganisationMembers").update(inviteCode, {
        organisation: orgId,
        member: user.user_id,
        role: "member",
        status: "active",
      });

      await init();

      return { success: true };
    } catch (error) {
      set({ loading: false });
      console.error("Error joining organization:", error);
      throw error;
    }
  },

  // Create new organization
  createOrganization: async (orgName) => {
    set({ loading: true });
    try {
      const { user,init } = get();

      // Create organization
      const org = await pb.collection("Organisation").create({
        name: orgName,
        created_by: user.user_id,
      });

      // Add user as admin
      await pb.collection("OrganisationMembers").create({
        organisation: org.id,
        member: user.user_id,
        role: "admin",
        status: "active",
      });
      // Update user with role
      await init();
      return { success: true };
    } catch (error) {
      set({ loading: false });
      console.error("Error creating organization:", error);
      throw error;
    }
  },

  logout: async () => {
    set({ loading: true });
    try { 
      pb.authStore.clear();
      localStorage.clear();
      set({
        user: null,
        needsOrgSelection: false,
        loading: false,
      });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },
}));

export default useAuthStore;
