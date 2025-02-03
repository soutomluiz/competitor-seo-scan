import { Card } from "@/components/ui/card";

interface AnalysisCardProps {
  title: string;
  children: React.ReactNode;
}

export const AnalysisCard = ({ title, children }: AnalysisCardProps) => {
  return (
    <Card className="overflow-hidden backdrop-blur-sm bg-white/50 border-2 transition-all duration-300 hover:shadow-lg">
      <div className="p-6">
        <h3 className="text-xl font-semibold mb-4">{title}</h3>
        {children}
      </div>
    </Card>
  );
};