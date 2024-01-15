import { WebPartContext } from "@microsoft/sp-webpart-base";
import { spfi, SPFI, SPFx } from "@pnp/sp";
import { SubCategory } from "../webparts/models/SubCategory";

export interface ISubCategoryProvider {
    getSubCategory(): Promise<SubCategory[]>;
}

export class SubCategoryProvider implements ISubCategoryProvider {
    private _sp: SPFI;
    private subCategoryListId: string;

    constructor(context: WebPartContext, subCategoryListId) {
        this._sp = spfi().using(SPFx(context));
        this.subCategoryListId = subCategoryListId;
    }

    public async getSubCategory(): Promise<SubCategory[]> {
       let result: SubCategory[] = await this._sp.web.lists.getById(this.subCategoryListId).items();
    //    let result: SubCategory[] = await this._sp.web.lists.getById(this.faqListId).items.expand("CategoryColor").select("*")();

       
       return result;
    }
}

