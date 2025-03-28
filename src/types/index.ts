export interface Node {
  id: string;
  name: string;
  definition: string;
  createdAt: Date;
  updatedAt: Date;
  tags: { id: string; name: string; color: string }[];
}
