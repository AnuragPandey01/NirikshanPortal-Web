import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Building2, Users, Plus, ArrowRight } from "lucide-react";

const OrganizationSelectionPage = () => {
  const [selectedOption, setSelectedOption] = useState(null);

  const handleJoinOrg = () => {
    // Navigate to join organization page
    window.location.href = "/join-organization";
  };

  const handleCreateOrg = () => {
    // Navigate to create organization page
    window.location.href = "/create-organization";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted">
      <div className="max-w-md w-full px-6">
        <div className="text-center mb-8">
          <div className="h-12 w-12 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4">
            <Building2 className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight mb-2">
            Welcome to Nirikshan Portal
          </h1>
          <p className="text-muted-foreground">
            Choose how you'd like to get started
          </p>
        </div>

        <div className="space-y-4">
          <Card
            className={`p-6 cursor-pointer transition-all hover:shadow-md ${
              selectedOption === "join" ? "ring-2 ring-primary" : ""
            }`}
            onClick={() => setSelectedOption("join")}
          >
            <div className="flex items-start space-x-4">
              <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-2">Join an Organization</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Enter an invite code to join an existing organization and
                  start collaborating with your team.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleJoinOrg();
                  }}
                  className="w-full"
                >
                  Join Organization
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>

          <Card
            className={`p-6 cursor-pointer transition-all hover:shadow-md ${
              selectedOption === "create" ? "ring-2 ring-primary" : ""
            }`}
            onClick={() => setSelectedOption("create")}
          >
            <div className="flex items-start space-x-4">
              <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Plus className="h-5 w-5 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-2">Create New Organization</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Start fresh by creating your own organization and invite team
                  members to collaborate.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCreateOrg();
                  }}
                  className="w-full"
                >
                  Create Organization
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            You can always change your organization settings later
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrganizationSelectionPage;
