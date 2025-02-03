import { AnalysisCard } from "./AnalysisCard";

interface SeoMetricsProps {
  title: string;
  description: string;
  pageCount: number;
}

export const SeoMetrics = ({ title, description, pageCount }: SeoMetricsProps) => {
  return (
    <AnalysisCard title="SEO Overview">
      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium text-muted-foreground">Page Title</h4>
          <p className="mt-1 text-lg">{title}</p>
        </div>
        <div>
          <h4 className="text-sm font-medium text-muted-foreground">Meta Description</h4>
          <p className="mt-1">{description}</p>
        </div>
        <div>
          <h4 className="text-sm font-medium text-muted-foreground">Pages Analyzed</h4>
          <p className="mt-1 text-lg font-semibold">{pageCount}</p>
        </div>
      </div>
    </AnalysisCard>
  );
};