import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AnalysisCard } from "./AnalysisCard";

interface Link {
  url: string;
  text: string;
  type: "internal" | "external";
}

interface LinksTableProps {
  links: Link[];
}

export const LinksTable = ({ links }: LinksTableProps) => {
  return (
    <AnalysisCard title="Links Analysis">
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
                <TableCell className="font-medium capitalize">{link.type}</TableCell>
                <TableCell>{link.text}</TableCell>
                <TableCell className="text-muted-foreground">{link.url}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </AnalysisCard>
  );
};