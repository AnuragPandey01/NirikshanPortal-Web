import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Building2,
  Users,
  Copy,
  Check,
  Upload,
  Save,
  Edit3,
  Mail,
  UserPlus,
} from "lucide-react";
import useAuthStore from "@/store/authStore";

const OrganizationSettingsItem = () => {
  const {
    organization,
    updateOrganization,
    createMemberInvite,
    refreshOrganization,
  } = useAuthStore();
  const [isEditingName, setIsEditingName] = useState(false);
  const [orgName, setOrgName] = useState(organization?.name || "");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const fileInputRef = useRef(null);

  const handleNameSave = async () => {
    if (!orgName.trim()) {
      setError("Organization name cannot be empty");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await updateOrganization(organization.id, { name: orgName.trim() });
      setIsEditingName(false);
      setSuccess("Organization name updated successfully");
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      setError("Failed to update organization name");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      // 5MB limit
      setError("Image size must be less than 5MB");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("logo", file);

      await updateOrganization(organization.id, formData);
      await refreshOrganization();
      setSuccess("Organization logo updated successfully");
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      setError("Failed to update organization logo");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInvite = async () => {
    if (!inviteEmail.trim()) {
      setError("Please enter an email address");
      return;
    }

    setInviteLoading(true);
    setError("");

    try {
      const result = await createMemberInvite(inviteEmail.trim());
      setInviteCode(result.data.id);
      setInviteEmail("");
      setSuccess("Invite created successfully");
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      setError("Failed to create invite. Please try again.");
    } finally {
      setInviteLoading(false);
    }
  };

  const copyInviteCode = () => {
    navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Status Messages */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-600">{success}</p>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Organization Overview */}
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-6 flex items-center">
              <Building2 className="h-5 w-5 mr-2" />
              Organization Overview
            </h3>

            <div className="space-y-6">
              {/* Organization Logo */}
              <div className="flex items-start space-x-4">
                <div className="relative">
                  {organization?.logo ? (
                    <img
                      src={`https://nirikshan.anuragpandey.codes/api/files/${organization.collectionId}/${organization.id}/${organization.logo}`}
                      alt="Organization Logo"
                      className="w-20 h-20 rounded-lg object-cover border-2 border-gray-200"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-lg bg-gray-100 border-2 border-gray-200 flex items-center justify-center">
                      <Building2 className="h-10 w-10 text-gray-400" />
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">
                    Organization Logo
                  </h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={loading}
                    className="flex items-center mb-2"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {loading ? "Uploading..." : "Change Logo"}
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    PNG, JPG up to 5MB. Recommended size: 200x200px
                  </p>
                </div>
              </div>

              {/* Organization Name */}
              <div>
                <Label
                  htmlFor="orgName"
                  className="text-sm font-medium text-gray-900"
                >
                  Organization Name
                </Label>
                <div className="mt-2 flex items-center space-x-2">
                  {isEditingName ? (
                    <>
                      <Input
                        id="orgName"
                        value={orgName}
                        onChange={(e) => setOrgName(e.target.value)}
                        className="flex-1"
                        placeholder="Enter organization name"
                      />
                      <Button
                        size="sm"
                        onClick={handleNameSave}
                        disabled={loading}
                        className="flex items-center"
                      >
                        <Save className="h-4 w-4 mr-1" />
                        {loading ? "Saving..." : "Save"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setIsEditingName(false);
                          setOrgName(organization?.name || "");
                        }}
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <>
                      <Input
                        id="orgName"
                        value={organization?.name || ""}
                        disabled
                        className="flex-1"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditingName(true)}
                        className="flex items-center"
                      >
                        <Edit3 className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* Organization ID */}
              <div>
                <Label
                  htmlFor="orgId"
                  className="text-sm font-medium text-gray-900"
                >
                  Organization ID
                </Label>
                <div className="mt-2 flex items-center space-x-2">
                  <Input
                    id="orgId"
                    value={organization?.id || ""}
                    disabled
                    className="flex-1 font-mono text-sm bg-gray-50"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(organization?.id || "");
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="flex items-center"
                  >
                    {copied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Unique identifier for your organization
                </p>
              </div>
            </div>
          </Card>

          {/* Member Statistics */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Member Statistics
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {organization?.memberCount || 0}
                </div>
                <div className="text-sm text-blue-800">Active Members</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {organization?.memberCount || 0}
                </div>
                <div className="text-sm text-green-800">Total Members</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column - Member Invite Section */}
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-6 flex items-center">
              <UserPlus className="h-5 w-5 mr-2" />
              Invite New Members
            </h3>

            <div className="space-y-6">
              <div>
                <Label
                  htmlFor="inviteEmail"
                  className="text-sm font-medium text-gray-900"
                >
                  Member Email Address
                </Label>
                <div className="mt-2 flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <Input
                    id="inviteEmail"
                    type="email"
                    placeholder="Enter member's email address"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleCreateInvite}
                    disabled={inviteLoading || !inviteEmail.trim()}
                    className="flex items-center"
                  >
                    {inviteLoading ? "Creating..." : "Create Invite"}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Enter the email address of the person you want to invite
                </p>
              </div>

              {inviteCode && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <Label
                    htmlFor="inviteCode"
                    className="text-sm font-medium text-gray-900"
                  >
                    Generated Invite Code
                  </Label>
                  <div className="mt-2 flex items-center space-x-2">
                    <Input
                      id="inviteCode"
                      value={inviteCode}
                      disabled
                      className="flex-1 font-mono text-sm bg-white"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={copyInviteCode}
                      className="flex items-center"
                    >
                      {copied ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <p className="text-xs text-blue-700">
                      <strong>Instructions:</strong> Share this invite code with
                      the member. They can use it to join your organization
                      through the join page.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Quick Actions */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => refreshOrganization()}
              >
                <Users className="h-4 w-4 mr-2" />
                Refresh Member Count
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => {
                  navigator.clipboard.writeText(organization?.id || "");
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy Organization ID
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OrganizationSettingsItem;
