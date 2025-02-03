import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AnalysisCard } from "./AnalysisCard";
import { Badge } from "@/components/ui/badge";

interface Link {
  url: string;
  text: string;
  type: "internal" | "external";
}

interface LinksTableProps {
  links: Link[];
}

export const LinksTable = ({ links }: LinksTableProps) => {
  const internalLinks = links.filter(link => link.type === "internal");
  const externalLinks = links.filter(link => link.type === "external");

  return (
    <AnalysisCard title="Links Analysis">
      <div className="space-y-4">
        <div className="flex gap-4">
          <Badge variant="outline" className="px-2 py-1">
            Internal Links: {internalLinks.length}
          </Badge>
          <Badge variant="outline" className="px-2 py-1">
            External Links: {externalLinks.length}
          </Badge>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Text</TableHead>
                <TableHead>URL</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {links.map((link, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Badge 
                      variant={link.type === "internal" ? "default" : "secondary"}
                      className="capitalize"
                    >
                      {link.type}
                    </Badge>
                  </TableCell>
                  <TableCell>{link.text}</TableCell>
                  <TableCell className="text-muted-foreground font-mono text-sm">
                    {link.url}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </AnalysisCard>
  );
};