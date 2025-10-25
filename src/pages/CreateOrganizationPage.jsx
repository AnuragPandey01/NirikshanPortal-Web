import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Plus, CheckCircle } from "lucide-react";
import useAuthStore from "@/store/authStore";

const CreateOrganizationPage = () => {
  const [orgName, setOrgName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const { createOrganization } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!orgName.trim()) {
      setError("Please enter an organization name");
      return;
    }

    if (orgName.trim().length < 2) {
      setError("Organization name must be at least 2 characters long");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await createOrganization(orgName.trim());
      setSuccess(true);
      // Redirect to dashboard after successful creation
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    } catch (error) {
      setError("Failed to create organization. Please try again.");
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
          <h2 className="text-xl font-semibold mb-2">Organization Created!</h2>
          <p className="text-muted-foreground mb-4">
            Your organization "{orgName}" has been created successfully. You're
            now the admin.
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
            <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center">
              <Plus className="h-4 w-4 text-green-600" />
            </div>
            <h1 className="ml-3 text-xl font-semibold">Create Organization</h1>
          </div>

          <p className="text-muted-foreground mb-6">
            Create a new organization and become the admin. You can invite team
            members later.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="orgName">Organization Name</Label>
              <Input
                id="orgName"
                type="text"
                placeholder="Enter organization name"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                className="w-full"
                maxLength={50}
                required
              />
              <p className="text-xs text-muted-foreground">
                Choose a name that represents your team or company
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
              disabled={loading || !orgName.trim()}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                "Create Organization"
              )}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t">
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
              <h4 className="text-sm font-medium text-blue-900 mb-1">
                What happens next?
              </h4>
              <ul className="text-xs text-blue-700 space-y-1">
                <li>• You'll become the organization admin</li>
                <li>• You can invite team members</li>
                <li>• You'll get full access to all features</li>
              </ul>
            </div>
          </div>

          <div className="mt-4">
            <p className="text-sm text-muted-foreground text-center">
              Already have an organization?{" "}
              <button
                onClick={handleBack}
                className="text-primary hover:underline"
              >
                Join with invite code
              </button>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default CreateOrganizationPage;
