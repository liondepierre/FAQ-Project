import { WebPartContext } from "@microsoft/sp-webpart-base";
import { spfi, SPFI, SPFx } from "@pnp/sp";
import { Category } from "../webparts/models/Category";
import { FAQ } from "../webparts/models/FAQ";

export interface ICategoryProvider {
  getCategory(): Promise<Category[]>;
}

export class CategoryProvider implements ICategoryProvider {
    private _sp: SPFI;
    private categoryListId: string;


    constructor(context: WebPartContext, categoryListId: string){
        this._sp = spfi().using(SPFx(context));
        this.categoryListId = categoryListId;
    }

    public async getCategory(): Promise<Category[]>{
      let result: Category[] = await this._sp.web.lists.getById(this.categoryListId).items();  
    
      return result;
    } 
}

