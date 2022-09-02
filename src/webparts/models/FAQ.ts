import { Category } from "./Category";

export interface FAQ {
    ID?: number;
    Question: string;
    Answer: string;
    FAQ_CategoryId: number[];
    FAQ_Category?: Category[];
}