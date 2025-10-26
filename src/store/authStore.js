import { create } from "zustand";
import pb from "@/lib/pb";

const useAuthStore = create((set, get) => ({
  user: null,
  organization: null,
  loading: true,
  needsOrgSelection: false,

  // Initialize auth state
  init: async () => {
    set({ loading: true });
    try {
      // Check if user is already authenticated
      if (pb.authStore.isValid) {
        const userProfile = await pb
          .collection("userProfile")
          .getFirstListItem();
        const hasOrg = userProfile.organisation_id !== "";

        let organization = null;
        if (hasOrg) {
          try {
            // Fetch organization details
            organization = await pb
              .collection("Organisation")
              .getOne(userProfile.organisation_id);

            // Fetch member count
            const members = await pb
              .collection("OrganisationMembers")
              .getList(1, 1);
            organization.memberCount = members.totalItems;
            console.log("organization",organization);
          } catch (error) {
            console.error("Error fetching organization:", error);
          }
        }

        set({
          user: userProfile,
          organization,
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
  sendOTP: async (name, email) => {
    try {
      //try creating a user
      try {
        const randomPassword = Math.random().toString(36).substring(2, 15);
        await pb.collection("users").create({
          email: email,
          name: name,
          password: randomPassword,
          passwordConfirm: randomPassword,
        });
      } catch (error) {
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
      await pb.collection("users").authWithOTP(otpId, otp);

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
      await pb.collection("users").authWithOAuth2({ provider: "google" });

      await get().init();

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
      const { user, init } = get();

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

  updateOrgName: async (name) => {
    const { user, organization } = get();
    try {
      const data = {
        name: name,
        created_by: user.user_id,
      };
      await pb.collection("Organisation").update(organization.id, data);
      set({ organization: { ...organization, name: name } });
      return { success: true };
    } catch (error) {
      console.error("Error updating organization name:", error);
      throw error;
    }
  },

  updateOrgLogo: async (formData) => {
    const { user, organization } = get();
    try {
      const logo = formData.get("logo");
      const data = {
        logo: logo,
        name: organization.name,
        created_by: user.user_id,
      };
      const updatedOrg = await pb
        .collection("Organisation")
        .update(organization.id, data);
      set({ organization: { ...organization, logo: updatedOrg.logo } });
      return { success: true };
    } catch (error) {
      console.error("Error updating organization logo:", error);
      throw error;
    }
  },

  // Create member invite
  createMemberInvite: async (email) => {
    try {
      const { organization } = get();

      // Create invite record
      const record = await pb
        .collection("users")
        .getFirstListItem(`email="${email.trim()}"`);

      if (!record) {
        throw new Error("User not found");
      }
      const invite = await pb.collection("OrganisationMembers").create({
        organisation: organization.id,  
        member: record.id,
        role: "member",
        status: "pending",
      });

      return { success: true, data: invite };
    } catch (error) {
      console.error("Error creating member invite:", error);
      throw error;
    }
  },

  // Refresh organization data
  refreshOrganization: async () => {
    const { user } = get();
    if (user?.organisation_id) {
      try {
        const organization = await pb
          .collection("Organisation")
          .getOne(user.organisation_id);

        // Fetch member count
        const members = await pb
          .collection("OrganisationMembers")
          .getList(1, 1, {
            filter: `organisation = "${user.organisation_id}" && status = "active"`,
          });
        organization.memberCount = members.totalItems;

        set({ organization });
      } catch (error) {
        console.error("Error refreshing organization:", error);
      }
    }
  },

  logout: async () => {
    set({ loading: true });
    try {
      pb.authStore.clear();
      localStorage.clear();
      set({
        user: null,
        organization: null,
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
