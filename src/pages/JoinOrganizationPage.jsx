import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Users, CheckCircle } from "lucide-react";
import useAuthStore from "@/store/authStore";

const JoinOrganizationPage = () => {
  const [inviteCode, setInviteCode] = useState("");
  const [organizationId, setOrganizationId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const { joinOrganization } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inviteCode.trim()) {
      setError("Please enter an invite code");
      return;
    }
    if (!organizationId.trim()) {
      setError("Please enter an organization ID");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await joinOrganization(
        organizationId.trim(),
        inviteCode.trim().toLowerCase()
      );
      setSuccess(true);
      // Redirect to dashboard after successful join
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    } catch (error) {
      setError("Invalid invite code. Please check and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate("/organization-selection");
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted">
        <Card className="max-w-sm w-full p-8 text-center">
          <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Welcome to the team!</h2>
          <p className="text-muted-foreground mb-4">
            You've successfully joined the organization. Redirecting to your
            dashboard...
          </p>
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted">
      <div className="max-w-sm w-full">
        <Card className="p-6">
          <div className="flex items-center mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="mr-2 p-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="h-4 w-4 text-blue-600" />
            </div>
            <h1 className="ml-3 text-xl font-semibold">Join Organization</h1>
          </div>

          <p className="text-muted-foreground mb-6">
            Enter the organization ID and invite code you received to join an
            existing organization.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="organizationId">Organization ID</Label>
              <Input
                id="organizationId"
                type="text"
                placeholder="Enter organization ID"
                value={organizationId}
                onChange={(e) => setOrganizationId(e.target.value)}
                className="w-full"
                required
              />
              <p className="text-xs text-muted-foreground">
                The unique identifier for the organization
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="inviteCode">Invite Code</Label>
              <Input
                id="inviteCode"
                type="text"
                placeholder="Enter invite code (e.g., ABC123)"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                className="w-full text-center font-mono text-lg tracking-wider"
                maxLength={8}
                required
              />
              <p className="text-xs text-muted-foreground">
                The invite code is usually 6-8 characters long
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={loading || !inviteCode.trim() || !organizationId.trim()}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Joining...
                </>
              ) : (
                "Join Organization"
              )}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t">
            <p className="text-sm text-muted-foreground text-center">
              Don't have an invite code?{" "}
              <button
                onClick={handleBack}
                className="text-primary hover:underline"
              >
                Create your own organization
              </button>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default JoinOrganizationPage;
