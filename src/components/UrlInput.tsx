import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

interface UrlInputProps {
  onAnalyze: (url: string) => void;
  isLoading: boolean;
}

export const UrlInput = ({ onAnalyze, isLoading }: UrlInputProps) => {
  const [url, setUrl] = useState("");
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) {
      toast({
        title: "Error",
        description: "Please enter a URL to analyze",
        variant: "destructive",
      });
      return;
    }
    
    try {
      new URL(url);
      onAnalyze(url);
    } catch {
      toast({
        title: "Error",
        description: "Please enter a valid URL",
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-3xl mx-auto space-y-4">
      <div className="relative">
        <Input
          type="url"
          placeholder="Enter website URL (e.g., https://example.com)"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="h-14 px-6 text-lg bg-white/50 backdrop-blur-sm border-2 transition-all duration-300"
          disabled={isLoading}
        />
      </div>
      <Button
        type="submit"
        disabled={isLoading}
        className="w-full h-12 text-lg font-medium transition-all duration-300 bg-primary hover:bg-primary/90"
      >
        {isLoading ? "Analyzing..." : "Analyze SEO"}
      </Button>
    </form>
  );
};