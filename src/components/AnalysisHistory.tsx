import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { FileText, ExternalLink } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export const AnalysisHistory = () => {
  const { data: analyses, isLoading } = useQuery({
    queryKey: ["seo-analyses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("seo_analyses")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) return <div>Loading history...</div>;
  if (!analyses?.length) return null;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold mb-4">Analysis History</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {analyses.map((analysis) => (
          <Card key={analysis.id} className="p-4 space-y-4">
            <div>
              <h3 className="font-medium truncate">{analysis.title || analysis.url}</h3>
              <p className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(analysis.created_at), { addSuffix: true })}
              </p>
            </div>
            <div className="flex gap-2">
              {analysis.report_url && (
                <Button variant="outline" size="sm" asChild>
                  <a href={analysis.report_url} target="_blank" rel="noopener noreferrer">
                    <FileText className="h-4 w-4 mr-2" />
                    View Report
                  </a>
                </Button>
              )}
              <Button variant="outline" size="sm" asChild>
                <a href={analysis.url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Visit Site
                </a>
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};