import { Category } from "./Category";
import { SubCategory } from "./SubCategory";
import { TargetGroup } from "./TargetGroup";

export interface FAQ {
    ID?: number;
    Question: string;
    Answer: string;
    FAQ_CategoryId: number[];
    FAQ_Category?: Category[];
    FAQ_SubCategoryId: number[];
    FAQ_SubCategory?: { Title: string, SubCategoryColor: string }[]; //SubCategory[];
    // targetGroup?: TargetGroup[];
    Audience_TargetId: number[];    
}

